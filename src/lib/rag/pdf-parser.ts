/**
 * Extract text content from a PDF buffer.
 */
export async function parsePdf(buffer: Buffer): Promise<string> {
  // pdf-parse v1 is CJS-only, dynamic import for Vite SSR compatibility
  const pdfParse = await import("pdf-parse");
  const pdf = pdfParse.default ?? pdfParse;
  const data = await pdf(buffer);
  return data.text;
}
