import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

const aiResultSchema = {
  type: SchemaType.OBJECT,
  properties: {
    documentType: {
      type: SchemaType.STRING,
      description: "The detected document type, e.g., Academic, Technical, Business, Legal.",
    },
    executiveSummary: {
      type: SchemaType.STRING,
      description: "A comprehensive executive summary of the document.",
    },
    keyPoints: {
      type: SchemaType.ARRAY,
      description: "The key points extracted from the document.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          point: { type: SchemaType.STRING },
          importance: { type: SchemaType.STRING, enum: ["high", "medium", "low"] }
        },
        required: ["point"]
      }
    },
    mainIdeas: {
      type: SchemaType.ARRAY,
      description: "The main ideas or arguments presented.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          explanation: { type: SchemaType.STRING }
        },
        required: ["title", "explanation"]
      }
    },
    actionItems: {
      type: SchemaType.ARRAY,
      description: "Action items implicitly or explicitly stated.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          action: { type: SchemaType.STRING },
          owner: { type: SchemaType.STRING, nullable: true },
          deadline: { type: SchemaType.STRING, nullable: true },
          priority: { type: SchemaType.STRING, nullable: true }
        },
        required: ["action"]
      }
    },
    importantTopics: {
      type: SchemaType.ARRAY,
      description: "Key topics discussed.",
      items: { type: SchemaType.STRING }
    },
    importantEntities: {
      type: SchemaType.ARRAY,
      description: "Important people, organizations, locations, or projects.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          type: { type: SchemaType.STRING }
        },
        required: ["name", "type"]
      }
    },
    decisionsAndConclusions: {
      type: SchemaType.ARRAY,
      description: "Explicit decisions, findings, or conclusions.",
      items: { type: SchemaType.STRING }
    },
    importantNumbers: {
      type: SchemaType.ARRAY,
      description: "Meaningful numerical information like percentages, scores, limits.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          value: { type: SchemaType.STRING },
          context: { type: SchemaType.STRING }
        },
        required: ["value", "context"]
      }
    },
    importantDates: {
      type: SchemaType.ARRAY,
      description: "Meaningful dates extracted from the document.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          date: { type: SchemaType.STRING },
          context: { type: SchemaType.STRING }
        },
        required: ["date", "context"]
      }
    }
  },
  required: [
    "documentType", 
    "executiveSummary", 
    "keyPoints", 
    "mainIdeas", 
    "actionItems", 
    "importantTopics", 
    "importantEntities", 
    "decisionsAndConclusions",
    "importantNumbers",
    "importantDates"
  ]
}

export type SummaryLength = "short" | "medium" | "long"

export async function analyzeDocument(text: string, length: SummaryLength = "medium") {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured on the server.")
  }

  // Choose the model: using 3.5 flash to avoid generic alias overload
  const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: aiResultSchema as Schema,
      temperature: 0.1, // Low temperature for more factual extraction
    }
  })

  let lengthInstruction = ""
  switch(length) {
    case "short":
      lengthInstruction = "Keep the executive summary highly concise and provide exactly 5-7 key points."
      break
    case "medium":
      lengthInstruction = "Provide a balanced executive summary, covering main ideas and important details."
      break
    case "long":
      lengthInstruction = "Provide a detailed executive summary, preserving all important context, significant numbers, dates, and conclusions."
      break
  }

  const prompt = `
You are a highly capable document analysis AI. Analyze the following document text and extract structured insights.

CRITICAL RULES:
1. ONLY use the supplied document content. DO NOT use external knowledge.
2. DO NOT hallucinate.
3. Preserve factual information, numbers, dates, names, and conclusions exactly as they appear.
4. Adapt to the document type (e.g. Academic, Technical, Business).
5. Do not fabricate missing fields. Empty arrays are valid if the document doesn't contain the information.
6. ${lengthInstruction}

Document Text:
==================================================
${text}
==================================================
`

  const result = await model.generateContent(prompt)
  const response = result.response
  const jsonString = response.text()
  
  return JSON.parse(jsonString)
}
