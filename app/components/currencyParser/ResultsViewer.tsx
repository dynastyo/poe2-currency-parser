/**
 * ResultsViewer - Display generated output with download functionality
 */

import { CheckCircle, Copy, Download } from "lucide-react"
import { useState } from "react"

interface ResultsViewerProps {
  content: string
  totalItems: number
}

export default function ResultsViewer({ content, totalItems }: ResultsViewerProps) {
  const [copied, setCopied] = useState(false)

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "dyno.ipd"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  return (
    <div className="mt-8 space-y-4">
      {/* Stats and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-base-200 rounded-lg">
        <div>
          <h3 className="text-lg font-semibold mb-1">Results Generated</h3>
          <p className="text-sm text-base-content/70">
            Total items processed: <span className="font-bold">{totalItems}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={handleCopy} className="btn btn-sm btn-outline gap-2">
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>

          <button type="button" onClick={handleDownload} className="btn btn-sm btn-primary gap-2">
            <Download className="w-4 h-4" />
            Download .ipd
          </button>
        </div>
      </div>

      {/* Output display */}
      <div className="mockup-code bg-base-300 overflow-x-auto max-h-[600px]">
        <pre className="px-4">
          <code className="text-xs">{content}</code>
        </pre>
      </div>
    </div>
  )
}
