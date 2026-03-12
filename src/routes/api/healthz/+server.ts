import { db } from "$lib/db";
import { sql } from "drizzle-orm";
import { isEmbeddingServiceHealthy } from "$lib/rag/embedding-client";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  const checks: Record<string, { status: string; message?: string }> = {};

  // Check database connection
  try {
    await db.execute(sql`SELECT 1`);
    checks.database = { status: "ok" };
  } catch (err) {
    checks.database = {
      status: "error",
      message: err instanceof Error ? err.message : "Connection failed",
    };
  }

  // Check pgvector extension
  try {
    const result = await db.execute(
      sql`SELECT extname FROM pg_extension WHERE extname = 'vector'`
    );
    checks.pgvector = result.rows.length > 0
      ? { status: "ok" }
      : { status: "error", message: "vector extension not installed" };
  } catch (err) {
    checks.pgvector = {
      status: "error",
      message: err instanceof Error ? err.message : "Check failed",
    };
  }

  // Check embedding service
  try {
    const healthy = await isEmbeddingServiceHealthy();
    checks.embedding_service = healthy
      ? { status: "ok" }
      : { status: "error", message: "Service not responding or not ready" };
  } catch (err) {
    checks.embedding_service = {
      status: "error",
      message: err instanceof Error ? err.message : "Check failed",
    };
  }

  const allOk = Object.values(checks).every((c) => c.status === "ok");

  return Response.json(
    {
      status: allOk ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allOk ? 200 : 503 }
  );
};
