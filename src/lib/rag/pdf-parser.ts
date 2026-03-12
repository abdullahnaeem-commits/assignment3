/**
 * Extract text content from a PDF buffer using pdfjs-dist directly.
 * Avoids pdf-parse's buggy index.js which tries to read a test file on ESM import.
 */
export async function parsePdf(buffer: Buffer): Promise<string> {
  // @ts-ignore - pdfjs-dist legacy build for Node.js
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const { createRequire } = await import("module");
  const require = createRequire(import.meta.url);
  const standardFontDataUrl = require.resolve("pdfjs-dist/standard_fonts/").replace(/\\/g, "/");

  const uint8 = new Uint8Array(buffer);
  const doc = await pdfjsLib.getDocument({
    data: uint8,
    standardFontDataUrl: "file:///" + standardFontDataUrl,
  }).promise;

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
