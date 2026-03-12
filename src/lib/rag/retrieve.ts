import { db } from "$lib/db";
import { getEmbedding } from "./embedding-client";
import { sql } from "drizzle-orm";

export type RetrievedChunk = {
  chunkId: string;
  documentId: string;
  filename: string;
  content: string;
  similarity: number;
};

/**
 * Retrieve relevant document chunks for a query using cosine similarity.
 */
export async function retrieveContext(
  query: string,
  userId: string,
  topK = 5,
  threshold = 0.3
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await getEmbedding(query);
  const vectorStr = `[${queryEmbedding.join(",")}]`;

  const results = await db.execute(sql`
    SELECT
      c.id AS "chunkId",
      c."documentId",
      d.filename,
      c.content,
      1 - (e.embedding <=> ${vectorStr}::vector) AS similarity
    FROM embedding e
    JOIN chunk c ON c.id = e."chunkId"
    JOIN document d ON d.id = c."documentId"
    WHERE d."userId" = ${userId}
      AND d.status = 'ready'
      AND 1 - (e.embedding <=> ${vectorStr}::vector) > ${threshold}
    ORDER BY e.embedding <=> ${vectorStr}::vector
    LIMIT ${topK}
  `);

  return results.rows as RetrievedChunk[];
}
