import { db } from "$lib/db";
import { documents } from "$lib/schema";
import { eq, and } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const session = await locals.auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const [doc] = await db
    .select()
    .from(documents)
    .where(
      and(eq(documents.id, params.id), eq(documents.userId, session.user.id))
    );

  if (!doc) {
    return Response.json({ error: "Document not found" }, { status: 404 });
  }

  // Cascade delete will remove chunks and embeddings
  await db.delete(documents).where(eq(documents.id, params.id));

  return Response.json({ success: true });
};
