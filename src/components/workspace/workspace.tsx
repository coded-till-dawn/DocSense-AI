"use client"

import * as React from "react"
import { ArrowLeft, Search, ChevronLeft, ChevronRight, Download, Copy, RefreshCw, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useWorkspace } from "@/hooks/use-workspace"

interface WorkspaceProps {
  onReset: () => void
}

export function Workspace({ onReset }: WorkspaceProps) {
  const { activeItem, clearItem, updateAIResult } = useWorkspace()
  const [search, setSearch] = React.useState("")
  const [isRegenerating, setIsRegenerating] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState("")
  const [copied, setCopied] = React.useState(false)
  
  const handleReset = () => {
    clearItem()
    onReset()
  }

  const handleRegenerate = async (length: "short" | "medium" | "long") => {
    if (!activeItem) return
    setIsRegenerating(true)
    setErrorMsg("")
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: activeItem.extractedText, length })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to analyze document");
      }

      const { result } = await response.json()
      updateAIResult(result, length)
    } catch (err: unknown) {
      console.error(err)
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setIsRegenerating(false)
    }
  }

  const generateTextToExport = () => {
    if (!activeItem?.aiResult) return ""
    const { aiResult } = activeItem
    let text = `Executive Summary\n\n${aiResult.executiveSummary}\n\n`
    if (aiResult.keyPoints && aiResult.keyPoints.length > 0) {
      text += `Key Points\n`
      aiResult.keyPoints.forEach(kp => text += `- ${kp.point}\n`)
      text += `\n`
    }
    if (aiResult.mainIdeas && aiResult.mainIdeas.length > 0) {
      text += `Main Ideas\n`
      aiResult.mainIdeas.forEach(idea => text += `- ${idea.title}: ${idea.explanation}\n`)
    }
    return text.trim()
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateTextToExport())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error("Failed to copy", e)
    }
  }

  const handleDownload = () => {
    const text = generateTextToExport()
    if (!text) return
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const filename = activeItem?.filename ? activeItem.filename.replace(/\.[^/.]+$/, "") : "document"
    a.download = `${filename}_summary.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!activeItem) return null

  const { stats, extractedText, aiResult } = activeItem
  const qualityScore = stats.qualityScore ? Math.round(stats.qualityScore) : 100

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] w-full max-w-[1600px] gap-6 animate-in fade-in zoom-in-95 duration-500 overflow-y-auto lg:overflow-visible pb-10 lg:pb-0 pr-2 lg:pr-0">
      {/* Left Column: Stats & Nav (Stacked on mobile, sidebar on desktop) */}
      <div className="w-full lg:w-64 flex-col gap-6 flex">
        <Button variant="ghost" className="w-fit -ml-4 text-zinc-500" onClick={handleReset}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Start New Document
        </Button>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm">Document Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-green-600 dark:text-green-500">{qualityScore}%</span>
              <span className="mb-1 text-sm font-medium text-green-600/80 dark:text-green-500/80">
                {qualityScore > 90 ? "Excellent" : qualityScore > 70 ? "Good" : qualityScore > 50 ? "Fair" : "Poor"}
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Based on text extraction density.</p>
          </CardContent>
        </Card>

        <Card className="flex-1 overflow-hidden flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Pages</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{stats.pages}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Words</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{stats.words.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Est. Read</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{stats.readTime}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Format</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{stats.type}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Extraction</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{stats.extraction}</span>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Middle Column: AI Analysis */}
      <Card className="flex flex-1 flex-col overflow-hidden min-h-[600px] lg:min-h-0">
        <Tabs defaultValue="summary" className="flex flex-1 flex-col h-full">
          <div className="border-b border-zinc-200 p-2 dark:border-zinc-800">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="summary" className="flex-1 flex flex-col m-0 data-[state=inactive]:hidden overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-200 p-3 px-6 dark:border-zinc-800">
              <div className="flex rounded-md shadow-sm">
                <Button 
                  variant={activeItem.summaryLength === "short" ? "default" : "outline"} 
                  size="sm" 
                  className="rounded-r-none h-8 px-4 text-xs font-medium"
                  onClick={() => handleRegenerate("short")}
                  disabled={isRegenerating}
                >Short</Button>
                <Button 
                  variant={!activeItem.summaryLength || activeItem.summaryLength === "medium" ? "default" : "outline"} 
                  size="sm" 
                  className="rounded-none border-x-0 h-8 px-4 text-xs font-medium"
                  onClick={() => handleRegenerate("medium")}
                  disabled={isRegenerating}
                >Medium</Button>
                <Button 
                  variant={activeItem.summaryLength === "long" ? "default" : "outline"} 
                  size="sm" 
                  className="rounded-l-none h-8 px-4 text-xs font-medium"
                  onClick={() => handleRegenerate("long")}
                  disabled={isRegenerating}
                >Long</Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Copy" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-zinc-500" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Download" onClick={handleDownload}>
                  <Download className="h-4 w-4 text-zinc-500" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 text-xs font-medium ml-2"
                  onClick={() => handleRegenerate(activeItem.summaryLength || "medium")}
                  disabled={isRegenerating}
                >
                  <RefreshCw className={cn("mr-2 h-3.5 w-3.5", isRegenerating && "animate-spin")} />
                  {isRegenerating ? "Regenerating..." : "Regenerate Summary"}
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 p-8 lg:px-12">
              {errorMsg && (
                <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400 max-w-3xl mx-auto">
                  {errorMsg}
                </div>
              )}
              {isRegenerating ? (
                <div className="flex h-full items-center justify-center text-sm text-zinc-500 flex-col gap-4 mt-20">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="text-base font-medium">Regenerating your summary...</span>
                </div>
              ) : aiResult ? (
                <div className="space-y-10 max-w-4xl mx-auto pb-10">
                  <section>
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Executive Summary</h3>
                    <p className="text-base text-zinc-800 dark:text-zinc-200 leading-relaxed">
                      {aiResult.executiveSummary}
                    </p>
                  </section>
                  
                  {aiResult.keyPoints && aiResult.keyPoints.length > 0 && (
                    <>
                      <Separator className="my-8" />
                      <section>
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Key Points</h3>
                        <ul className="space-y-4 text-base">
                          {aiResult.keyPoints.map((kp, idx) => (
                            <li key={idx} className="flex items-start gap-4">
                              <div className="mt-2 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                              <span className="text-zinc-800 dark:text-zinc-200 leading-relaxed">{kp.point}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    </>
                  )}

                  {aiResult.mainIdeas && aiResult.mainIdeas.length > 0 && (
                    <>
                      <Separator className="my-8" />
                      <section>
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Main Ideas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {aiResult.mainIdeas.map((idea, idx) => (
                            <Card key={idx} className="bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-zinc-800/50">
                              <CardContent className="p-5 space-y-2">
                                <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{idea.title}</h4>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{idea.explanation}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </section>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-500 mt-20">
                  No AI result available.
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="insights" className="flex-1 m-0 data-[state=inactive]:hidden overflow-hidden">
             <ScrollArea className="h-full p-8 lg:px-12">
              {aiResult ? (
                <div className="space-y-10 max-w-4xl mx-auto pb-10">
                  {aiResult.importantNumbers && aiResult.importantNumbers.length > 0 && (
                    <section>
                      <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Key Numbers</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {aiResult.importantNumbers.map((num, idx) => (
                          <div key={idx} className="rounded-xl border border-zinc-200/60 bg-white p-5 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950 flex flex-col h-full">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">{num.value}</div>
                            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed flex-1">{num.context}</div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {aiResult.actionItems && aiResult.actionItems.length > 0 && (
                    <>
                      <Separator className="my-8" />
                      <section>
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Action Items</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {aiResult.actionItems.map((action, idx) => (
                            <div key={idx} className="rounded-xl border border-zinc-200/60 bg-white p-5 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950 flex flex-col h-full">
                              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex-1">{action.action}</p>
                              <div className="flex items-center gap-2 flex-wrap mt-auto">
                                {action.owner && <Badge variant="secondary" className="px-2 py-1 text-xs">Owner: {action.owner}</Badge>}
                                {action.deadline && <Badge variant="outline" className="px-2 py-1 text-xs text-red-600 border-red-200 dark:text-red-400 dark:border-red-900/50">Due: {action.deadline}</Badge>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    </>
                  )}

                  {aiResult.importantEntities && aiResult.importantEntities.length > 0 && (
                    <>
                      <Separator className="my-8" />
                      <section>
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Important Entities</h3>
                        <div className="flex flex-wrap gap-2.5">
                          {aiResult.importantEntities.map((entity, idx) => (
                            <Badge key={idx} variant={idx % 2 === 0 ? "default" : "secondary"} className="px-3 py-1.5 text-xs font-medium">
                              {entity.name}
                            </Badge>
                          ))}
                        </div>
                      </section>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-500 mt-20">
                  No insights available.
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Right Column: Document Viewer */}
      <Card className="hidden flex-col overflow-hidden lg:flex lg:w-[450px]">
        <div className="flex items-center justify-between border-b border-zinc-200 p-2 px-4 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Page 1 / {stats.pages}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative w-40">
            <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 w-full rounded-md border border-zinc-200 bg-white pl-8 pr-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>
        </div>
        <ScrollArea className="flex-1 bg-zinc-100/50 p-4 dark:bg-zinc-900/30">
          <div className="mx-auto bg-white p-6 shadow-sm dark:bg-zinc-950 min-h-full whitespace-pre-wrap font-sans text-xs leading-relaxed text-zinc-700 dark:text-zinc-400">
            {extractedText}
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}
