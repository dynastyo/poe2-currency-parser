/**
 * Toast notification component
 */

import { AlertCircle, CheckCircle, X } from "lucide-react"
import { useEffect } from "react"

export interface ToastProps {
  type: "success" | "error" | "info"
  message: string
  onClose: () => void
  duration?: number
}

export default function Toast({ type, message, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const typeStyles = {
    success: "alert-success",
    error: "alert-error",
    info: "alert-info",
  }

  const Icon = type === "success" ? CheckCircle : AlertCircle

  return (
    <div className="toast toast-top toast-end z-50">
      <div className={`alert ${typeStyles[type]} shadow-lg`}>
        <Icon className="w-5 h-5" />
        <span>{message}</span>
        <button type="button" onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
