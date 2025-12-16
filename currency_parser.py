import json
import requests
from typing import Dict, List, Tuple

# =============================================================================
# CONFIGURATION - Add your URLs here
# =============================================================================

# Minimum exalted value - only items >= this value will be included
MINIMUM_EXALTED_VALUE = 10  # Change this to your desired minimum
MINIMUM_EXALTED_VALUE_CURRENCY = 1.0  # Minimum value specifically for currency

# Output format template - same for all URLs
# Available variables: {name}, {exalted_value}
OUTPUT_FORMAT = '[Type] == "{name}" # [StashItem] == "true" // ExValue = {exalted_value}'

# IMPORTANT: The first URL MUST be the currency URL that contains the exalted value
# Section name will be extracted from overviewName parameter (e.g., "Currency", "Fragments")
URLS = [
    "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=Currency",
    "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=Fragments",
    "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=Abyss",
    "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=UncutGems",
    "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=LineageSupportGems",
    "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=Essences",
    "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=Ultimatum",
    "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=Talismans",
    "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=Runes",
    "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=Ritual",
    "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=Expedition",
    "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=Delirium",
    "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=Breach",
]
# =============================================================================


def fetch_json_from_url(url: str) -> dict:
    """Fetch JSON data from a given URL."""
    response = requests.get(url)
    response.raise_for_status()
    return response.json()


def calculate_exalted_values(data: dict, exalted_divine_value: float = None, min_value: float = 0) -> List[Tuple[str, str, float]]:
    """
    Calculate exalted values for all items.
    
    Args:
        data: JSON data containing items and their values
        exalted_divine_value: The divine value of exalted orb. If None, will try to find it in data.
        min_value: Minimum exalted value to include (default: 0)
    
    Returns:
        List of tuples: (id, name, exalted_value)
    """
    # If exalted value not provided, try to find it in the data
    if exalted_divine_value is None:
        for line in data.get('lines', []):
            if line['id'] == 'exalted':
                exalted_divine_value = line['primaryValue']
                break
    
    if exalted_divine_value is None or exalted_divine_value == 0:
        raise ValueError("Could not find exalted orb value or it's zero")
    
    # Create a mapping of id to name from items
    id_to_name = {}
    for item in data.get('items', []):
        id_to_name[item['id']] = item['name']
    
    # Calculate exalted value for each item
    results = []
    for line in data.get('lines', []):
        item_id = line['id']
        item_name = id_to_name.get(item_id, item_id)  # Use id if name not found
        divine_value = line['primaryValue']
        
        # Calculate exalted value: item's divine value / exalted's divine value
        exalted_value = divine_value / exalted_divine_value
        
        # Only include items that meet the minimum value threshold
        if exalted_value >= min_value:
            results.append((item_id, item_name, exalted_value))
    
    return results


def create_section_header(section_name: str) -> str:
    """Create a boxed section header."""
    box_width = 85
    line = "/" * box_width
    
    # Center the section name
    padding = box_width - 4 - len(section_name)
    left_pad = padding // 2
    right_pad = padding - left_pad
    
    header = f"{line}\n"
    header += f"//{' ' * (box_width - 4)}//\n"
    header += f"//{' ' * left_pad}{section_name}{' ' * right_pad}//\n"
    header += f"//{' ' * (box_width - 4)}//\n"
    header += f"{line}\n"
    
    return header


def write_to_txt(results_by_section: List[Tuple[str, List[Tuple[str, str, float, str]]]], output_file: str):
    """Write the results to a text file with custom format and section headers."""
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("Currency Exchange Rates (in Exalted Orbs)\n")
        f.write("=" * 85 + "\n\n")
        
        for section_name, section_results in results_by_section:
            # Write section header
            f.write(create_section_header(section_name))
            f.write("\n")
            
            # Write items in this section
            for item_id, item_name, exalted_value, formatted_line in section_results:
                f.write(f"{formatted_line}\n")
            
            # Add spacing between sections
            f.write("\n")


def extract_section_name_from_url(url: str) -> str:
    """Extract the section name from the overviewName parameter in the URL."""
    import re
    match = re.search(r'type=([^&]+)', url)
    if match:
        # Convert CamelCase to UPPER CASE WITH SPACES
        overview_name = match.group(1)
        # Insert space before capital letters and convert to uppercase
        section_name = re.sub(r'(?<!^)(?=[A-Z])', ' ', overview_name).upper()
        return section_name
    return "UNKNOWN SECTION"


def process_all_urls(urls: List[str] = None, output_file: str = "dyno.ipd"):
    """
    Process multiple URLs. First URL must contain exalted currency data.
    
    Args:
        urls: List of URLs to fetch. First URL must be the currency URL.
        output_file: Path to output text file.
    """
    if urls is None or len(urls) == 0:
        urls = URLS
    
    if len(urls) == 0:
        raise ValueError("No URLs configured. Please add URLs to the URLS list in the script.")
    
    results_by_section = []
    exalted_divine_value = None
    
    for i, url in enumerate(urls):
        # Extract section name from URL
        section_name = extract_section_name_from_url(url)
        format_template = OUTPUT_FORMAT
        
        try:
            print(f"\n[{i+1}/{len(urls)}] Fetching data from {url}...")
            data = fetch_json_from_url(url)
            
            # First URL must have exalted value
            if i == 0:
                print("Extracting exalted base value from currency data...")
                for line in data.get('lines', []):
                    if line['id'] == 'exalted':
                        exalted_divine_value = line['primaryValue']
                        print(f"✓ Exalted base value found: {exalted_divine_value}")
                        break
                
                if exalted_divine_value is None:
                    raise ValueError("First URL must contain exalted currency data!")
            
            print(f"Calculating exalted values using base value: {exalted_divine_value}...")
            
            # Use different minimum value for currency (first URL)
            if section_name == "CURRENCY":
                min_value = MINIMUM_EXALTED_VALUE_CURRENCY
                print(f"Applying minimum value filter: {min_value} Ex (Currency)")
            else:
                min_value = MINIMUM_EXALTED_VALUE
                print(f"Applying minimum value filter: {min_value} Ex")
            
            # Pass the exalted_divine_value and minimum value to all URLs
            results = calculate_exalted_values(data, exalted_divine_value, min_value)
            
            # Format each result according to the URL's template
            formatted_results = []
            for item_id, item_name, exalted_value in results:
                formatted_line = format_template.format(
                    name=item_name,
                    exalted_value=f"{exalted_value:.2f}"
                )
                formatted_results.append((item_id, item_name, exalted_value, formatted_line))
            
            results_by_section.append((section_name, formatted_results))
            print(f"✓ Processed {len(formatted_results)} items from this URL (after filtering)")
            
        except requests.exceptions.RequestException as e:
            print(f"✗ Error fetching data from {url}: {e}")
            if i == 0:  # First URL is critical
                raise
            continue
        except Exception as e:
            print(f"✗ Error processing {url}: {e}")
            if i == 0:  # First URL is critical
                raise
            continue
    
    if len(results_by_section) > 0:
        total_items = sum(len(section_results) for _, section_results in results_by_section)
        print(f"\n{'='*85}")
        print(f"Writing all results to {output_file}...")
        write_to_txt(results_by_section, output_file)
        print(f"✓ Success! Results written to {output_file}")
        print(f"✓ Total items processed: {total_items}")
        print(f"{'='*85}\n")
    
    return results_by_section


def main(url: str = None, output_file: str = "dyno.ipd"):
    """
    Main function to fetch, parse, and output currency data.
    
    Args:
        url: URL to fetch JSON from. If None, will use URLs from configuration.
        output_file: Path to output text file.
    """
    # If URL provided, use single URL mode
    if url is not None:
        urls = [url]
        return process_all_urls(urls, output_file)
    
    # Otherwise use configured URLs
    if len(URLS) > 0:
        return process_all_urls(URLS, output_file)
    else:
        # Fallback to interactive mode
        url = input("Enter the URL to fetch JSON from: ").strip()
        return process_all_urls([url], output_file)


if __name__ == "__main__":
    import sys
    
    # Check if URL is provided as command line argument
    if len(sys.argv) > 1:
        url = sys.argv[1]
        output_file = sys.argv[2] if len(sys.argv) > 2 else "dyno.ipd"
        main(url, output_file)
    else:
        main()
