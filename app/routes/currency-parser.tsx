/**
 * Currency Parser Route
 * Main route for the PoE2 currency parser application
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react"
import { AlertCircle, Loader2, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import CategoryGroup from "~/components/currencyParser/CategoryGroup"
import ConfigForm from "~/components/currencyParser/ConfigForm"
import ResultsViewer from "~/components/currencyParser/ResultsViewer"
import StaticCategoryGroup from "~/components/currencyParser/StaticCategoryGroup"
import AnimateElementIn from "~/components/ui/AnimateElementIn"
import Section from "~/components/ui/Section"
import Toast from "~/components/ui/Toast"
import { NinjaParser } from "~/lib/currencyParser/ninja.server"
import { processWithCategories } from "~/lib/currencyParser/processor.server"
import { ScoutParser } from "~/lib/currencyParser/scout.server"
import { StaticParser } from "~/lib/currencyParser/static.server"
import type { ActionResponse, CategoryInfo, LoaderData } from "~/lib/currencyParser/types"
import { parseFormData } from "~/lib/currencyParser/utils"

export const meta: MetaFunction = () => {
  return [
    { title: "PoE2 Currency Parser - Lazy Pickit Generator" },
    {
      name: "description",
      content:
        "Generate Path of Exile 2 loot filter rules based on currency values from poe.ninja and scout.",
    },
  ]
}

// Loader: Provide available categories
export async function loader({ request }: LoaderFunctionArgs) {
  const ninjaParser = new NinjaParser()
  const scoutParser = new ScoutParser()
  const staticParser = new StaticParser()

  // Convert parser categories to CategoryInfo format
  const ninjaCategories: CategoryInfo[] = Object.entries(ninjaParser.getCategories()).map(
    ([name, info]) => ({
      id: name,
      name,
      required: info.required,
    })
  )

  const scoutCategories: CategoryInfo[] = Object.entries(scoutParser.getCategories()).map(
    ([name, info]) => ({
      id: name,
      name,
      required: info.required,
    })
  )

  const staticCategories = staticParser.getCategoriesForLoader()

  const loaderData: LoaderData = {
    categories: {
      ninja: ninjaCategories,
      scout: scoutCategories,
      static: staticCategories,
    },
  }

  return json(loaderData)
}

// Action: Process parser request
export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData()
    const parsedData = parseFormData(formData)

    // Validate that at least one category is selected
    if (
      parsedData.ninjaCategories.length === 0 &&
      parsedData.scoutCategories.length === 0 &&
      Object.keys(parsedData.staticCategories).length === 0
    ) {
      return json<ActionResponse>(
        {
          success: false,
          error: "Please select at least one category",
        },
        { status: 400 }
      )
    }

    // Process the parsers
    const result = await processWithCategories({
      minValue: parsedData.minValue,
      minValueCurrency: parsedData.minValueCurrency,
      ninjaCategories: parsedData.ninjaCategories,
      scoutCategories: parsedData.scoutCategories,
      staticCategories: parsedData.staticCategories,
      waystoneTier: parsedData.waystoneTier,
    })

    return json<ActionResponse>({
      success: true,
      result: result.result,
      logs: result.logs,
      totalItems: result.totalItems,
    })
  } catch (error) {
    console.error("Error processing currency parser:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    return json<ActionResponse>(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}

// Main component
export default function CurrencyParserRoute() {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()

  const [toast, setToast] = useState<{
    type: "success" | "error" | "info"
    message: string
  } | null>(null)

  const isSubmitting = navigation.state === "submitting"

  // Show success toast when results are generated
  useEffect(() => {
    if (actionData && actionData.success) {
      setToast({
        type: "success",
        message: `Filter generated successfully! ${actionData.totalItems} items processed.`,
      })
    } else if (actionData && !actionData.success) {
      setToast({
        type: "error",
        message: actionData.error,
      })
    }
  }, [actionData])

  return (
    <Section>
      {/* Toast notifications */}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <AnimateElementIn transition="slideUp">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              Dynos Lazy Pickit Generator
              <Sparkles className="w-8 h-8 text-primary" />
            </h1>
            <p className="text-lg text-base-content/70">
              Generate Path of Exile 2 loot filter rules based on currency values
            </p>
          </div>

          {/* Form */}
          <Form method="post" className="space-y-6">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-4">Configuration</h2>

                {/* Config inputs */}
                <ConfigForm />

                {/* Ninja categories */}
                <CategoryGroup
                  title="Currency Categories"
                  categories={loaderData.categories.ninja}
                  namePrefix="ninja"
                  description="Select currency and item categories"
                />

                {/* Scout categories */}
                <CategoryGroup
                  title="Unique Items"
                  categories={loaderData.categories.scout}
                  namePrefix="scout"
                  description="Select unique item categories"
                />

                {/* Static categories */}
                <StaticCategoryGroup categories={loaderData.categories.static} />

                {/* Submit button */}
                <div className="card-actions justify-center mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary btn-lg gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Filter
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Form>

          {/* Error display */}
          {actionData && !actionData.success && (
            <div className="alert alert-error mt-6">
              <AlertCircle className="w-5 h-5" />
              <span>{actionData.error}</span>
            </div>
          )}

          {/* Results */}
          {actionData && actionData.success && (
            <ResultsViewer content={actionData.result} totalItems={actionData.totalItems} />
          )}
        </div>
      </AnimateElementIn>
    </Section>
  )
}
