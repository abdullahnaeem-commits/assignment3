/**
 * Extract text content from a PDF buffer using pdfjs-dist directly.
 * Avoids pdf-parse's buggy index.js which tries to read a test file on ESM import.
 */
export async function parsePdf(buffer: Buffer): Promise<string> {
  // @ts-ignore - pdfjs-dist legacy build for Node.js
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const uint8 = new Uint8Array(buffer);
  const doc = await pdfjsLib.getDocument({ data: uint8 }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => item.str)
      .join(" ");
    pages.push(text);
  }

  return pages.join("\n\n");
}
