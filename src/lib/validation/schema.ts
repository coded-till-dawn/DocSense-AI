import { z } from "zod"

export const aiResultSchema = z.object({
  documentType: z.string().describe("The detected document type, e.g., Academic, Technical, Business, Legal."),
  executiveSummary: z.string().describe("A comprehensive executive summary of the document."),
  keyPoints: z.array(
    z.object({
      point: z.string(),
      importance: z.enum(["high", "medium", "low"]).optional()
    })
  ).describe("The key points extracted from the document."),
  mainIdeas: z.array(
    z.object({
      title: z.string(),
      explanation: z.string()
    })
  ).describe("The main ideas or arguments presented."),
  actionItems: z.array(
    z.object({
      action: z.string(),
      owner: z.string().nullable().optional(),
      deadline: z.string().nullable().optional(),
      priority: z.string().nullable().optional()
    })
  ).describe("Action items implicitly or explicitly stated."),
  importantTopics: z.array(z.string()).describe("Key topics discussed."),
  importantEntities: z.array(
    z.object({
      name: z.string(),
      type: z.string()
    })
  ).describe("Important people, organizations, locations, or projects."),
  decisionsAndConclusions: z.array(z.string()).describe("Explicit decisions, findings, or conclusions."),
  importantNumbers: z.array(
    z.object({
      value: z.string(),
      context: z.string()
    })
  ).describe("Meaningful numerical information like percentages, scores, limits."),
  importantDates: z.array(
    z.object({
      date: z.string(),
      context: z.string()
    })
  ).describe("Meaningful dates extracted from the document.")
})

export type AIResult = z.infer<typeof aiResultSchema>
