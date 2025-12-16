"""
Parser for poe.ninja data source.
"""
from typing import List, Tuple
import re
from .base_parser import BaseParser


class NinjaParser(BaseParser):
    """Parser for poe.ninja API."""
    
    def __init__(self):
        super().__init__("Poe.Ninja")
        self.output_format = '[Type] == "{name}" # [StashItem] == "true" // ExValue = {value}'
        
        # Define all available categories with their URLs
        self.categories = {
            "Currency": {
                "url": "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=Currency",
                "required": True
            },
            "Fragments": {
                "url": "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=Fragments",
                "required": False
            },
            "Abyss": {
                "url": "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=Abyss",
                "required": False
            },
            "Uncut Gems": {
                "url": "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=UncutGems",
                "required": False
            },
            "Lineage Support Gems": {
                "url": "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=LineageSupportGems",
                "required": False
            },
            "Essences": {
                "url": "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=Essences",
                "required": False
            },
            "Ultimatum": {
                "url": "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=Ultimatum",
                "required": False
            },
            "Talismans": {
                "url": "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=Talismans",
                "required": False
            },
            "Runes": {
                "url": "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=Runes",
                "required": False
            },
            "Ritual": {
                "url": "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=Ritual",
                "required": False
            },
            "Expedition": {
                "url": "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=Expedition",
                "required": False
            },
            "Delirium": {
                "url": "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=Delirium",
                "required": False
            },
            "Breach": {
                "url": "https://poe.ninja/poe2/api/economy/exchange/current/overview?league=Fate+of+the+Vaal&type=Breach",
                "required": False
            }
        }
        
        self.urls = []
    
    def get_categories(self):
        """Return available categories."""
        return self.categories
    
    def set_active_categories(self, active_categories: List[str]):
        """Set which categories to fetch."""
        self.urls = []
        # Always add Currency first (required)
        if "Currency" in self.categories:
            self.urls.append(self.categories["Currency"]["url"])
        
        # Add selected categories
        for category in active_categories:
            if category in self.categories and category != "Currency":
                self.urls.append(self.categories[category]["url"])
    
    def get_urls(self) -> List[str]:
        """Return list of URLs to fetch from poe.ninja."""
        return self.urls
    
    def get_output_format(self) -> str:
        """Return the output format template for poe.ninja."""
        return self.output_format
    
    def fetch_and_parse(self, url: str) -> dict:
        """Fetch and parse JSON from poe.ninja."""
        return self.fetch_json_from_url(url)
    
    def get_base_value(self, data: dict) -> float:
        """Extract exalted orb value from currency data."""
        for line in data.get('lines', []):
            if line['id'] == 'exalted':
                return line['primaryValue']
        return None
    
    def calculate_values(self, data: dict, exalted_divine_value: float, min_value: float) -> List[Tuple[str, str, float]]:
        """
        Calculate exalted values for all items from poe.ninja data.
        
        Args:
            data: JSON data containing items and their values
            exalted_divine_value: The divine value of exalted orb
            min_value: Minimum exalted value to include
        
        Returns:
            List of tuples: (id, name, exalted_value)
        """
        if exalted_divine_value is None or exalted_divine_value == 0:
            raise ValueError("Invalid exalted orb value")
        
        # Create a mapping of id to name from items
        id_to_name = {}
        for item in data.get('items', []):
            id_to_name[item['id']] = item['name']
        
        # Calculate exalted value for each item
        results = []
        for line in data.get('lines', []):
            item_id = line['id']
            item_name = id_to_name.get(item_id, item_id)
            divine_value = line['primaryValue']
            
            # Calculate exalted value: item's divine value / exalted's divine value
            exalted_value = divine_value / exalted_divine_value
            
            # Only include items that meet the minimum value threshold
            if exalted_value >= min_value:
                results.append((item_id, item_name, exalted_value))
        
        return results
    
    def extract_section_name(self, url: str) -> str:
        """Extract the section name from the overviewName parameter in the URL."""
        match = re.search(r'type=([^&]+)', url)
        if match:
            overview_name = match.group(1)
            # Convert CamelCase to UPPER CASE WITH SPACES
            section_name = re.sub(r'(?<!^)(?=[A-Z])', ' ', overview_name).upper()
            return section_name
        return "UNKNOWN SECTION"
