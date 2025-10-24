import json
import requests
from typing import Dict, List, Tuple

# =============================================================================
# CONFIGURATION - Add your URLs here
# =============================================================================
# IMPORTANT: The first URL MUST be the currency URL that contains the exalted value
URLS = [
    "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Currency",  # MUST BE FIRST - contains exalted base value
    # Add additional URLs below:
    "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Fragments",
     "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Abyss",
]
# =============================================================================


def fetch_json_from_url(url: str) -> dict:
    """Fetch JSON data from a given URL."""
    response = requests.get(url)
    response.raise_for_status()
    return response.json()


def calculate_exalted_values(data: dict, exalted_divine_value: float = None) -> List[Tuple[str, str, float]]:
    """
    Calculate exalted values for all items.
    
    Args:
        data: JSON data containing items and their values
        exalted_divine_value: The divine value of exalted orb. If None, will try to find it in data.
    
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
        
        results.append((item_id, item_name, exalted_value))
    
    return results


def write_to_txt(results: List[Tuple[str, str, float]], output_file: str):
    """Write the results to a text file."""
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("Currency Exchange Rates (in Exalted Orbs)\n")
        f.write("=" * 60 + "\n\n")
        
        for item_id, item_name, exalted_value in results:
            f.write(f"{item_name}: {exalted_value:.10f} Exalted\n")


def process_all_urls(urls: List[str] = None, output_file: str = "currency_exalted_values.txt"):
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
    
    all_results = []
    exalted_divine_value = None
    
    for i, url in enumerate(urls):
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
            # Pass the exalted_divine_value to all subsequent URLs
            results = calculate_exalted_values(data, exalted_divine_value)
            all_results.extend(results)
            print(f"✓ Processed {len(results)} items from this URL")
            
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
    
    if len(all_results) > 0:
        print(f"\n{'='*60}")
        print(f"Writing all results to {output_file}...")
        write_to_txt(all_results, output_file)
        print(f"✓ Success! Results written to {output_file}")
        print(f"✓ Total items processed: {len(all_results)}")
        print(f"{'='*60}\n")
    
    return all_results


def main(url: str = None, output_file: str = "currency_exalted_values.txt"):
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
        output_file = sys.argv[2] if len(sys.argv) > 2 else "currency_exalted_values.txt"
        main(url, output_file)
    else:
        main()
