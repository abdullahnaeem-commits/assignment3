import { db } from "$lib/db";
import { documents } from "$lib/schema";
import { eq, desc, and, isNull } from "drizzle-orm";
import { ingestDocument } from "$lib/rag/ingest";
import type { RequestHandler } from "./$types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["text/plain", "application/pdf"];

export const GET: RequestHandler = async ({ locals }) => {
  const session = await locals.auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Only show global docs (not chat-scoped ones)
  const docs = await db
    .select()
    .from(documents)
    .where(and(eq(documents.userId, session.user.id), isNull(documents.conversationId)))
    .orderBy(desc(documents.createdAt));

  return Response.json(docs);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json(
      { error: "Only .txt and .pdf files are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json(
      { error: "File size exceeds 10MB limit" },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const conversationId = formData.get("conversationId") as string | null;
    const docId = await ingestDocument(
      session.user.id,
      file.name,
      file.type,
      buffer,
      conversationId || undefined
    );

    return Response.json({ id: docId, status: "processing" }, { status: 201 });
  } catch (err) {
    console.error("Document upload error:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: message }, { status: 500 });
  }
};
