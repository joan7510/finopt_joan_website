const SAMPLE_DATA = `date,customer,product,sales_amount
2026-01-05,Atlas Co,Advisory,18200
2026-01-05,Northline,Analytics,31600
2026-01-05,Copper Bay,Automation,22400
2026-01-12,Atlas Co,Advisory,25400
2026-01-12,Northline,Analytics,23800
2026-01-12,Copper Bay,Automation,42100
2026-01-19,Atlas Co,Advisory,14900
2026-01-19,Northline,Analytics,39200
2026-01-19,Copper Bay,Automation,27600
2026-01-26,Atlas Co,Advisory,33800
2026-01-26,Northline,Analytics,28100
2026-01-26,Copper Bay,Automation,18500
2026-02-02,Atlas Co,Advisory,21700
2026-02-02,Northline,Analytics,47600
2026-02-02,Copper Bay,Automation,35200
2026-02-09,Atlas Co,Advisory,40100
2026-02-09,Northline,Analytics,33200
2026-02-09,Copper Bay,Automation,49800`;

const fileInput = document.querySelector("#fileInput");
const fileLabel = document.querySelector("#fileLabel");
const sampleButton = document.querySelector("#sampleButton");
const statusPanel = document.querySelector("#statusPanel");
const mappingPanel = document.querySelector("#mappingPanel");
const dateColumnSelect = document.querySelector("#dateColumnSelect");
const amountColumnSelect = document.querySelector("#amountColumnSelect");
const productColumnSelect = document.querySelector("#productColumnSelect");
const applyColumnsButton = document.querySelector("#applyColumnsButton");
const resultsPanel = document.querySelector("#resultsPanel");
const totalSalesElement = document.querySelector("#totalSales");
const rowsUsedElement = document.querySelector("#rowsUsed");
const averageSaleElement = document.querySelector("#averageSale");
const dateRangeElement = document.querySelector("#dateRange");
const trendNote = document.querySelector("#trendNote");
const productNote = document.querySelector("#productNote");
const forecastNote = document.querySelector("#forecastNote");
const salesChart = document.querySelector("#salesChart");
const productChart = document.querySelector("#productChart");
const forecastChart = document.querySelector("#forecastChart");
const productRows = document.querySelector("#productRows");
const forecastRows = document.querySelector("#forecastRows");

let parsedData = null;

function setStatus(message, tone = "") {
  statusPanel.textContent = message;
  statusPanel.className = `status-panel ${tone}`.trim();
}

function parseDelimited(text) {
  const delimiter = detectDelimiter(text);
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      row.push(field.trim());
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim()) || "";
  const options = [",", "\t", ";", "|"];
  return options
    .map((delimiter) => ({ delimiter, count: firstLine.split(delimiter).length }))
    .sort((a, b) => b.count - a.count)[0].delimiter;
}

function normaliseHeader(value, index) {
  const cleaned = String(value || "").trim();
  return cleaned || `Column ${index + 1}`;
}

function parseFileText(text) {
  const rows = parseDelimited(text);
  if (rows.length < 2) {
    throw new Error("The file needs a header row and at least one data row.");
  }

  const headers = rows[0].map(normaliseHeader);
  const records = rows.slice(1).map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? "";
    });
    return record;
  });

  return { headers, records };
}

function detectColumns(headers, records) {
  const dateWords = ["date", "week", "month", "period", "invoice date", "order date", "sales date"];
  const amountWords = ["sales", "sale", "amount", "revenue", "total", "value", "price", "income"];
  const productWords = ["product", "sku", "item", "service", "category", "plan", "solution"];

  const scored = headers.map((header) => {
    const lower = header.toLowerCase();
    const sampleValues = records.slice(0, 25).map((record) => record[header]);
    const dateScore = sampleValues.filter((value) => parseDate(value)).length + (dateWords.some((word) => lower.includes(word)) ? 20 : 0);
    const amountScore = sampleValues.filter((value) => Number.isFinite(parseAmount(value))).length + (amountWords.some((word) => lower.includes(word)) ? 20 : 0);
    const textValues = sampleValues.filter((value) => String(value || "").trim() && !Number.isFinite(parseAmount(value)) && !parseDate(value));
    const productScore = textValues.length + (productWords.some((word) => lower.includes(word)) ? 20 : 0);
    return { header, dateScore, amountScore, productScore };
  });

  return {
    dateColumn: [...scored].sort((a, b) => b.dateScore - a.dateScore)[0]?.header || headers[0],
    amountColumn: [...scored].sort((a, b) => b.amountScore - a.amountScore)[0]?.header || headers[0],
    productColumn: [...scored].sort((a, b) => b.productScore - a.productScore)[0]?.header || ""
  };
}

function parseDate(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (!match) return null;

  const first = Number(match[1]);
  const second = Number(match[2]);
  const year = Number(match[3].length === 2 ? `20${match[3]}` : match[3]);
  const day = first > 12 ? first : second;
  const month = first > 12 ? second : first;
  const fallback = new Date(year, month - 1, day);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function parseAmount(value) {
  const cleaned = String(value || "")
    .replace(/[$£€,]/g, "")
    .replace(/\((.*)\)/, "-$1")
    .trim();
  if (!cleaned) return NaN;
  const amount = Number(cleaned);
  return Number.isFinite(amount) ? amount : NaN;
}

function populateSelectors(headers, detected) {
  dateColumnSelect.innerHTML = "";
  amountColumnSelect.innerHTML = "";
  productColumnSelect.innerHTML = "";

  dateColumnSelect.appendChild(new Option("No date column", ""));
  productColumnSelect.appendChild(new Option("No product column", ""));

  headers.forEach((header) => {
    dateColumnSelect.appendChild(new Option(header, header));
    amountColumnSelect.appendChild(new Option(header, header));
    productColumnSelect.appendChild(new Option(header, header));
  });

  dateColumnSelect.value = detected.dateColumn;
  amountColumnSelect.value = detected.amountColumn;
  productColumnSelect.value = detected.productColumn;
}

function analyseData() {
  if (!parsedData) return;

  const dateColumn = dateColumnSelect.value;
  const amountColumn = amountColumnSelect.value;
  const productColumn = productColumnSelect.value;
  const rows = parsedData.records
    .map((record) => ({
      date: dateColumn ? parseDate(record[dateColumn]) : null,
      product: productColumn ? String(record[productColumn] || "Unknown").trim() || "Unknown" : "",
      amount: parseAmount(record[amountColumn])
    }))
    .filter((row) => Number.isFinite(row.amount));

  if (!rows.length) {
    setStatus("No numeric sales amount values were found. Please choose a different amount column.", "error");
    resultsPanel.hidden = true;
    return;
  }

  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const datedRows = rows.filter((row) => row.date);
  const periodType = choosePeriodType(datedRows);
  const series = buildPeriodSeries(datedRows, periodType);
  const movement = buildPeriodMovement(series);
  const forecast = series.length >= 2 ? forecastSales(series, 6, periodType) : [];
  const products = productColumn ? buildProductSummary(rows, datedRows) : [];

  totalSalesElement.textContent = formatCurrency(total);
  rowsUsedElement.textContent = String(rows.length);
  averageSaleElement.textContent = formatCurrency(total / rows.length);
  dateRangeElement.textContent = datedRows.length ? formatDateRange(datedRows) : "Not found";
  trendNote.textContent = datedRows.length ? `${series.length} ${periodType === "week" ? "weekly" : "monthly"} periods` : "No date column detected";
  forecastNote.textContent = forecast.length ? `Next 6 ${periodType === "week" ? "weeks" : "months"}` : `Need at least 2 ${periodType === "week" ? "weekly" : "monthly"} periods`;
  productNote.textContent = products.length ? `${products.length} products ranked` : "No product column detected";

  drawTrendChart(salesChart, series, movement, periodType);
  drawProductChart(productChart, products);
  drawLineChart(forecastChart, [...series.slice(-6), ...forecast], { color: "#11423b", forecastStart: series.slice(-6).length, periodType });
  renderProductRows(products);
  renderForecastRows(forecast, periodType);

  resultsPanel.hidden = false;
  setStatus(`Analysed ${rows.length} rows using "${amountColumn}"${dateColumn ? `, "${dateColumn}"` : ""}${productColumn ? ` and "${productColumn}"` : ""}.`, "success");
}

function choosePeriodType(rows) {
  if (rows.length < 2) return "month";
  const dates = rows.map((row) => row.date).sort((a, b) => a - b);
  const daySpan = (dates[dates.length - 1] - dates[0]) / 86400000;
  return daySpan <= 120 ? "week" : "month";
}

function buildPeriodSeries(rows, periodType) {
  const totals = new Map();
  rows.forEach((row) => {
    const key = periodType === "week" ? toWeekKey(row.date) : toMonthKey(row.date);
    totals.set(key, (totals.get(key) || 0) + row.amount);
  });
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, amount]) => ({ period, amount }));
}

function buildPeriodMovement(series) {
  return series.map((item, index) => {
    if (index === 0) return { period: item.period, movement: 0 };
    const previous = series[index - 1].amount;
    const movement = previous ? ((item.amount - previous) / previous) * 100 : 0;
    return { period: item.period, movement };
  });
}

function buildProductSummary(rows, datedRows) {
  const products = new Map();
  const sortedDates = datedRows.map((row) => row.date).sort((a, b) => a - b);
  const midpoint = sortedDates.length ? sortedDates[Math.floor(sortedDates.length / 2)] : null;

  rows.forEach((row) => {
    if (!products.has(row.product)) {
      products.set(row.product, { product: row.product, total: 0, early: 0, recent: 0 });
    }
    const product = products.get(row.product);
    product.total += row.amount;
    if (row.date && midpoint) {
      if (row.date < midpoint) product.early += row.amount;
      else product.recent += row.amount;
    }
  });

  return [...products.values()]
    .map((product) => ({
      ...product,
      growth: product.early ? ((product.recent - product.early) / product.early) * 100 : null
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);
}

function forecastSales(series, periods, periodType) {
  const points = series.map((item, index) => ({ x: index, y: item.amount }));
  const xMean = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const yMean = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  const numerator = points.reduce((sum, point) => sum + (point.x - xMean) * (point.y - yMean), 0);
  const denominator = points.reduce((sum, point) => sum + (point.x - xMean) ** 2, 0) || 1;
  const slope = numerator / denominator;
  const intercept = yMean - slope * xMean;
  const lastDate = periodType === "week" ? parseWeek(series[series.length - 1].period) : parseMonth(series[series.length - 1].period);

  return Array.from({ length: periods }, (_, index) => {
    const nextDate = periodType === "week"
      ? new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + (index + 1) * 7)
      : new Date(lastDate.getFullYear(), lastDate.getMonth() + index + 1, 1);
    const x = series.length + index;
    return {
      period: periodType === "week" ? toWeekKey(nextDate) : toMonthKey(nextDate),
      amount: Math.max(0, intercept + slope * x),
      forecast: true
    };
  });
}

function toWeekKey(date) {
  const weekStart = startOfWeek(date);
  return `${weekStart.getFullYear()}-W${String(getWeekNumber(weekStart)).padStart(2, "0")}`;
}

function startOfWeek(date) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() - day + 1);
  return copy;
}

function getWeekNumber(date) {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - firstDay) / 86400000);
  return Math.ceil((days + firstDay.getDay() + 1) / 7);
}

function parseWeek(key) {
  const [yearText, weekText] = key.split("-W");
  const year = Number(yearText);
  const week = Number(weekText);
  const firstDay = new Date(year, 0, 1);
  const dayOffset = (week - 1) * 7 - ((firstDay.getDay() || 7) - 1);
  return new Date(year, 0, 1 + dayOffset);
}

function parseMonth(key) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function toMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0
  }).format(value || 0);
}

function formatPercent(value) {
  if (value === null || !Number.isFinite(value)) return "n/a";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatPeriod(key, periodType) {
  if (periodType === "week") {
    const date = parseWeek(key);
    return `Week ${key.split("-W")[1]} (${date.toLocaleDateString("en-AU", { day: "2-digit", month: "short" })})`;
  }
  return parseMonth(key).toLocaleDateString("en-AU", { month: "short", year: "numeric" });
}

function formatDateRange(rows) {
  const dates = rows.map((row) => row.date).sort((a, b) => a - b);
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return `${dates[0].toLocaleDateString("en-AU", options)} - ${dates[dates.length - 1].toLocaleDateString("en-AU", options)}`;
}

function drawTrendChart(canvas, series, movement, periodType) {
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  context.clearRect(0, 0, width, height);

  if (!series.length) {
    drawEmptyChart(context, width, height, "No date-based data available");
    return;
  }

  drawAxes(context, width, height, series.map((item) => item.amount), formatCurrency);
  drawSeriesLine(context, width, height, series, "amount", "#1f6f5c");
  drawMovementLine(context, width, height, movement);
  drawPeriodLabels(context, width, height, series, periodType);
}

function drawLineChart(canvas, data, options) {
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  context.clearRect(0, 0, width, height);

  if (!data.length) {
    drawEmptyChart(context, width, height, "No date-based data available");
    return;
  }

  drawAxes(context, width, height, data.map((item) => item.amount), formatCurrency);
  drawSeriesLine(context, width, height, data, "amount", options.color, options.forecastStart);
  drawPeriodLabels(context, width, height, data, options.periodType || "month");
}

function drawAxes(context, width, height, values, formatter) {
  const padding = chartPadding();
  const plotHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(...values, 1);

  context.strokeStyle = "rgba(11, 43, 38, 0.12)";
  context.lineWidth = 1;
  context.fillStyle = "rgba(22, 32, 29, 0.62)";
  context.font = "13px sans-serif";
  context.textAlign = "left";

  for (let step = 0; step <= 4; step += 1) {
    const y = padding.top + (plotHeight / 4) * step;
    const value = maxValue - (maxValue / 4) * step;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
    context.fillText(formatter(value), 12, y + 4);
  }
}

function drawSeriesLine(context, width, height, data, valueKey, color, forecastStart = 0) {
  const padding = chartPadding();
  const points = chartPoints(width, height, data, data.map((item) => item[valueKey]));

  context.strokeStyle = color;
  context.lineWidth = 3;
  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) context.moveTo(point.x, point.y);
    else context.lineTo(point.x, point.y);
  });
  context.stroke();

  points.forEach((point, index) => {
    context.fillStyle = forecastStart && index >= forecastStart ? "#f7f5f0" : color;
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(point.x, point.y, 5, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  });
}

function drawMovementLine(context, width, height, movement) {
  if (movement.length < 2) return;

  const padding = chartPadding();
  const values = movement.map((item) => item.movement);
  const maxAbs = Math.max(...values.map((value) => Math.abs(value)), 1);
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const zeroY = padding.top + plotHeight / 2;

  context.strokeStyle = "rgba(154, 95, 24, 0.26)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(padding.left, zeroY);
  context.lineTo(width - padding.right, zeroY);
  context.stroke();

  const points = movement.map((item, index) => ({
    x: padding.left + (movement.length === 1 ? 0 : (plotWidth / (movement.length - 1)) * index),
    y: zeroY - (item.movement / maxAbs) * (plotHeight / 2)
  }));

  context.strokeStyle = "#9a5f18";
  context.lineWidth = 2;
  context.setLineDash([6, 5]);
  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) context.moveTo(point.x, point.y);
    else context.lineTo(point.x, point.y);
  });
  context.stroke();
  context.setLineDash([]);

  context.fillStyle = "#9a5f18";
  context.font = "13px sans-serif";
  context.textAlign = "right";
  context.fillText("WoW %", width - 12, padding.top + 12);
  context.textAlign = "left";
}

function chartPoints(width, height, data, values) {
  const padding = chartPadding();
  const maxValue = Math.max(...values, 1);
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  return data.map((item, index) => ({
    x: padding.left + (data.length === 1 ? 0 : (plotWidth / (data.length - 1)) * index),
    y: padding.top + plotHeight - (values[index] / maxValue) * plotHeight,
    item
  }));
}

function drawPeriodLabels(context, width, height, data, periodType) {
  const padding = chartPadding();
  const plotWidth = width - padding.left - padding.right;

  context.fillStyle = "rgba(22, 32, 29, 0.72)";
  context.font = "13px sans-serif";
  context.textAlign = "center";

  data.forEach((item, index) => {
    if (data.length > 8 && index % 2 !== 0 && index !== data.length - 1) return;
    const x = padding.left + (data.length === 1 ? 0 : (plotWidth / (data.length - 1)) * index);
    context.fillText(formatPeriod(item.period, periodType), x, height - 22);
  });

  context.textAlign = "left";
}

function drawProductChart(canvas, products) {
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  context.clearRect(0, 0, width, height);

  if (!products.length) {
    drawEmptyChart(context, width, height, "No product column selected");
    return;
  }

  const padding = { top: 24, right: 96, bottom: 54, left: 150 };
  const plotWidth = width - padding.left - padding.right;
  const barHeight = Math.min(34, (height - padding.top - padding.bottom) / products.length - 10);
  const maxTotal = Math.max(...products.map((product) => product.total), 1);

  context.font = "14px sans-serif";
  products.forEach((product, index) => {
    const y = padding.top + index * (barHeight + 12);
    const barWidth = (product.total / maxTotal) * plotWidth;

    context.fillStyle = "rgba(31, 111, 92, 0.16)";
    context.fillRect(padding.left, y, plotWidth, barHeight);
    context.fillStyle = "#1f6f5c";
    context.fillRect(padding.left, y, barWidth, barHeight);

    context.fillStyle = "#16201d";
    context.textAlign = "right";
    context.fillText(product.product, padding.left - 12, y + barHeight * 0.68);
    context.textAlign = "left";
    context.fillText(formatCurrency(product.total), padding.left + barWidth + 10, y + barHeight * 0.68);

    const growth = formatPercent(product.growth);
    context.fillStyle = product.growth === null ? "rgba(22, 32, 29, 0.55)" : product.growth >= 0 ? "#1f6f5c" : "#9a5f18";
    context.fillText(growth, width - padding.right + 30, y + barHeight * 0.68);
  });

  context.fillStyle = "rgba(22, 32, 29, 0.62)";
  context.font = "12px sans-serif";
  context.fillText("Growth compares recent half vs earlier half of dated sales.", padding.left, height - 18);
}

function chartPadding() {
  return { top: 30, right: 36, bottom: 72, left: 86 };
}

function drawEmptyChart(context, width, height, message) {
  context.fillStyle = "#fbfaf7";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "rgba(22, 32, 29, 0.62)";
  context.font = "18px sans-serif";
  context.textAlign = "center";
  context.fillText(message, width / 2, height / 2);
  context.textAlign = "left";
}

function renderProductRows(products) {
  productRows.innerHTML = "";
  if (!products.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="3">Choose a product column to rank sales by product.</td>`;
    productRows.appendChild(row);
    return;
  }

  products.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${product.product}</td><td>${formatCurrency(product.total)}</td><td>${formatPercent(product.growth)}</td>`;
    productRows.appendChild(row);
  });
}

function renderForecastRows(forecast, periodType) {
  forecastRows.innerHTML = "";
  if (!forecast.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="2">Add at least two dated sales periods to generate a forecast.</td>`;
    forecastRows.appendChild(row);
    return;
  }

  forecast.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${formatPeriod(item.period, periodType)}</td><td>${formatCurrency(item.amount)}</td>`;
    forecastRows.appendChild(row);
  });
}

function handleParsedText(text, label) {
  try {
    parsedData = parseFileText(text);
    const detected = detectColumns(parsedData.headers, parsedData.records);
    populateSelectors(parsedData.headers, detected);
    mappingPanel.hidden = false;
    fileLabel.textContent = label;
    analyseData();
  } catch (error) {
    parsedData = null;
    mappingPanel.hidden = true;
    resultsPanel.hidden = true;
    setStatus(error.message, "error");
  }
}

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  handleParsedText(text, file.name);
});

sampleButton.addEventListener("click", () => {
  handleParsedText(SAMPLE_DATA, "Sample weekly data loaded");
});

applyColumnsButton.addEventListener("click", analyseData);
