/**
 * TypeScript types for the Currency Parser system
 */

// =============================================================================
// Parser Configuration & Options
// =============================================================================

export interface ParserOptions {
  minValue: number
  minValueCurrency: number
  ninjaCategories: string[]
  scoutCategories: string[]
  staticCategories: Record<string, string[]>
  waystoneTier: number
}

export interface CategoryInfo {
  id: string
  name: string
  url?: string
  required: boolean
}

export interface StaticCategoryInfo {
  id: string
  name: string
  hasInput?: boolean
  inputType?: string
  inputMin?: number
  inputMax?: number
  inputDefault?: number
  inputLabel?: string
  subcategories: Array<{
    id: string
    name: string
  }>
}

// =============================================================================
// Parser Results
// =============================================================================

export interface ParserResult {
  itemId: string
  itemName: string
  itemType?: string // Scout only
  value: number
  formattedLine: string
}

export interface SectionResult {
  sectionName: string
  results: ParserResult[]
}

export interface ProcessedOutput {
  result: string // Final formatted output
  logs: string[] // Processing logs
  totalItems: number
  sections: SectionResult[]
}

// =============================================================================
// API Response Types - Poe.Ninja
// =============================================================================

export interface NinjaItem {
  id: string
  name: string
  icon?: string
  stackSize?: number
}

export interface NinjaLine {
  id: string
  name?: string
  primaryValue: number
  secondaryValue?: number
  lowConfidencePaySparkline?: number[]
  lowConfidenceReceiveSparkline?: number[]
}

export interface NinjaApiResponse {
  items: NinjaItem[]
  lines: NinjaLine[]
  currencyTypeName?: string
}

// =============================================================================
// API Response Types - Scout
// =============================================================================

export interface ScoutItem {
  id: number
  name: string
  text?: string
  type: string
  icon?: string
  currentPrice: number
  dailyChange?: number
  weeklyChange?: number
  listings?: number
}

export interface ScoutApiResponse {
  items: ScoutItem[]
  total: number
  page: number
  perPage: number
}

// =============================================================================
// Static Parser Types
// =============================================================================

export interface StaticRule {
  name: string
  template: string
}

export interface StaticCategoryDefinition {
  subcategories: Record<string, string>
  hasInput?: boolean
  inputType?: string
  inputMin?: number
  inputMax?: number
  inputDefault?: number
  inputLabel?: string
}

// =============================================================================
// Form Data Types
// =============================================================================

export interface CurrencyParserFormData {
  min_value: string
  min_value_currency: string
  ninja_categories: string[]
  scout_categories: string[]
  static_categories: Record<string, string[]>
  waystone_tier: string
}

// =============================================================================
// Action Return Types
// =============================================================================

export interface ActionSuccessResponse {
  success: true
  result: string
  logs: string[]
  totalItems: number
}

export interface ActionErrorResponse {
  success: false
  error: string
}

export type ActionResponse = ActionSuccessResponse | ActionErrorResponse

// =============================================================================
// Loader Return Types
// =============================================================================

export interface LoaderData {
  categories: {
    ninja: CategoryInfo[]
    scout: CategoryInfo[]
    static: StaticCategoryInfo[]
  }
}
