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
 * - Global docs (conversationId IS NULL) are always searched.
 * - Conversation-scoped docs are only searched when conversationId is provided.
 */
export async function retrieveContext(
  query: string,
  userId: string,
  conversationId?: string | null,
  topK = 5,
  threshold = 0.1
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await getEmbedding(query);
  const vectorStr = `[${queryEmbedding.join(",")}]`;

  const scopeFilter = conversationId
    ? sql`AND (d."conversationId" IS NULL OR d."conversationId" = ${conversationId})`
    : sql`AND d."conversationId" IS NULL`;

  const results = await db.execute(sql`
    SELECT
      c.id AS "chunkId",
      c."documentId",
      d.filename,
      c.content,
      1 - (e.embedding <=> ${sql.raw(`'${vectorStr}'`)}::vector) AS similarity
    FROM embedding e
    JOIN chunk c ON c.id = e."chunkId"
    JOIN document d ON d.id = c."documentId"
    WHERE d."userId" = ${userId}
      AND d.status = 'ready'
      ${scopeFilter}
      AND 1 - (e.embedding <=> ${sql.raw(`'${vectorStr}'`)}::vector) > ${threshold}
    ORDER BY e.embedding <=> ${sql.raw(`'${vectorStr}'`)}::vector
    LIMIT ${topK}
  `);

  return results.rows as RetrievedChunk[];
}
