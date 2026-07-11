# Sales Summary Tool

Static browser tool for the Lumen Analytics website. Customers can upload a `.csv` or `.txt` sales file and the tool will:

- detect the sales amount column
- detect a date column when one exists
- detect a product column when one exists
- summarise total sales, row count, average sale, and date range
- draw a sales trend chart with week-on-week movement for weekly data
- show top sales by product with total sales and growth rate
- forecast the next 6 periods using a simple linear trend

The forecast is intentionally lightweight for a browser-only website tool. Treat it as a directional planning estimate, not a formal statistical forecast.

## Files

- `index.html` - tool page markup
- `styles.css` - Lumen Analytics-style visual design
- `app.js` - CSV/TXT parsing, summaries, chart drawing, and forecasting

## Data Format

Best input format:

```csv
date,customer,product,sales_amount
2026-01-05,Atlas Co,Advisory,18200
2026-01-12,Atlas Co,Advisory,25400
2026-01-19,Atlas Co,Advisory,14900
```

The parser also accepts tab, semicolon, and pipe-delimited text files.

## Local Test

From this folder:

```bash
python3 -m http.server 8510
```

Open:

```text
http://localhost:8510
```

## Website Integration

Simple option: link to this tool from the Lumen Analytics site:

```html
<a class="btn" href="../sales_summary_tool/index.html">Try the sales summary tool</a>
```

Embedding option: copy the markup from `index.html` into the target page and include:

```html
<link rel="stylesheet" href="sales_summary_tool/styles.css">
<script src="sales_summary_tool/app.js"></script>
```

No backend is required; all processing happens in the customer browser.
