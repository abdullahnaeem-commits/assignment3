/**
 * Extract text content from a PDF buffer.
 *
 * Imports pdf-parse/lib/pdf-parse.js directly to bypass index.js
 * which has a bug that tries to read a test file on ESM import.
 */
export async function parsePdf(buffer: Buffer): Promise<string> {
  // @ts-ignore - import the inner lib directly to avoid index.js test-file bug
  const pdfParse = await import("pdf-parse/lib/pdf-parse.js");
  const pdf = pdfParse.default ?? pdfParse;
  const data = await pdf(buffer);
  return data.text;
}
