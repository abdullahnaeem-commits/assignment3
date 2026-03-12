import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { GEMINI_API_KEY } from "$env/static/private";
import { db } from "$lib/db";
import { conversations, chatMessages } from "$lib/schema";
import { eq, and, asc } from "drizzle-orm";
import { retrieveContext, type RetrievedChunk } from "$lib/rag/retrieve";
import type { RequestHandler } from "./$types";

const google = createGoogleGenerativeAI({
  apiKey: GEMINI_API_KEY,
});

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const session = await locals.auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages, conversationId, editPosition, currentBranch } = await request.json();
    const branch = currentBranch || "main";

    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const firstMessage = messages[0]?.content || "New Chat";
      const title = firstMessage.slice(0, 100);
      const [conv] = await db
        .insert(conversations)
        .values({ userId: session.user.id, title })
        .returning();
      convId = conv.id;
    } else {
      await db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, convId));
    }

    const lastUserMessage = messages[messages.length - 1];

    // === RAG: Retrieve relevant context ===
    let ragSources: RetrievedChunk[] = [];
    let systemPrompt = "You are a helpful AI assistant. Be concise and clear in your responses.";

    try {
      const queryText = lastUserMessage.content;
      ragSources = await retrieveContext(queryText, session.user.id);

      console.log(`[RAG] Found ${ragSources.length} sources for query: "${queryText.slice(0, 50)}..."`);
      if (ragSources.length > 0) {
        const contextBlock = ragSources
          .map((src, i) => `[Source ${i + 1}] (${src.filename}):\n${src.content}`)
          .join("\n\n");

        systemPrompt = `You are a helpful AI assistant. Be concise and clear in your responses.

You have access to the following relevant context from the user's uploaded documents. Use this context to inform your answers when relevant. Cite sources using [Source N] notation when you use information from them.

--- CONTEXT ---
${contextBlock}
--- END CONTEXT ---

If the context is not relevant to the user's question, ignore it and answer normally.`;
      }
    } catch (ragErr) {
      // Graceful degradation: if RAG fails, continue without context
      console.warn("RAG retrieval failed, continuing without context:", ragErr);
    }

    const ragSourcesHeader = ragSources.length > 0
      ? JSON.stringify(ragSources.map((s, i) => ({
          index: i + 1,
          chunkId: s.chunkId,
          documentId: s.documentId,
          filename: s.filename,
          similarity: s.similarity,
        })))
      : "";

    if (editPosition !== undefined && convId) {
      // === EDIT: create a new fork ===
      const existing = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.conversationId, convId))
        .orderBy(asc(chatMessages.position), asc(chatMessages.branchIndex));

      // Find versions at this fork position
      const forkVersions = existing.filter(
        (m) => m.position === editPosition && m.role === "user"
      );
      const branchGroup = forkVersions[0]?.branchGroup || crypto.randomUUID();
      const nextIndex = forkVersions.length;
      // The new branch name = the branchGroup UUID
      const newBranch = branchGroup;

      // Tag original at this position with branchGroup if not already
      if (forkVersions[0] && !forkVersions[0].branchGroup) {
        await db
          .update(chatMessages)
          .set({ branchGroup, branchIndex: 0 })
          .where(eq(chatMessages.id, forkVersions[0].id));
        // Also tag its assistant response
        const origAssistant = existing.find(
          (m) => m.parentMessageId === forkVersions[0].id
        );
        if (origAssistant) {
          await db
            .update(chatMessages)
            .set({ branchGroup, branchIndex: 0 })
            .where(eq(chatMessages.id, origAssistant.id));
        }
      }

      // Insert edited user message on the NEW branch
      const [newUserMsg] = await db
        .insert(chatMessages)
        .values({
          conversationId: convId,
          role: "user",
          content: lastUserMessage.content,
          position: editPosition,
          branch: newBranch,
          branchGroup,
          branchIndex: nextIndex,
        })
        .returning();

      // Stream response and save on the new branch
      const result = streamText({
        model: google("gemini-2.5-flash"),
        system: systemPrompt,
        messages,
        async onFinish({ text }) {
          await db.insert(chatMessages).values({
            conversationId: convId,
            role: "assistant",
            content: text,
            position: editPosition + 1,
            branch: newBranch,
            branchGroup,
            branchIndex: nextIndex,
            parentMessageId: newUserMsg.id,
          });
        },
      });

      return createTextStreamResponse(result, convId, JSON.stringify({
        branchGroup,
        branchIndex: nextIndex,
        branch: newBranch,
      }), ragSourcesHeader);
    } else {
      // === NORMAL MESSAGE: append to current branch ===
      const existing = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.conversationId, convId))
        .orderBy(asc(chatMessages.position));

      const maxPos = existing.length > 0
        ? Math.max(...existing.map((m) => m.position))
        : -1;
      const userPos = maxPos + 1;

      const [newUserMsg] = await db
        .insert(chatMessages)
        .values({
          conversationId: convId,
          role: "user",
          content: lastUserMessage.content,
          position: userPos,
          branch,
        })
        .returning();

      const result = streamText({
        model: google("gemini-2.5-flash"),
        system: systemPrompt,
        messages,
        async onFinish({ text }) {
          await db.insert(chatMessages).values({
            conversationId: convId,
            role: "assistant",
            content: text,
            position: userPos + 1,
            branch,
            parentMessageId: newUserMsg.id,
          });
        },
      });

      return createTextStreamResponse(result, convId, undefined, ragSourcesHeader);
    }
  } catch (err) {
    console.error("Chat API error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

function createTextStreamResponse(
  result: ReturnType<typeof streamText>,
  convId: string,
  branchMeta?: string,
  ragSources?: string,
) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.textStream) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  const headers: Record<string, string> = {
    "Content-Type": "text/plain; charset=utf-8",
    "Transfer-Encoding": "chunked",
    "X-Conversation-Id": convId,
  };
  if (branchMeta) headers["X-Branch-Meta"] = branchMeta;
  if (ragSources) headers["X-Rag-Sources"] = ragSources;

  return new Response(stream, { headers });
}
