import * as pdfjsLib from 'pdfjs-dist'

// Set up the worker for pdfjs. Using unpkg for reliability.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

export interface ExtractedPage {
  pageNumber: number
  text: string
}

export interface PDFExtractionResult {
  pages: ExtractedPage[]
  textScore: number // 0-100 indicating how much text was found vs just images
  totalPages: number
}

export async function extractTextFromPDF(file: File): Promise<PDFExtractionResult> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
  
  const numPages = pdf.numPages
  const pages: ExtractedPage[] = []
  
  let totalTextLength = 0
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    
    const text = textContent.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.str)
      .join(' ')
      
    totalTextLength += text.length
    
    pages.push({
      pageNumber: i,
      text: text.trim()
    })
  }
  
  // Calculate a rough score: if average chars per page is very low, it might be a scanned PDF
  const avgChars = totalTextLength / numPages
  const textScore = Math.min(Math.max((avgChars / 500) * 100, 0), 100)
  
  return {
    pages,
    textScore,
    totalPages: numPages
  }
}
