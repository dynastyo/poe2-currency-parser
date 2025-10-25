"""
Base parser class that all data source parsers should inherit from.
"""
from abc import ABC, abstractmethod
from typing import List, Tuple, Dict
import requests


class BaseParser(ABC):
    """Abstract base class for all parsers."""
    
    def __init__(self, name: str):
        self.name = name
        self.urls = []
        self.output_format = ""
    
    @abstractmethod
    def get_urls(self) -> List[str]:
        """Return list of URLs to fetch from this source."""
        pass
    
    @abstractmethod
    def get_output_format(self) -> str:
        """Return the output format template for this source."""
        pass
    
    @abstractmethod
    def fetch_and_parse(self, url: str) -> dict:
        """Fetch and parse JSON from the given URL."""
        pass
    
    @abstractmethod
    def calculate_values(self, data: dict, base_value: float, min_value: float) -> List[Tuple[str, str, float]]:
        """
        Calculate item values from the parsed data.
        
        Returns:
            List of tuples: (item_id, item_name, calculated_value)
        """
        pass
    
    @abstractmethod
    def get_base_value(self, data: dict) -> float:
        """Extract the base value (e.g., exalted value) from the data."""
        pass
    
    @abstractmethod
    def extract_section_name(self, url: str) -> str:
        """Extract section name from the URL."""
        pass
    
    def fetch_json_from_url(self, url: str) -> dict:
        """Fetch JSON data from a given URL."""
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
