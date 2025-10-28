/**
 * Scout parser implementation
 * Fetches unique item data from poe2scout.com API
 */

import { BaseParser } from "./base.server"
import type { ParserResult, ScoutApiResponse } from "./types"

export class ScoutParser extends BaseParser {
  private categories: Record<string, { url: string; required: boolean }>
  private activeUrls: string[] = []

  constructor() {
    super(
      "Scout",
      "[Type] == \"{type}\" && [Rarity] == \"Unique\" # [UniqueName] == \"{name}\" && [StashItem] == \"true\" // ExValue = {value}"
    )

    // Define all available categories with their scout API URLs
    this.categories = {
      Accessories: {
        url: "https://poe2scout.com/api/items/unique/accessory?page=1&perPage=250&league=Rise%20of%20the%20Abyssal&search=&referenceCurrency=exalted",
        required: false,
      },
      Armour: {
        url: "https://poe2scout.com/api/items/unique/armour?page=1&perPage=250&league=Rise%20of%20the%20Abyssal&search=&referenceCurrency=exalted",
        required: false,
      },
      Jewels: {
        url: "https://poe2scout.com/api/items/unique/jewel?page=1&perPage=250&league=Rise%20of%20the%20Abyssal&search=&referenceCurrency=exalted",
        required: false,
      },
      Maps: {
        url: "https://poe2scout.com/api/items/unique/map?page=1&perPage=250&league=Rise%20of%20the%20Abyssal&search=&referenceCurrency=exalted",
        required: false,
      },
      Weapons: {
        url: "https://poe2scout.com/api/items/unique/weapon?page=1&perPage=250&league=Rise%20of%20the%20Abyssal&search=&referenceCurrency=exalted",
        required: false,
      },
      Sanctum: {
        url: "https://poe2scout.com/api/items/unique/sanctum?page=1&perPage=250&league=Rise%20of%20the%20Abyssal&search=&referenceCurrency=exalted",
        required: false,
      },
    }
  }

  getCategories(): Record<string, { url: string; required: boolean }> {
    return this.categories
  }

  setActiveCategories(activeCategories: string[]): void {
    this.activeUrls = []

    // Add selected categories
    for (const category of activeCategories) {
      if (category in this.categories) {
        this.activeUrls.push(this.categories[category].url)
      }
    }
  }

  getUrls(): string[] {
    return this.activeUrls
  }

  async fetchAndParse(url: string): Promise<ScoutApiResponse> {
    return this.fetchJson(url)
  }

  getBaseValue(data: ScoutApiResponse): number | null {
    // Scout prices are already in exalted, so base value is always 1.0
    return 1.0
  }

  calculateValues(data: ScoutApiResponse, baseValue: number, minValue: number): ParserResult[] {
    const results: ParserResult[] = []

    // Scout returns items with currentPrice already in exalted
    for (const item of data.items || []) {
      const itemId = String(item.id)
      const itemName = item.name || item.text || "Unknown"
      const itemType = item.type || "Unknown"
      const exaltedValue = item.currentPrice || 0

      // Only include items that meet the minimum value threshold
      if (exaltedValue >= minValue) {
        // Format using the template (which includes {type})
        let formattedLine = this.outputFormat
        formattedLine = formattedLine.replace("{type}", itemType)
        formattedLine = formattedLine.replace("{name}", itemName)
        formattedLine = formattedLine.replace("{value}", exaltedValue.toFixed(2))

        results.push({
          itemId,
          itemName,
          itemType,
          value: exaltedValue,
          formattedLine,
        })
      }
    }

    return results
  }

  extractSectionName(url: string): string {
    // Extract category from URL pattern: /unique/{category}
    const match = url.match(/\/unique\/([^?]+)/)
    if (match) {
      const category = match[1]
      // Convert to title case with "UNIQUE" prefix
      const formatted = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
      return `UNIQUE ${formatted.toUpperCase()}`
    }
    return "UNIQUE ITEMS"
  }
}
