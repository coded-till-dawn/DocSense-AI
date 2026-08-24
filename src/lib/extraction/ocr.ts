import Tesseract from 'tesseract.js'

export interface OCRExtractionResult {
  text: string
  confidence: number
}

export async function extractTextFromImage(file: File): Promise<OCRExtractionResult> {
  // Convert File to Object URL for Tesseract
  const imageUrl = URL.createObjectURL(file)
  
  try {
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: m => console.log(m)
    })
    
    const { data } = await worker.recognize(imageUrl)
    
    await worker.terminate()
    URL.revokeObjectURL(imageUrl)
    
    return {
      text: data.text,
      confidence: data.confidence
    }
  } catch {
    URL.revokeObjectURL(imageUrl)
    throw new Error('OCR extraction failed')
  }
}
