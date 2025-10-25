"""
Parser for poe2scout.com data source for unique items.
"""
from typing import List, Tuple
import re
from .base_parser import BaseParser


class ScoutParser(BaseParser):
    """Parser for poe2scout.com API for unique items."""
    
    def __init__(self):
        super().__init__("Scout")
        self.output_format = '[Type] == "{type}" && [Rarity] == "Unique" # [UniqueName] == "{name}" && [StashItem] == "true" // ExValue = {value}'
        
        # Define all available categories with their URLs
        self.categories = {
            "Accessories": {
                "url": "https://poe2scout.com/api/items/unique/accessory?page=1&perPage=250&league=Rise%20of%20the%20Abyssal&search=&referenceCurrency=exalted",
                "required": False
            },
            "Armour": {
                "url": "https://poe2scout.com/api/items/unique/armour?page=1&perPage=250&league=Rise%20of%20the%20Abyssal&search=&referenceCurrency=exalted",
                "required": False
            },
            "Jewels": {
                "url": "https://poe2scout.com/api/items/unique/jewel?page=1&perPage=250&league=Rise%20of%20the%20Abyssal&search=&referenceCurrency=exalted",
                "required": False
            },
            "Maps": {
                "url": "https://poe2scout.com/api/items/unique/map?page=1&perPage=250&league=Rise%20of%20the%20Abyssal&search=&referenceCurrency=exalted",
                "required": False
            },
            "Weapons": {
                "url": "https://poe2scout.com/api/items/unique/weapon?page=1&perPage=250&league=Rise%20of%20the%20Abyssal&search=&referenceCurrency=exalted",
                "required": False
            },
             "Sanctum": {
                "url": "https://poe2scout.com/api/items/unique/sanctum?page=1&perPage=250&league=Rise%20of%20the%20Abyssal&search=&referenceCurrency=exalted",
                "required": False
            },
            
        }
        
        self.urls = []
    
    def get_categories(self):
        """Return available categories."""
        return self.categories
    
    def set_active_categories(self, active_categories: List[str]):
        """Set which categories to fetch."""
        self.urls = []
        for category in active_categories:
            if category in self.categories:
                self.urls.append(self.categories[category]["url"])
    
    def get_urls(self) -> List[str]:
        """Return list of URLs to fetch from Scout."""
        return self.urls
    
    def get_output_format(self) -> str:
        """Return the output format template for Scout."""
        return self.output_format
    
    def fetch_and_parse(self, url: str) -> dict:
        """Fetch and parse JSON from Scout."""
        return self.fetch_json_from_url(url)
    
    def get_base_value(self, data: dict) -> float:
        """Scout prices are already in exalted, so base value is 1.0."""
        return 1.0
    
    def calculate_values(self, data: dict, base_value: float, min_value: float) -> List[Tuple[str, str, float]]:
        """
        Calculate values for all items from Scout data.
        
        Args:
            data: JSON data from Scout
            base_value: Base value (always 1.0 for Scout since prices are in exalted)
            min_value: Minimum exalted value to include
        
        Returns:
            List of tuples: (item_id, item_name, item_type, exalted_value)
        """
        results = []
        
        # Scout returns items with currentPrice already in exalted
        for item in data.get('items', []):
            item_id = str(item.get('id', ''))
            item_name = item.get('name', item.get('text', 'Unknown'))
            item_type = item.get('type', 'Unknown')
            exalted_value = item.get('currentPrice', 0)
            
            # Only include items that meet the minimum value threshold
            if exalted_value >= min_value:
                # Return tuple with type included
                results.append((item_id, item_name, item_type, exalted_value))
        
        return results
    
    def extract_section_name(self, url: str) -> str:
        """Extract section name from the URL."""
        # Extract category from URL pattern: /unique/{category}
        match = re.search(r'/unique/([^?]+)', url)
        if match:
            category = match.group(1)
            # Convert to title case with spaces
            return f"UNIQUE {category.upper()}"
        return "UNIQUE ITEMS"
