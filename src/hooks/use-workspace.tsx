"use client"

import * as React from "react"
import { AIResult } from "@/lib/validation/schema"
import { HistoryItem, useHistory } from "./use-history"

interface WorkspaceContextType {
  activeItem: HistoryItem | null
  setItem: (item: HistoryItem) => void
  updateAIResult: (aiResult: AIResult, length: "short" | "medium" | "long") => void
  clearItem: () => void
}

const WorkspaceContext = React.createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [activeItem, setActiveItem] = React.useState<HistoryItem | null>(null)
  const { saveHistory } = useHistory()

  const setItem = (item: HistoryItem) => {
    setActiveItem(item)
    saveHistory(item)
  }

  const updateAIResult = (aiResult: AIResult, length: "short" | "medium" | "long") => {
    if (activeItem) {
      const updated = { ...activeItem, aiResult, summaryLength: length }
      setActiveItem(updated)
      saveHistory(updated)
    }
  }

  const clearItem = () => {
    setActiveItem(null)
  }

  return (
    <WorkspaceContext.Provider value={{ activeItem, setItem, updateAIResult, clearItem }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = React.useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider")
  }
  return context
}
