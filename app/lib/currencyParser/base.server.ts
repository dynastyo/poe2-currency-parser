/**
 * Base parser abstract class
 * Server-side only (.server.ts ensures it's never bundled to client)
 */

import type { CategoryInfo, ParserResult } from "./types"

export abstract class BaseParser {
  protected name: string
  protected outputFormat: string

  constructor(name: string, outputFormat: string) {
    this.name = name
    this.outputFormat = outputFormat
  }

  /**
   * Get parser name
   */
  getName(): string {
    return this.name
  }

  /**
   * Get output format template
   */
  getOutputFormat(): string {
    return this.outputFormat
  }

  /**
   * Get available categories for this parser
   */
  abstract getCategories(): Record<string, { url: string; required: boolean }>

  /**
   * Set which categories should be active
   */
  abstract setActiveCategories(categories: string[]): void

  /**
   * Get list of URLs to fetch
   */
  abstract getUrls(): string[]

  /**
   * Fetch and parse data from a URL
   */
  abstract fetchAndParse(url: string): Promise<any>

  /**
   * Get base value for calculations (e.g., exalted orb value)
   */
  abstract getBaseValue(data: any): number | null

  /**
   * Calculate item values from parsed data
   */
  abstract calculateValues(data: any, baseValue: number, minValue: number): ParserResult[]

  /**
   * Extract section name from URL
   */
  abstract extractSectionName(url: string): string

  /**
   * Fetch JSON from a URL (utility method)
   */
  protected async fetchJson(url: string): Promise<any> {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Format a single result according to this parser's template
   */
  formatResult(result: ParserResult): string {
    let formatted = this.outputFormat

    // Replace template variables
    formatted = formatted.replace("{name}", result.itemName)
    formatted = formatted.replace("{value}", result.value.toFixed(2))

    // Scout-specific: replace {type}
    if (result.itemType) {
      formatted = formatted.replace("{type}", result.itemType)
    }

    return formatted
  }
}
