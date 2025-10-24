# PoE2 Currency Parser - Web Application

A web-based tool to fetch and parse Path of Exile 2 currency data from poe.ninja, converting values to Exalted Orbs.

## Features

- 🌐 Web interface with real-time console output
- ⚙️ Configurable minimum exalted values (general and currency-specific)
- 📊 Processes 13 different item categories
- 📥 Download results as a text file
- 🎨 Modern, responsive UI with console-style output

## Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python app.py
```

3. Open your browser to `http://localhost:5000`

## Deploy to Render.com

### Option 1: Using Render Dashboard

1. Create a new account on [Render.com](https://render.com)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository (or use the dashboard to upload files)
4. Configure:
   - **Name**: poe2-currency-parser
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
5. Click "Create Web Service"

### Option 2: Using render.yaml (Infrastructure as Code)

1. Push all files to your GitHub repository
2. On Render dashboard, click "New +" and select "Blueprint"
3. Connect your repository
4. Render will automatically detect `render.yaml` and deploy

## Configuration

Edit the values in the web interface:
- **Minimum Exalted Value (General)**: Filter for Fragments, Abyss, Gems, etc.
- **Minimum Exalted Value (Currency)**: Separate filter for currency items

## File Structure

```
.
├── app.py                 # Flask application (backend)
├── templates/
│   └── index.html        # Web interface (frontend)
├── requirements.txt      # Python dependencies
├── render.yaml          # Render.com deployment configuration
├── currency_parser.py   # Original command-line script
└── README.md           # This file
```

## Usage

1. Open the web application
2. Set your minimum exalted values
3. Click "Start Processing"
4. Watch the console output in real-time
5. Download the results as a text file

## API Endpoint

The application also provides a REST API:

**POST** `/process`
```json
{
  "min_value": 10.0,
  "min_value_currency": 1.0
}
```

**Response**:
```json
{
  "success": true,
  "result": "formatted output...",
  "logs": ["log message 1", "log message 2", ...]
}
```
