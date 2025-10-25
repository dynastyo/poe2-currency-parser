"""
Parser for static filter rules that don't require external API data.
"""
from typing import List, Dict


class StaticParser:
    """Parser for static, predefined filter rules."""
    
    def __init__(self):
        self.name = "Static"
        
        # Define all available static categories with individual subcategories
        self.categories = {
            "Splinters": {
                "subcategories": {
                    "Breach Splinter": '[Type] == "Breach Splinter" # [StashItem] == "true"',
                    "Simulacrum Splinter": '[Type] == "Simulacrum Splinter" # [StashItem] == "true"'
                }
            },
            "Waystones": {
                "has_input": True,
                "input_type": "number",
                "input_min": 1,
                "input_max": 16,
                "input_default": 1,
                "input_label": "Min Tier",
                "subcategories": {
                    "Normal Waystones": '[Category] == "Waystone" && [Rarity] == "Normal" && [WaystoneTier] >= "{tier}" # [StashItem] == "true"',
                    "Magic Waystones": '[Category] == "Waystone" && [Rarity] == "Magic" && [WaystoneTier] >= "{tier}" # [StashItem] == "true"',
                    "Rare Waystones": '[Category] == "Waystone" && [Rarity] == "Rare" && [WaystoneTier] >= "{tier}" # [StashItem] == "true"'
                }
            },
            "Special Waystones": {
                "subcategories": {
                    "An Audience with The King": '[Type] == "An Audience with The King" # [StashItem] == "true"',
                    "Expedition Logbook": '[Type] == "Expedition Logbook" # [StashItem] == "true"'
                }
            },
            "Tablets": {
                "subcategories": {
                    "Precursor Tablet": '[Type] == "Precursor Tablet" # [StashItem] == "true"',
                    "Breach Precursor Tablet": '[Type] == "Breach Precursor Tablet" # [StashItem] == "true"',
                    "Expedition Precursor Tablet": '[Type] == "Expedition Precursor Tablet" # [StashItem] == "true"',
                    "Delirium Precursor Tablet": '[Type] == "Delirium Precursor Tablet" # [StashItem] == "true"',
                    "Ritual Precursor Tablet": '[Type] == "Ritual Precursor Tablet" # [StashItem] == "true"',
                    "Overseer Precursor Tablet": '[Type] == "Overseer Precursor Tablet" # [StashItem] == "true"'
                }
            }
        }
    
    def get_categories(self) -> Dict:
        """Return available static categories."""
        return self.categories
    
    def generate_output(self, selected_subcategories: Dict[str, List[str]], waystone_tier: int = 1) -> str:
        """
        Generate output for selected static subcategories.
        
        Args:
            selected_subcategories: Dict mapping category names to lists of selected subcategory names
            waystone_tier: Minimum waystone tier (1-16)
        
        Returns:
            Formatted output string with section headers and rules
        """
        output = []
        
        for category_name, subcategory_names in selected_subcategories.items():
            if category_name not in self.categories or not subcategory_names:
                continue
            
            category = self.categories[category_name]
            
            # Create section header
            header = self.create_section_header(category_name)
            output.append(header)
            output.append("")
            
            # Add selected subcategory rules
            subcategories = category.get("subcategories", {})
            for subcat_name in subcategory_names:
                if subcat_name in subcategories:
                    rule = subcategories[subcat_name]
                    
                    # Apply tier substitution for Waystones
                    if category.get("has_input") and "{tier}" in rule:
                        rule = rule.format(tier=waystone_tier)
                    
                    output.append(rule)
            
            output.append("")
        
        return "\n".join(output)
    
    def create_section_header(self, section_name: str) -> str:
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
        header += f"{line}"
        
        return header
