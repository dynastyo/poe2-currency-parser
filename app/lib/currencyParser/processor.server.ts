/**
 * Main processor orchestration logic
 * Coordinates all parsers and generates final output
 */

import type { BaseParser } from "./base.server"
import { NinjaParser } from "./ninja.server"
import { ScoutParser } from "./scout.server"
import { StaticParser } from "./static.server"
import type { ParserOptions, ProcessedOutput, SectionResult } from "./types"
import { createSectionHeader } from "./utils"

/**
 * Process a single parser and return results
 */
async function processParser(
  parser: BaseParser,
  minValue: number,
  minValueCurrency: number,
  logCallback?: (message: string) => void
): Promise<{ results: SectionResult[]; baseValue: number | null }> {
  const log = (message: string) => {
    if (logCallback) logCallback(message)
  }

  const results: SectionResult[] = []
  let baseValue: number | null = null

  const urls = parser.getUrls()

  if (urls.length === 0) {
    log(`⚠ No URLs configured for ${parser.getName()}, skipping...`)
    return { results, baseValue }
  }

  log(`\n${"=".repeat(85)}`)
  log(`Processing ${parser.getName()} data...`)
  log(`${"=".repeat(85)}`)

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const sectionName = parser.extractSectionName(url)

    try {
      log(`\n[${i + 1}/${urls.length}] Fetching data from ${sectionName}...`)
      const data = await parser.fetchAndParse(url)

      // First URL must have base value
      if (i === 0) {
        log("Extracting base value from data...")
        baseValue = parser.getBaseValue(data)
        if (baseValue) {
          log(`✓ Base value found: ${baseValue}`)
        } else if (parser.getName() !== "Scout") {
          // Scout doesn't need base value extraction
          throw new Error("First URL must contain base value data!")
        }
      }

      log(`Calculating values using base value: ${baseValue}...`)

      // Use different minimum value for Ninja currency (first URL for Ninja only)
      const isNinjaCurrency =
        parser.getName() === "Poe.Ninja" && (sectionName === "CURRENCY" || i === 0)
      const currentMin = isNinjaCurrency ? minValueCurrency : minValue

      log(`Applying minimum value filter: ${currentMin} Ex${isNinjaCurrency ? " (Currency)" : ""}`)

      const calculatedResults = parser.calculateValues(data, baseValue || 1.0, currentMin)

      results.push({
        sectionName,
        results: calculatedResults,
      })

      log(`✓ Processed ${calculatedResults.length} items from this section (after filtering)`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      log(`✗ Error processing ${sectionName}: ${errorMessage}`)

      // First URL is critical for parsers that need base value
      if (i === 0 && parser.getName() !== "Scout") {
        throw error
      }
      continue
    }
  }

  return { results, baseValue }
}

/**
 * Main function to process all selected categories
 */
export async function processWithCategories(options: ParserOptions): Promise<ProcessedOutput> {
  const logs: string[] = []
  const log = (message: string) => {
    logs.push(message)
  }

  log("Currency Exchange Rates (in Exalted Orbs)")
  log("=".repeat(85))
  log("")

  const allResults: SectionResult[] = []
  let staticOutput = ""

  // Initialize parsers
  const ninjaParser = new NinjaParser()
  const scoutParser = new ScoutParser()
  const staticParser = new StaticParser()

  // Process Ninja categories
  if (options.ninjaCategories.length > 0) {
    ninjaParser.setActiveCategories(options.ninjaCategories)

    try {
      const { results } = await processParser(
        ninjaParser,
        options.minValue,
        options.minValueCurrency,
        log
      )
      allResults.push(...results)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      log(`✗ Error processing Ninja categories: ${errorMessage}`)

      // If no other parsers are active, re-throw the error
      if (
        options.scoutCategories.length === 0 &&
        Object.keys(options.staticCategories).length === 0
      ) {
        throw error
      }
    }
  }

  // Process Scout categories
  if (options.scoutCategories.length > 0) {
    scoutParser.setActiveCategories(options.scoutCategories)

    try {
      const { results } = await processParser(
        scoutParser,
        options.minValue,
        options.minValueCurrency,
        log
      )
      allResults.push(...results)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      log(`✗ Error processing Scout categories: ${errorMessage}`)

      // If no other parsers are active, re-throw the error
      if (
        options.ninjaCategories.length === 0 &&
        Object.keys(options.staticCategories).length === 0
      ) {
        throw error
      }
    }
  }

  // Process Static categories
  if (Object.keys(options.staticCategories).length > 0) {
    log("\n" + "=".repeat(85))
    log("Processing static filter rules...")
    log("=".repeat(85))
    log("")

    try {
      staticOutput = staticParser.generateOutput(options.staticCategories, options.waystoneTier)

      const totalStatic = Object.values(options.staticCategories).reduce(
        (sum, arr) => sum + arr.length,
        0
      )
      log(
        `✓ Generated ${totalStatic} static filter rules from ${Object.keys(options.staticCategories).length} categories`
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      log(`✗ Error processing static categories: ${errorMessage}`)
    }
  }

  log("\n" + "=".repeat(85))
  log("Generating final output...")
  log("")

  // Generate final formatted output
  const outputLines: string[] = []
  let totalItems = 0

  // Add dynamic content (Ninja + Scout)
  for (const section of allResults) {
    outputLines.push(createSectionHeader(section.sectionName))
    outputLines.push("")

    for (const result of section.results) {
      outputLines.push(result.formattedLine)
      totalItems++
    }

    outputLines.push("")
  }

  // Add static content
  if (staticOutput) {
    outputLines.push(staticOutput)
  }

  const finalOutput = outputLines.join("\n")

  log(`✓ Success! Total items processed: ${totalItems}`)
  log("=".repeat(85))

  return {
    result: finalOutput,
    logs,
    totalItems,
    sections: allResults,
  }
}
