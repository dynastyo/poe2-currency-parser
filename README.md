# PoE2 Currency Parser

A Flask-based web application to parse and analyze Path of Exile 2 currency values from multiple data sources.

## Features

- **Multi-Source Support**: Parse data from different sources (Poe.Ninja, Scout, etc.)
- **Modular Architecture**: Easy to add new data sources
- **Source Selection**: Choose which data sources to include via checkboxes
- **Configurable Filters**: Set minimum value thresholds
- **Clean Web Interface**: Modern UI with live results
- **Downloadable Results**: Export results as text file

## Project Structure

```
poe2-currency-parser/
├── app.py                          # Main Flask application
├── currency_parser.py              # Legacy standalone parser
├── parsers/                        # Parser modules
│   ├── __init__.py                 # Package initialization
│   ├── base_parser.py              # Abstract base parser class
│   ├── ninja_parser.py             # Poe.Ninja data source parser
│   └── scout_parser.py             # Scout data source parser (template)
├── templates/
│   └── index.html                  # Web interface
├── requirements.txt                # Python dependencies
├── render.yaml                     # Render.com deployment config
└── README.md                       # This file
```

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python app.py
```

3. Open your browser and navigate to `http://localhost:5000`

## Usage

1. Select which data sources to use (checkboxes)
2. Set your desired minimum exalted values:
   - **General**: For items like Fragments, Gems, etc.
   - **Currency**: Specifically for currency items
3. Click "Start Processing"
4. Wait for the results to appear in the console
5. Download the results as a text file

## Adding a New Data Source

To add a new data source, create a new parser in the `parsers/` directory:

1. Create a new file (e.g., `parsers/your_source_parser.py`)
2. Extend the `BaseParser` class
3. Implement required methods:
   - `get_urls()`: Return list of API URLs
   - `get_output_format()`: Return output format template
   - `fetch_and_parse()`: Fetch and parse JSON data
   - `get_base_value()`: Extract base value for calculations
   - `calculate_values()`: Calculate item values
   - `extract_section_name()`: Extract section name from URL

4. Register your parser in `app.py`:
```python
from parsers import YourSourceParser

PARSERS = {
    'ninja': NinjaParser(),
    'scout': ScoutParser(),
    'your_source': YourSourceParser()  # Add your parser here
}
```

## Example: Configuring Scout Parser

Edit `parsers/scout_parser.py` to match your data source's API:

```python
def __init__(self):
    super().__init__("Scout")
    self.output_format = 'Show "{name}" // Value: {value} Ex'
    self.urls = [
        "https://your-scout-api.com/endpoint1",
        "https://your-scout-api.com/endpoint2",
    ]
```

Implement the data parsing logic based on your API's JSON structure.

## Deployment

### Deploy to Render.com

1. Push your code to GitHub
2. Connect your repository to Render
3. Render will automatically detect `render.yaml` and configure the deployment
4. Your app will be available at `https://your-app-name.onrender.com`

### Manual Deployment

The app uses Gunicorn for production deployment:
```bash
gunicorn app:app
```

## Configuration Files

- **render.yaml**: Render.com deployment configuration
- **requirements.txt**: Python package dependencies
- **app.py**: Main application with Flask routes

## API Endpoints

- `GET /`: Main web interface
- `POST /process`: Process selected data sources
  ```json
  {
    "min_value": 10.0,
    "min_value_currency": 1.0,
    "sources": ["ninja", "scout"]
  }
  ```
- `GET /sources`: Get available data sources and their status

## Technologies Used

- **Backend**: Flask, Python 3.11
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Deployment**: Gunicorn, Render.com
- **Data Sources**: RESTful APIs (Poe.Ninja, etc.)
