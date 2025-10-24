from flask import Flask, render_template, request, jsonify
import json
import requests
from typing import Dict, List, Tuple
import re
from io import StringIO

app = Flask(__name__)

# =============================================================================
# CONFIGURATION
# =============================================================================

# Output format template
OUTPUT_FORMAT = '[Type] == "{name}" # [StashItem] == "true" // ExValue = {exalted_value}'

# URLs to fetch from
URLS = [
    "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Currency",
    "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Fragments",
    "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Abyss",
    "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=UncutGems",
    "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=LineageSupportGems",
    "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Essences",
    "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Ultimatum",
    "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Talismans",
    "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Runes",
    "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Ritual",
    "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Expedition",
    "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Delirium",
    "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Breach",
]

# =============================================================================
# CORE FUNCTIONS
# =============================================================================

def fetch_json_from_url(url: str) -> dict:
    """Fetch JSON data from a given URL."""
    response = requests.get(url)
    response.raise_for_status()
    return response.json()


def calculate_exalted_values(data: dict, exalted_divine_value: float = None, min_value: float = 0) -> List[Tuple[str, str, float]]:
    """Calculate exalted values for all items."""
    if exalted_divine_value is None:
        for line in data.get('lines', []):
            if line['id'] == 'exalted':
                exalted_divine_value = line['primaryValue']
                break
    
    if exalted_divine_value is None or exalted_divine_value == 0:
        raise ValueError("Could not find exalted orb value or it's zero")
    
    id_to_name = {}
    for item in data.get('items', []):
        id_to_name[item['id']] = item['name']
    
    results = []
    for line in data.get('lines', []):
        item_id = line['id']
        item_name = id_to_name.get(item_id, item_id)
        divine_value = line['primaryValue']
        exalted_value = divine_value / exalted_divine_value
        
        if exalted_value >= min_value:
            results.append((item_id, item_name, exalted_value))
    
    return results


def extract_section_name_from_url(url: str) -> str:
    """Extract the section name from the overviewName parameter in the URL."""
    match = re.search(r'overviewName=([^&]+)', url)
    if match:
        overview_name = match.group(1)
        section_name = re.sub(r'(?<!^)(?=[A-Z])', ' ', overview_name).upper()
        return section_name
    return "UNKNOWN SECTION"


def create_section_header(section_name: str) -> str:
    """Create a boxed section header."""
    box_width = 85
    line = "/" * box_width
    
    padding = box_width - 4 - len(section_name)
    left_pad = padding // 2
    right_pad = padding - left_pad
    
    header = f"{line}\n"
    header += f"//{' ' * (box_width - 4)}//\n"
    header += f"//{' ' * left_pad}{section_name}{' ' * right_pad}//\n"
    header += f"//{' ' * (box_width - 4)}//\n"
    header += f"{line}\n"
    
    return header


def process_all_urls(min_value: float, min_value_currency: float, log_callback=None):
    """Process all URLs and return formatted output."""
    results_by_section = []
    exalted_divine_value = None
    output = StringIO()
    
    def log(message):
        if log_callback:
            log_callback(message)
        output.write(message + "\n")
    
    log("Currency Exchange Rates (in Exalted Orbs)")
    log("=" * 85)
    log("")
    
    for i, url in enumerate(URLS):
        section_name = extract_section_name_from_url(url)
        
        try:
            log(f"\n[{i+1}/{len(URLS)}] Fetching data from {section_name}...")
            data = fetch_json_from_url(url)
            
            if i == 0:
                log("Extracting exalted base value from currency data...")
                for line in data.get('lines', []):
                    if line['id'] == 'exalted':
                        exalted_divine_value = line['primaryValue']
                        log(f"✓ Exalted base value found: {exalted_divine_value}")
                        break
                
                if exalted_divine_value is None:
                    raise ValueError("First URL must contain exalted currency data!")
            
            log(f"Calculating exalted values using base value: {exalted_divine_value}...")
            
            if section_name == "CURRENCY":
                current_min = min_value_currency
                log(f"Applying minimum value filter: {current_min} Ex (Currency)")
            else:
                current_min = min_value
                log(f"Applying minimum value filter: {current_min} Ex")
            
            results = calculate_exalted_values(data, exalted_divine_value, current_min)
            
            formatted_results = []
            for item_id, item_name, exalted_value in results:
                formatted_line = OUTPUT_FORMAT.format(
                    name=item_name,
                    exalted_value=f"{exalted_value:.2f}"
                )
                formatted_results.append((item_id, item_name, exalted_value, formatted_line))
            
            results_by_section.append((section_name, formatted_results))
            log(f"✓ Processed {len(formatted_results)} items from this URL (after filtering)")
            
        except Exception as e:
            log(f"✗ Error processing {section_name}: {e}")
            if i == 0:
                raise
            continue
    
    log("\n" + "=" * 85)
    log("Generating final output...")
    log("")
    
    # Generate final formatted output
    final_output = StringIO()
    
    total_items = 0
    for section_name, section_results in results_by_section:
        final_output.write(create_section_header(section_name))
        final_output.write("\n")
        
        for item_id, item_name, exalted_value, formatted_line in section_results:
            final_output.write(f"{formatted_line}\n")
            total_items += 1
        
        final_output.write("\n")
    
    log(f"✓ Success! Total items processed: {total_items}")
    log("=" * 85)
    
    return final_output.getvalue(), output.getvalue()


# =============================================================================
# FLASK ROUTES
# =============================================================================

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/process', methods=['POST'])
def process():
    try:
        data = request.get_json()
        min_value = float(data.get('min_value', 10))
        min_value_currency = float(data.get('min_value_currency', 1))
        
        logs = []
        
        def log_callback(message):
            logs.append(message)
        
        result, process_log = process_all_urls(min_value, min_value_currency, log_callback)
        
        return jsonify({
            'success': True,
            'result': result,
            'logs': logs
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
