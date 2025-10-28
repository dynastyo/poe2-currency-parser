/**
 * Utility functions for currency parser
 */

/**
 * Create a boxed section header
 */
export function createSectionHeader(sectionName: string): string {
  const boxWidth = 85
  const line = "/".repeat(boxWidth)

  // Center the section name
  const padding = boxWidth - 4 - sectionName.length
  const leftPad = Math.floor(padding / 2)
  const rightPad = padding - leftPad

  const header = [
    line,
    `//${" ".repeat(boxWidth - 4)}//`,
    `//${" ".repeat(leftPad)}${sectionName}${" ".repeat(rightPad)}//`,
    `//${" ".repeat(boxWidth - 4)}//`,
    line,
  ].join("\n")

  return header
}

/**
 * Format a log message with timestamp
 */
export function formatLogMessage(message: string): string {
  const timestamp = new Date().toISOString()
  return `[${timestamp}] ${message}`
}

/**
 * Parse FormData into a structured object
 */
export function parseFormData(formData: FormData): {
  minValue: number
  minValueCurrency: number
  ninjaCategories: string[]
  scoutCategories: string[]
  staticCategories: Record<string, string[]>
  waystoneTier: number
} {
  // Get simple values
  const minValue = Number(formData.get("min_value") || "10")
  const minValueCurrency = Number(formData.get("min_value_currency") || "1")
  const waystoneTier = Number(formData.get("waystone_tier") || "1")

  // Get ninja categories (all entries with name starting with ninja_)
  const ninjaCategories: string[] = []
  const scoutCategories: string[] = []
  const staticCategories: Record<string, string[]> = {}

  for (const [key, value] of formData.entries()) {
    if (key.startsWith("ninja_") && value === "on") {
      const category = key.replace("ninja_", "")
      ninjaCategories.push(category)
    } else if (key.startsWith("scout_") && value === "on") {
      const category = key.replace("scout_", "")
      scoutCategories.push(category)
    } else if (key.startsWith("static_")) {
      // Format: static_{category}_{subcategory}
      const parts = key.replace("static_", "").split("_", 2)
      if (parts.length === 2 && value === "on") {
        const [category, subcategory] = parts
        if (!staticCategories[category]) {
          staticCategories[category] = []
        }
        staticCategories[category].push(subcategory)
      }
    }
  }

  return {
    minValue,
    minValueCurrency,
    ninjaCategories,
    scoutCategories,
    staticCategories,
    waystoneTier,
  }
}
