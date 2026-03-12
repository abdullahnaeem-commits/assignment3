/**
 * Split text into overlapping chunks at sentence boundaries.
 */
export function chunkText(
  text: string,
  chunkSize = 500,
  overlap = 50
): string[] {
  if (!text || text.trim().length === 0) return [];

  // Normalize whitespace
  const cleaned = text.replace(/\s+/g, " ").trim();

  if (cleaned.length <= chunkSize) {
    return [cleaned];
  }

  const sentences = cleaned.match(/[^.!?]+[.!?]+\s*/g) || [cleaned];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (current.length + sentence.length > chunkSize && current.length > 0) {
      chunks.push(current.trim());
      // Keep overlap from end of current chunk
      const words = current.split(" ");
      const overlapWords = words.slice(-Math.ceil(overlap / 5));
      current = overlapWords.join(" ") + " " + sentence;
    } else {
      current += sentence;
    }
  }

  if (current.trim().length > 0) {
    chunks.push(current.trim());
  }

  return chunks;
}
