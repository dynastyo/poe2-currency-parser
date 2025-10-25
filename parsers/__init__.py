"""
Parsers package for different data sources.
"""

from .ninja_parser import NinjaParser
from .scout_parser import ScoutParser
from .static_parser import StaticParser

__all__ = ['NinjaParser', 'ScoutParser', 'StaticParser']
