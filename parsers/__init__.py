"""
Parsers package for different data sources.
"""

from .ninja_parser import NinjaParser
from .scout_parser import ScoutParser

__all__ = ['NinjaParser', 'ScoutParser']
