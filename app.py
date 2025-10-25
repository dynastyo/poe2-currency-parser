from flask import Flask, render_template, request, jsonify
import json
from typing import Dict, List, Tuple
from io import StringIO
from parsers import NinjaParser, ScoutParser

app = Flask(__name__)

# =============================================================================
# CONFIGURATION
# =============================================================================

# Initialize parsers
PARSERS = {
    'ninja': NinjaParser(),
    'scout': ScoutParser()
}

# =============================================================================
# CORE FUNCTIONS
# =============================================================================

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


def process_parser(parser, min_value: float, min_value_currency: float, log_callback=None):
    """Process a single parser and return results."""
    results_by_section = []
    base_value = None
    
    def log(message):
        if log_callback:
            log_callback(message)
    
    urls = parser.get_urls()
    
    if not urls:
        log(f"⚠ No URLs configured, skipping...")
        return results_by_section, base_value
    
    log(f"\n{'='*85}")
    log(f"Processing data...")
    log(f"{'='*85}")
    
    for i, url in enumerate(urls):
        section_name = parser.extract_section_name(url)
        
        try:
            log(f"\n[{i+1}/{len(urls)}] Fetching data from {section_name}...")
            data = parser.fetch_and_parse(url)
            
            # First URL must have base value
            if i == 0:
                log(f"Extracting base value from currency data...")
                base_value = parser.get_base_value(data)
                if base_value:
                    log(f"✓ Base value found: {base_value}")
                else:
                    raise ValueError("First URL must contain base value data!")
            
            log(f"Calculating values using base value: {base_value}...")
            
            # Use different minimum value for Ninja currency (first URL for Ninja only)
            if parser.name == "Poe.Ninja" and (section_name == "CURRENCY" or i == 0):
                current_min = min_value_currency
                log(f"Applying minimum value filter: {current_min} Ex (Currency)")
            else:
                current_min = min_value
                log(f"Applying minimum value filter: {current_min} Ex")
            
            results = parser.calculate_values(data, base_value, current_min)
            
            # Format each result according to the parser's template
            formatted_results = []
            output_format = parser.get_output_format()
            for result_tuple in results:
                # Handle different tuple lengths (Ninja: 3 items, Scout: 4 items)
                if len(result_tuple) == 4:
                    # Scout format: (id, name, type, value)
                    item_id, item_name, item_type, calculated_value = result_tuple
                    formatted_line = output_format.format(
                        type=item_type,
                        name=item_name,
                        value=f"{calculated_value:.2f}"
                    )
                else:
                    # Ninja format: (id, name, value)
                    item_id, item_name, calculated_value = result_tuple
                    formatted_line = output_format.format(
                        name=item_name,
                        value=f"{calculated_value:.2f}"
                    )
                formatted_results.append((item_id, item_name, calculated_value, formatted_line))
            
            results_by_section.append((section_name, formatted_results))
            log(f"✓ Processed {len(formatted_results)} items from this URL (after filtering)")
            
        except Exception as e:
            log(f"✗ Error processing {section_name}: {e}")
            if i == 0:  # First URL is critical
                raise
            continue
    
    return results_by_section, base_value


def process_with_categories(ninja_categories: List[str], scout_categories: List[str], min_value: float, min_value_currency: float, log_callback=None):
    """Process selected categories from both parsers and return formatted output."""
    output = StringIO()
    
    def log(message):
        if log_callback:
            log_callback(message)
        output.write(message + "\n")
    
    log("Currency Exchange Rates (in Exalted Orbs)")
    log("=" * 85)
    log("")
    
    all_results = []
    
    # Process Ninja categories
    if ninja_categories:
        ninja_parser = PARSERS['ninja']
        ninja_parser.set_active_categories(ninja_categories)
        
        try:
            results_by_section, base_value = process_parser(
                ninja_parser, min_value, min_value_currency, log_callback=log
            )
            all_results.extend(results_by_section)
        except Exception as e:
            log(f"✗ Error processing Ninja categories: {e}")
            if not scout_categories:  # If no scout categories, this is a critical error
                raise
    
    # Process Scout categories
    if scout_categories:
        scout_parser = PARSERS['scout']
        scout_parser.set_active_categories(scout_categories)
        
        try:
            results_by_section, base_value = process_parser(
                scout_parser, min_value, min_value_currency, log_callback=log
            )
            all_results.extend(results_by_section)
        except Exception as e:
            log(f"✗ Error processing Scout categories: {e}")
            if not ninja_categories:  # If no ninja categories, this is a critical error
                raise
    
    log("\n" + "=" * 85)
    log("Generating final output...")
    log("")
    
    # Generate final formatted output
    final_output = StringIO()
    total_items = 0
    
    for section_name, section_results in all_results:
        final_output.write(create_section_header(section_name))
        final_output.write("\n")
        
        for item_id, item_name, value, formatted_line in section_results:
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
        ninja_categories = data.get('ninja_categories', [])
        scout_categories = data.get('scout_categories', [])
        
        logs = []
        
        def log_callback(message):
            logs.append(message)
        
        result, process_log = process_with_categories(
            ninja_categories, scout_categories, min_value, min_value_currency, log_callback
        )
        
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


@app.route('/categories', methods=['GET'])
def get_categories():
    """Return available categories for all parsers."""
    all_categories = {
        'ninja': [],
        'scout': []
    }
    
    # Get Ninja categories
    ninja_parser = PARSERS['ninja']
    for name, info in ninja_parser.get_categories().items():
        all_categories['ninja'].append({
            'id': name,
            'name': name,
            'required': info['required']
        })
    
    # Get Scout categories
    scout_parser = PARSERS['scout']
    for name, info in scout_parser.get_categories().items():
        all_categories['scout'].append({
            'id': name,
            'name': name,
            'required': info['required']
        })
    
    return jsonify({'categories': all_categories})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
