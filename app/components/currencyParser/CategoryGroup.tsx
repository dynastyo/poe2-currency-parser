/**
 * CategoryGroup - Reusable component for rendering a group of checkboxes
 * Used for Ninja and Scout categories
 */

import { useState } from "react"
import type { CategoryInfo } from "~/lib/currencyParser/types"

interface CategoryGroupProps {
  title: string
  categories: CategoryInfo[]
  namePrefix: string
  description?: string
}

export default function CategoryGroup({
  title,
  categories,
  namePrefix,
  description,
}: CategoryGroupProps) {
  const [allChecked, setAllChecked] = useState(true)

  const handleToggleAll = () => {
    const newState = !allChecked
    setAllChecked(newState)

    // Update all checkboxes
    categories.forEach((category) => {
      if (!category.required) {
        const checkbox = document.getElementById(`${namePrefix}_${category.id}`) as HTMLInputElement
        if (checkbox) {
          checkbox.checked = newState
        }
      }
    })
  }

  return (
    <div className="categories-group mb-6 p-5 bg-base-100 rounded-lg border border-base-300">
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-medium">{title}:</label>
        <button
          type="button"
          onClick={handleToggleAll}
          className="text-xs text-primary hover:text-primary-focus underline cursor-pointer"
        >
          Check all/none
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`${namePrefix}_${category.id}`}
              name={`${namePrefix}_${category.id}`}
              value="on"
              defaultChecked={true}
              disabled={category.required}
              className="checkbox checkbox-primary checkbox-sm"
            />
            <label
              htmlFor={`${namePrefix}_${category.id}`}
              className={`text-sm cursor-pointer ${category.required ? "text-base-content/60 cursor-not-allowed" : "text-base-content"}`}
            >
              {category.name}
            </label>
          </div>
        ))}
      </div>

      {description && <p className="mt-2 text-xs text-base-content/60">{description}</p>}
    </div>
  )
}
