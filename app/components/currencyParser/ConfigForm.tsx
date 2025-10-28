/**
 * ConfigForm - Configuration inputs for minimum values
 */

export default function ConfigForm() {
  return (
    <div className="space-y-4 mb-6">
      {/* Minimum Value (General) */}
      <div>
        <label htmlFor="min_value" className="block text-sm font-medium mb-2">
          Minimum Exalted Value (General):
        </label>
        <input
          type="number"
          id="min_value"
          name="min_value"
          defaultValue="10"
          step="0.1"
          min="0"
          className="input input-bordered w-full"
          required
        />
        <p className="mt-1 text-xs text-base-content/60">
          Minimum exalted value for Fragments, Abyss, Gems, etc.
        </p>
      </div>

      {/* Minimum Value (Currency) */}
      <div>
        <label htmlFor="min_value_currency" className="block text-sm font-medium mb-2">
          Minimum Exalted Value (Currency):
        </label>
        <input
          type="number"
          id="min_value_currency"
          name="min_value_currency"
          defaultValue="1"
          step="0.1"
          min="0"
          className="input input-bordered w-full"
          required
        />
        <p className="mt-1 text-xs text-base-content/60">
          Minimum exalted value specifically for currency items
        </p>
      </div>
    </div>
  )
}
