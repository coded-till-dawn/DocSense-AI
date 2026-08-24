"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Workspace } from "@/components/workspace/workspace"
import { WorkspaceProvider } from "@/hooks/use-workspace"

const UploadZone = dynamic(
  () => import("@/components/upload/upload-zone").then((mod) => mod.UploadZone),
  { ssr: false, loading: () => <div className="h-64 w-full rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 flex items-center justify-center text-zinc-500">Loading uploader...</div> }
)

export default function Home() {
  const [documentProcessed, setDocumentProcessed] = React.useState(false)

  return (
    <WorkspaceProvider>
      <div className="flex min-h-screen flex-col bg-transparent transition-colors">
        <header className="absolute top-0 z-50 flex w-full h-16 items-center justify-between px-6 pt-4">
        <button 
          onClick={() => setDocumentProcessed(false)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-zinc-50 dark:bg-white dark:text-zinc-950 shadow-lg group-hover:scale-105 transition-transform">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 drop-shadow-md">
            DocSense <span className="text-blue-600 dark:text-blue-500">AI</span>
          </span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {!documentProcessed ? (
          <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
                Understand any document in seconds.
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-zinc-500 dark:text-zinc-400">
                Upload a PDF or scanned image and turn it into structured, actionable insights.
              </p>
            </div>
            
            <div className="w-full max-w-2xl">
              <UploadZone onUploadSuccess={() => setDocumentProcessed(true)} />
            </div>
          </div>
        ) : (
          <Workspace onReset={() => setDocumentProcessed(false)} />
        )}
        </main>
      </div>
    </WorkspaceProvider>
  )
}
