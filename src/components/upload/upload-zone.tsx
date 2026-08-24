"use client"

import * as React from "react"
import { useDropzone } from "react-dropzone"
import { FileUp, File as FileIcon, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { extractTextFromPDF } from "@/lib/extraction/pdf"
import { extractTextFromImage } from "@/lib/extraction/ocr"
import { useWorkspace } from "@/hooks/use-workspace"
import { v4 as uuidv4 } from "uuid"

export type UploadState = "DEFAULT" | "DRAGGING" | "PROCESSING" | "SUCCESS" | "ERROR"

interface UploadZoneProps {
  onUploadSuccess: () => void
}

export function UploadZone({ onUploadSuccess }: UploadZoneProps) {
  const [state, setState] = React.useState<UploadState>("DEFAULT")
  const [errorMsg, setErrorMsg] = React.useState("")
  const [progress, setProgress] = React.useState(0)
  const [file, setFile] = React.useState<File | null>(null)
  const { setItem } = useWorkspace()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onDrop = React.useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      setState("ERROR")
      setErrorMsg("File type not supported or file too large. Max 10MB (PDF, PNG, JPG).")
      return
    }

    const selectedFile = acceptedFiles[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setState("PROCESSING")
    setProgress(10)
    
    try {
      let extractedText = ""
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let stats: any = {
        pages: 1,
        words: 0,
        readTime: "1 min read",
        type: selectedFile.type === "application/pdf" ? "PDF" : "Image",
        extraction: "PDF Text Extraction",
        qualityScore: 100
      }

      if (selectedFile.type === "application/pdf") {
        setProgress(30)
        const pdfResult = await extractTextFromPDF(selectedFile)
        extractedText = pdfResult.pages.map(p => p.text).join("\n\n")
        stats.pages = pdfResult.totalPages
        stats.qualityScore = pdfResult.textScore
        
        // If it's a scanned PDF (low text score) we ideally want to OCR it, but for demo we just flag it
        if (pdfResult.textScore < 20) {
           stats.extraction = "Scanned PDF"
        }
      } else {
        setProgress(40)
        stats.extraction = "Image OCR"
        const ocrResult = await extractTextFromImage(selectedFile)
        extractedText = ocrResult.text
        stats.qualityScore = ocrResult.confidence
      }

      const wordCount = extractedText.trim().split(/\s+/).length
      stats.words = wordCount
      stats.readTime = Math.ceil(wordCount / 200) + " min read"
      
      setProgress(60)

      // Call API
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractedText, length: "medium" })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to analyze document. Please check your API key.");
      }

      const { result } = await response.json()
      
      setProgress(100)
      setState("SUCCESS")
      
      // Save to workspace
      setItem({
        id: uuidv4(),
        filename: selectedFile.name,
        timestamp: Date.now(),
        stats,
        extractedText,
        aiResult: result,
        summaryLength: "medium"
      })

      setTimeout(() => {
        onUploadSuccess()
      }, 1000)

    } catch (error: unknown) {
      console.error(error)
      setState("ERROR")
      setErrorMsg(error instanceof Error ? error.message : "An unexpected error occurred during processing.")
    }
  }, [onUploadSuccess, setItem])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  })

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isDragActive && state !== "PROCESSING" && state !== "SUCCESS") {
      setState("DRAGGING")
    } else if (!isDragActive && state === "DRAGGING") {
      setState("DEFAULT")
    }
  }, [isDragActive, state])

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-dashed p-12 transition-all duration-200 ease-in-out cursor-pointer group shadow-sm",
          state === "DEFAULT" ? "border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/50" : "",
          state === "DRAGGING" ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/30" : "",
          state === "PROCESSING" ? "border-blue-500 bg-white pointer-events-none dark:bg-zinc-900" : "",
          state === "SUCCESS" ? "border-green-500 bg-green-50 pointer-events-none dark:bg-green-950/30" : "",
          state === "ERROR" ? "border-red-500 bg-red-50 dark:bg-red-950/30" : ""
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          {state === "DEFAULT" && (
            <>
              <div className="rounded-full bg-zinc-100 p-4 transition-transform group-hover:scale-110 dark:bg-zinc-800">
                <FileUp className="h-8 w-8 text-zinc-500 dark:text-zinc-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Drop your document here</p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">or click to browse</p>
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">PDF, PNG, or JPG up to 10MB</p>
            </>
          )}

          {state === "DRAGGING" && (
            <>
              <div className="rounded-full bg-blue-100 p-4 animate-bounce dark:bg-blue-900/50">
                <FileUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">Release to analyze your document</p>
            </>
          )}

          {state === "PROCESSING" && (
            <>
              <div className="rounded-full bg-blue-50 p-4 dark:bg-blue-900/20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
              </div>
              <div className="w-full max-w-xs space-y-2">
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Processing {file?.name}</p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-500 ease-in-out dark:bg-blue-500" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Extracting text & running analysis...</p>
              </div>
            </>
          )}

          {state === "SUCCESS" && (
            <>
              <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/50">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-lg font-semibold text-green-700 dark:text-green-400">Document ready</p>
            </>
          )}

          {state === "ERROR" && (
            <>
              <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/50">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-red-700 dark:text-red-400">Upload failed</p>
                <p className="mt-1 text-sm text-red-600 dark:text-red-400/80">{errorMsg}</p>
              </div>
              <Button 
                variant="outline" 
                className="text-zinc-900 border-zinc-200 hover:bg-zinc-100 dark:text-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 mt-2"
                onClick={(e) => {
                  e.stopPropagation()
                  setState("DEFAULT")
                }}
              >
                Try another file
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
