/**
 * Poe.Ninja parser implementation
 * Fetches currency and item data from poe.ninja API
 */

import { BaseParser } from "./base.server"
import type { NinjaApiResponse, ParserResult } from "./types"

export class NinjaParser extends BaseParser {
  private categories: Record<string, { url: string; required: boolean }>
  private activeUrls: string[] = []

  constructor() {
    super("Poe.Ninja", "[Type] == \"{name}\" # [StashItem] == \"true\" // ExValue = {value}")

    // Define all available categories with their poe.ninja API URLs
    this.categories = {
      Currency: {
        url: "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Currency",
        required: true,
      },
      Fragments: {
        url: "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Fragments",
        required: false,
      },
      Abyss: {
        url: "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Abyss",
        required: false,
      },
      "Uncut Gems": {
        url: "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=UncutGems",
        required: false,
      },
      "Lineage Support Gems": {
        url: "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=LineageSupportGems",
        required: false,
      },
      Essences: {
        url: "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Essences",
        required: false,
      },
      Ultimatum: {
        url: "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Ultimatum",
        required: false,
      },
      Talismans: {
        url: "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Talismans",
        required: false,
      },
      Runes: {
        url: "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Runes",
        required: false,
      },
      Ritual: {
        url: "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Ritual",
        required: false,
      },
      Expedition: {
        url: "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Expedition",
        required: false,
      },
      Delirium: {
        url: "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Delirium",
        required: false,
      },
      Breach: {
        url: "https://poe.ninja/poe2/api/economy/temp2/overview?leagueName=Rise+of+the+Abyssal&overviewName=Breach",
        required: false,
      },
    }
  }

  getCategories(): Record<string, { url: string; required: boolean }> {
    return this.categories
  }

  setActiveCategories(activeCategories: string[]): void {
    this.activeUrls = []

    // Always include Currency first (required for base value)
    if (this.categories.Currency) {
      this.activeUrls.push(this.categories.Currency.url)
    }

    // Add other selected categories
    for (const category of activeCategories) {
      if (category in this.categories && category !== "Currency") {
        this.activeUrls.push(this.categories[category].url)
      }
    }
  }

  getUrls(): string[] {
    return this.activeUrls
  }

  async fetchAndParse(url: string): Promise<NinjaApiResponse> {
    return this.fetchJson(url)
  }

  getBaseValue(data: NinjaApiResponse): number | null {
    // Find the exalted orb in the lines array
    for (const line of data.lines || []) {
      if (line.id === "exalted") {
        return line.primaryValue
      }
    }
    return null
  }

  calculateValues(
    data: NinjaApiResponse,
    exaltedDivineValue: number,
    minValue: number
  ): ParserResult[] {
    if (!exaltedDivineValue || exaltedDivineValue === 0) {
      throw new Error("Invalid exalted orb value")
    }

    // Create a mapping of id to name from items
    const idToName = new Map<string, string>()
    for (const item of data.items || []) {
      idToName.set(item.id, item.name)
    }

    // Calculate exalted value for each item
    const results: ParserResult[] = []

    for (const line of data.lines || []) {
      const itemId = line.id
      const itemName = idToName.get(itemId) || itemId
      const divineValue = line.primaryValue

      // Calculate exalted value: item's divine value / exalted's divine value
      const exaltedValue = divineValue / exaltedDivineValue

      // Only include items that meet the minimum value threshold
      if (exaltedValue >= minValue) {
        const formattedLine = this.formatResult({
          itemId,
          itemName,
          value: exaltedValue,
          formattedLine: "", // Will be set by formatResult
        })

        results.push({
          itemId,
          itemName,
          value: exaltedValue,
          formattedLine,
        })
      }
    }

    return results
  }

  extractSectionName(url: string): string {
    // Extract section name from overviewName parameter
    const match = url.match(/overviewName=([^&]+)/)
    if (match) {
      const overviewName = match[1]
      // Convert CamelCase to UPPER CASE WITH SPACES
      // e.g., "UncutGems" -> "UNCUT GEMS"
      const sectionName = overviewName
        .replace(/([A-Z])/g, " $1")
        .trim()
        .toUpperCase()
      return sectionName
    }
    return "UNKNOWN SECTION"
  }
}
