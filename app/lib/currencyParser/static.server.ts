/**
 * Static parser implementation
 * Generates filter rules from predefined templates (no API calls)
 */

import type { StaticCategoryDefinition, StaticCategoryInfo } from "./types"
import { createSectionHeader } from "./utils"

export class StaticParser {
  private name: string
  private categories: Record<string, StaticCategoryDefinition>

  constructor() {
    this.name = "Static"

    // Define all available static categories with their subcategories
    this.categories = {
      Splinters: {
        subcategories: {
          "Breach Splinter": "[Type] == \"Breach Splinter\" # [StashItem] == \"true\"",
          "Simulacrum Splinter": "[Type] == \"Simulacrum Splinter\" # [StashItem] == \"true\"",
        },
      },
      Waystones: {
        hasInput: true,
        inputType: "number",
        inputMin: 1,
        inputMax: 16,
        inputDefault: 1,
        inputLabel: "Min Tier",
        subcategories: {
          "Normal Waystones":
            "[Category] == \"Waystone\" && [Rarity] == \"Normal\" && [WaystoneTier] >= \"{tier}\" # [StashItem] == \"true\"",
          "Magic Waystones":
            "[Category] == \"Waystone\" && [Rarity] == \"Magic\" && [WaystoneTier] >= \"{tier}\" # [StashItem] == \"true\"",
          "Rare Waystones":
            "[Category] == \"Waystone\" && [Rarity] == \"Rare\" && [WaystoneTier] >= \"{tier}\" # [StashItem] == \"true\"",
        },
      },
      "Special Waystones": {
        subcategories: {
          "An Audience with the King":
            "[Type] == \"An Audience with the King\" # [StashItem] == \"true\"",
          "Expedition Logbook": "[Type] == \"Expedition Logbook\" # [StashItem] == \"true\"",
        },
      },
      Tablets: {
        subcategories: {
          "Precursor Tablet": "[Type] == \"Precursor Tablet\" # [StashItem] == \"true\"",
          "Breach Precursor Tablet": "[Type] == \"Breach Precursor Tablet\" # [StashItem] == \"true\"",
          "Expedition Precursor Tablet":
            "[Type] == \"Expedition Precursor Tablet\" # [StashItem] == \"true\"",
          "Delirium Precursor Tablet":
            "[Type] == \"Delirium Precursor Tablet\" # [StashItem] == \"true\"",
          "Ritual Precursor Tablet": "[Type] == \"Ritual Precursor Tablet\" # [StashItem] == \"true\"",
          "Overseer Precursor Tablet":
            "[Type] == \"Overseer Precursor Tablet\" # [StashItem] == \"true\"",
        },
      },
    }
  }

  getName(): string {
    return this.name
  }

  /**
   * Get all categories with their metadata
   */
  getCategories(): Record<string, StaticCategoryDefinition> {
    return this.categories
  }

  /**
   * Get categories in a format suitable for the loader
   */
  getCategoriesForLoader(): StaticCategoryInfo[] {
    const result: StaticCategoryInfo[] = []

    for (const [categoryName, categoryDef] of Object.entries(this.categories)) {
      const subcategories = Object.keys(categoryDef.subcategories).map((name) => ({
        id: name,
        name,
      }))

      result.push({
        id: categoryName,
        name: categoryName,
        hasInput: categoryDef.hasInput,
        inputType: categoryDef.inputType,
        inputMin: categoryDef.inputMin,
        inputMax: categoryDef.inputMax,
        inputDefault: categoryDef.inputDefault,
        inputLabel: categoryDef.inputLabel,
        subcategories,
      })
    }

    return result
  }

  /**
   * Generate output for selected static subcategories
   */
  generateOutput(
    selectedSubcategories: Record<string, string[]>,
    waystoneTier: number = 1
  ): string {
    const output: string[] = []

    for (const [categoryName, subcategoryNames] of Object.entries(selectedSubcategories)) {
      if (!(categoryName in this.categories) || subcategoryNames.length === 0) {
        continue
      }

      const category = this.categories[categoryName]

      // Create section header
      const header = createSectionHeader(categoryName)
      output.push(header)
      output.push("")

      // Add selected subcategory rules
      const subcategories = category.subcategories
      for (const subcatName of subcategoryNames) {
        if (subcatName in subcategories) {
          let rule = subcategories[subcatName]

          // Apply tier substitution for Waystones
          if (category.hasInput && rule.includes("{tier}")) {
            rule = rule.replace("{tier}", String(waystoneTier))
          }

          output.push(rule)
        }
      }

      output.push("")
    }

    return output.join("\n")
  }
}
