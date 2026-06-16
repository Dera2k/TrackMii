"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useExportXlsx } from "@/hooks/queries/useExports"
import { X, Download, Calendar } from "lucide-react"

const presets = [
  { label: "Last 3 days", value: "last3days" },
  { label: "Last 5 days", value: "last5days" },
  { label: "Last 7 days", value: "last7days" },
  { label: "Last 30 days", value: "last30days" },
  { label: "This month", value: "thisMonth" },
  { label: "Last 3 months", value: "last3months" },
  { label: "Last 6 months", value: "last6months" },
  { label: "Last year", value: "lastYear" },
]

const sections = [
  { id: "summary", label: "Summary" },
  { id: "insights", label: "Spending Insights" },
  { id: "categories", label: "Category Breakdown" },
  { id: "payment", label: "Payment Methods" },
  { id: "weekday", label: "Weekday Patterns" },
  { id: "topExpenses", label: "Top 5 Expenses" },
  { id: "monthly", label: "Monthly Trends" },
  { id: "budget", label: "Budget Performance" },
  { id: "details", label: "Expense Details" },
]

interface ExportModalProps {
  open: boolean
  onClose: () => void
}

function ExportModal({ open, onClose }: ExportModalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const exportXlsx = useExportXlsx()

  const [preset, setPreset] = useState("last30days")
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")
  const [useCustom, setUseCustom] = useState(false)
  const [selectedSections, setSelectedSections] = useState<string[]>(
    sections.map((s) => s.id)
  )

  const toggleSection = (id: string) => {
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleExport = () => {
    const payload = {
      preset: useCustom ? undefined : preset,
      start_date: useCustom ? customStart : undefined,
      end_date: useCustom ? customEnd : undefined,
      sections: selectedSections,
    }

    exportXlsx.mutate(payload, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Export Data</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Date Range */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Time Period</label>

            {!useCustom && (
              <div className="space-y-2">
                {presets.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPreset(p.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      preset === p.value
                        ? "bg-primary text-primary-foreground"
                        : "border border-border hover:bg-accent"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setUseCustom(!useCustom)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm border border-border hover:bg-accent transition-colors"
            >
              {useCustom ? "Back to presets" : "Custom date range"}
            </button>

            {useCustom && (
              <div className="space-y-2">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </div>
            )}
          </div>

          {/* Sections */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Sections to Include</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sections.map((s) => (
                <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSections.includes(s.id)}
                    onChange={() => toggleSection(s.id)}
                    className="rounded border-border"
                  />
                  <span className="text-sm">{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent"
            >
              Cancel
            </button>

            <button
              onClick={handleExport}
              disabled={
                exportXlsx.isPending ||
                (useCustom && (!customStart || !customEnd))
              }
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exportXlsx.isPending ? "Exporting..." : "Export"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <ExportModal open={true} onClose={() => {}} />
  )
}