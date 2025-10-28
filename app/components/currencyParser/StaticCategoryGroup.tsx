/**
 * StaticCategoryGroup - Component for static categories with subcategories
 * Supports optional input fields (like waystone tier)
 */

import { useState } from "react"
import type { StaticCategoryInfo } from "~/lib/currencyParser/types"

interface StaticCategoryGroupProps {
  categories: StaticCategoryInfo[]
}

export default function StaticCategoryGroup({ categories }: StaticCategoryGroupProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map((c) => c.id))
  )

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleAllSubcategories = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return

    const checkboxes = category.subcategories.map(
      (subcat) => document.getElementById(`static_${categoryId}_${subcat.id}`) as HTMLInputElement
    )

    const allChecked = checkboxes.every((cb) => cb?.checked)

    checkboxes.forEach((checkbox) => {
      if (checkbox) {
        checkbox.checked = !allChecked
      }
    })
  }

  return (
    <div className="categories-group mb-6 p-5 bg-base-100 rounded-lg border border-base-300">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium">Static Filters:</span>
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="category-section">
            {/* Category header */}
            <div className="flex justify-between items-center p-2 bg-base-200 rounded">
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="text-sm font-medium text-base-content hover:text-primary flex items-center gap-2"
              >
                <span>{expandedCategories.has(category.id) ? "▼" : "▶"}</span>
                {category.name}
              </button>
              <button
                type="button"
                onClick={() => toggleAllSubcategories(category.id)}
                className="text-xs text-primary hover:text-primary-focus underline"
              >
                Check all/none
              </button>
            </div>

            {/* Optional input field (e.g., waystone tier) */}
            {category.hasInput && expandedCategories.has(category.id) && (
              <div className="flex items-center gap-3 px-5 py-2">
                <label
                  htmlFor={`static_input_${category.id}`}
                  className="text-sm text-base-content/70"
                >
                  {category.inputLabel}:
                  <input
                    type={category.inputType || "number"}
                    id={`static_input_${category.id}`}
                    name="waystone_tier"
                    min={category.inputMin}
                    max={category.inputMax}
                    defaultValue={category.inputDefault}
                    className="input input-sm input-bordered w-20 ml-2"
                  />
                </label>
              </div>
            )}

            {/* Subcategories */}
            {expandedCategories.has(category.id) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2 pl-5">
                {category.subcategories.map((subcat) => (
                  <div key={subcat.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`static_${category.id}_${subcat.id}`}
                      name={`static_${category.id}_${subcat.id}`}
                      value="on"
                      defaultChecked={true}
                      className="checkbox checkbox-primary checkbox-sm"
                    />
                    <label
                      htmlFor={`static_${category.id}_${subcat.id}`}
                      className="text-sm cursor-pointer text-base-content"
                    >
                      {subcat.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-base-content/60">Fixed filter rules for common items</p>
    </div>
  )
}
