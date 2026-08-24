"use client"

import * as React from "react"
import { AIResult } from "@/lib/validation/schema"

export type ExtractionType = "PDF Text Extraction" | "Image OCR" | "Scanned PDF OCR"

export interface DocumentStats {
  pages: number
  words: number
  readTime: string
  type: string
  extraction: ExtractionType
  qualityScore: number
}

export interface HistoryItem {
  id: string
  filename: string
  timestamp: number
  stats: DocumentStats
  extractedText: string
  aiResult: AIResult | null
  summaryLength: "short" | "medium" | "long"
}

const STORAGE_KEY = "docsense_history"

export function useHistory() {
  const [history, setHistory] = React.useState<HistoryItem[]>([])

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHistory(JSON.parse(stored))
      }
    } catch (e) {
      console.error("Failed to load history", e)
    }
  }, [])

  const saveHistory = (item: HistoryItem) => {
    setHistory(prev => {
      const existingIdx = prev.findIndex(i => i.id === item.id)
      const newHistory = existingIdx >= 0 
        ? [...prev.slice(0, existingIdx), item, ...prev.slice(existingIdx + 1)]
        : [item, ...prev]
        
      // Keep only last 10 items
      const trimmed = newHistory.slice(0, 10)
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
      } catch (e) {
        console.error("Failed to save history", e)
      }
      
      return trimmed
    })
  }

  const deleteHistory = (id: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(i => i.id !== id)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
      } catch (e) {
        console.error("Failed to update history", e)
      }
      return newHistory
    })
  }

  const clearHistory = () => {
    setHistory([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.error("Failed to clear history", e)
    }
  }

  return { history, saveHistory, deleteHistory, clearHistory }
}
