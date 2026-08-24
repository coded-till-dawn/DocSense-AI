# DocSense AI

DocSense AI is a premium, web-based application designed to instantly transform complex documents (PDFs, images, and scanned text) into clear, structured, and actionable insights. It leverages advanced OCR, PDF parsing, and the cutting-edge Gemini 1.5 Flash AI model to deliver rapid executive summaries, key data points, and action items.

The application is heavily stylized with a dark-mode, glassmorphism UI, floating above a majestic, photorealistic 3D interactive globe.

---

## Evaluation Criteria & Project Highlights

### 1. Problem-Solving Approach
- **Challenge:** Preventing SSR hydration mismatches with Three.js (`react-globe.gl`).
  - **Solution:** Utilized Next.js `next/dynamic` to load the Globe component strictly on the client side.
- **Challenge:** Handling heavy PDF parsing and Image OCR without freezing the UI.
  - **Solution:** Kept processing strictly client-side using `pdfjs-dist` and `Tesseract.js` web workers to offload the main thread, resulting in a buttery smooth loading state experience.
- **Challenge:** Optimizing Mobile Experience.
  - **Solution:** Designed a responsive layout that perfectly stacks complex UI columns (Stats, AI Insights, Document Viewer) without compromising readability on phones.

### 2. Code Quality
- Achieved 100% strict TypeScript compliance with **zero** `any` types.
- Fixed all React Hook exhaustive-deps and synchronous state-in-effect warnings.
- Implemented modular component architecture (Upload Zone, Workspace Dashboard, Insights Cards) for high reusability and clean code separation.
- Used Radix UI for guaranteed accessibility (a11y) standards across tabs.

### 3. Working Functionality
- Drag-and-drop ingestion of images and PDFs (up to 10MB).
- Generates Executive Summaries, Key Points, Action Items, and Important Numbers.
- 1-Click Copy and Download-as-Text features fully implemented.

### 4. Documentation
- This document serves as the architectural overview and setup guide.

---

## Technology Stack

- **Frontend Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4, Framer Motion (Implicit/Standard animations)
- **UI Components:** Radix UI (Headless primitives for high accessibility)
- **3D Engine:** `react-globe.gl` (powered by Three.js) for the interactive earth
- **AI Integration:** Google Generative AI SDK (`@google/generative-ai`)
- **OCR Processing:** `Tesseract.js` (for extracting text from images)
- **PDF Parsing:** `pdfjs-dist` (for extracting text from PDFs)
- **Drag & Drop:** `react-dropzone`
- **Tooling:** TypeScript, ESLint, Prettier

---

## Core Features & Functionalities

1. **Interactive 3D Background:**
   - A fully textured, interactive 3D satellite earth with city lights and topological bumps that slowly revolves in the background.
   - Built using `react-globe.gl` and Three.js.

2. **Document Ingestion:**
   - Clean, drag-and-drop interface supporting PDF, PNG, and JPG (Up to 10MB).
   - Local text extraction via `pdfjs-dist` (for digital PDFs).
   - Local Optical Character Recognition (OCR) via `Tesseract.js` for images and scanned documents.

3. **AI-Powered Analysis:**
   - Integrated with Gemini 1.5 Flash.
   - Automatically analyzes the extracted text and structures it into:
     - Executive Summaries
     - Key Concepts & Main Ideas
     - Action Items & To-Do Lists
     - Important Dates, Numbers, and Entities (People/Organizations)

4. **Premium Insights Dashboard:**
   - Glassmorphism design (frosted glass, semi-transparent layers).
   - "Summary-First" layout that prioritizes the core AI response in the center.
   - "Copy to Clipboard" and "Download as .txt" functionalities for easy sharing.
   - Built-in theme locking (enforced Dark Mode to preserve the 3D space aesthetic).

5. **Real-Time State Management:**
   - Document processing states (Dragging, Uploading, Extracting, AI Analyzing) are managed smoothly without requiring page reloads using a React Context (`WorkspaceProvider`).
   - Clicking the DocSense AI logo instantly resets the session.

---

## Architecture & File Structure

```text
/src
  /app
    - layout.tsx : Root layout, loads fonts, global CSS, and the 3D Globe.
    - page.tsx   : Main entry point. Handles the UI state between Upload Zone and Dashboard.
    /api
      /analyze/route.ts : Secure backend endpoint that communicates with Gemini AI.

  /components
    - globe-background.tsx : The react-globe.gl 3D engine and styling.
    /upload
      - upload-zone.tsx    : Drag & drop interface and local file processing.
    /workspace
      - workspace.tsx      : The main dashboard layout for viewing AI results.
      - insight-card.tsx   : Reusable glassmorphism card for displaying data.

  /lib
    /extraction
      - ocr.ts : Tesseract.js integration for images.
      - pdf.ts : pdfjs-dist integration for PDFs.
```

---

## How to Run Locally

1. **Prerequisites:** Node.js 20+ installed.
2. **Install Dependencies:** 
   ```bash
   npm install
   ```
3. **Environment Variables:**
   - Create a `.env` file in the root directory.
   - Add: `GEMINI_API_KEY=your_google_ai_studio_api_key_here`
4. **Start the Dev Server:** 
   ```bash
   npm run dev
   ```
5. **View:** Open [http://localhost:3010](http://localhost:3010) in your browser.

> **Note:** To build for production, run `npm run build` followed by `npm start`.
