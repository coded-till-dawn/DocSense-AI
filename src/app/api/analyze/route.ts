import { NextResponse } from "next/server"
import { analyzeDocument, SummaryLength } from "@/lib/ai/gemini"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { text, length } = body

    if (!text) {
      return NextResponse.json({ error: "No text provided for analysis" }, { status: 400 })
    }

    const summaryLength: SummaryLength = ["short", "medium", "long"].includes(length) ? length : "medium"

    const result = await analyzeDocument(text, summaryLength)

    return NextResponse.json({ result })
  } catch (error: unknown) {
    console.error("AI Analysis Error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze document. Please try again later."
    return NextResponse.json(
      { error: errorMessage.includes("API_KEY") ? "Missing or invalid Gemini API Key. Please add it to your .env file." : errorMessage },
      { status: 500 }
    )
  }
}
