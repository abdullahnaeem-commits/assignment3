import { db } from "$lib/db";
import { documents, chunks, embeddings } from "$lib/schema";
import { eq } from "drizzle-orm";
import { chunkText } from "./chunker";
import { parsePdf } from "./pdf-parser";
import { getEmbeddings } from "./embedding-client";

/**
 * Ingest a document: extract text, chunk, embed, and store in pgvector.
 */
export async function ingestDocument(
  userId: string,
  filename: string,
  mimeType: string,
  buffer: Buffer
): Promise<string> {
  // 1. Create document record
  const [doc] = await db
    .insert(documents)
    .values({
      userId,
      filename,
      mimeType,
      fileSize: buffer.length,
      status: "processing",
    })
    .returning();

  try {
    // 2. Extract text
    let text: string;
    if (mimeType === "application/pdf") {
      text = await parsePdf(buffer);
    } else {
      text = buffer.toString("utf-8");
    }

    if (!text || text.trim().length === 0) {
      throw new Error("No text content found in document");
    }

    // 3. Chunk text
    const textChunks = chunkText(text);

    // 4. Insert chunks
    const chunkRecords = await db
      .insert(chunks)
      .values(
        textChunks.map((content, i) => ({
          documentId: doc.id,
          content,
          chunkIndex: i,
          metadata: { filename, mimeType },
        }))
      )
      .returning();

    // 5. Batch embed via Python service
    const batchSize = 50;
    for (let i = 0; i < textChunks.length; i += batchSize) {
      const batch = textChunks.slice(i, i + batchSize);
      const batchChunkRecords = chunkRecords.slice(i, i + batchSize);
      const embeddingVectors = await getEmbeddings(batch);

      // 6. Store embeddings
      await db.insert(embeddings).values(
        embeddingVectors.map((embedding, j) => ({
          chunkId: batchChunkRecords[j].id,
          embedding,
        }))
      );
    }

    // 7. Update document status
    await db
      .update(documents)
      .set({ status: "ready", totalChunks: textChunks.length })
      .where(eq(documents.id, doc.id));

    return doc.id;
  } catch (err) {
    // Mark as error
    await db
      .update(documents)
      .set({ status: "error" })
      .where(eq(documents.id, doc.id));
    throw err;
  }
}
