"use client"

import { useState } from "react"
import { IconTrash } from "@tabler/icons-react"

export function ClearAdminDataButton() {
  const [loading, setLoading] = useState(false)

  const clearData = async () => {
    const confirmed = confirm(
      "⚠️ This will permanently delete ALL reports. Are you sure?"
    )

    if (!confirmed) return

    try {
      setLoading(true)
      const res = await fetch("/api/admin/clear", {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed")

      alert("✅ All data cleared successfully")
      location.reload()
    } catch (err) {
      alert("❌ Failed to clear data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={clearData}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 rounded-md
        bg-red-500/10 border border-red-500/30
        text-red-400 hover:bg-red-500/20
        transition disabled:opacity-50"
    >
      <IconTrash className="w-4 h-4" />
      {loading ? "Clearing..." : "Clear All Data"}
    </button>
  )
}
