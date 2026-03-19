import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { GEMINI_API_KEY } from "$env/static/private";
import { db } from "$lib/db";
import { conversations, chatMessages, documents } from "$lib/schema";
import { eq, and, asc, inArray } from "drizzle-orm";
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

    const { messages, conversationId, editPosition, currentBranch, pendingDocIds } = await request.json();
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

      // Attach any pending chat-uploaded docs to this new conversation
      if (pendingDocIds && pendingDocIds.length > 0) {
        await db
          .update(documents)
          .set({ conversationId: convId })
          .where(inArray(documents.id, pendingDocIds));
      }
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
      ragSources = await retrieveContext(queryText, session.user.id, convId);

      console.log(`[RAG] Found ${ragSources.length} sources for query: "${queryText.slice(0, 50)}..."`);
      if (ragSources.length > 0) {
        const contextBlock = ragSources
          .map((src) => `[${src.filename}]:\n${src.content}`)
          .join("\n\n");

        systemPrompt = `You are a helpful AI assistant. Be concise and clear in your responses.

You have access to the following relevant context from the user's uploaded documents. Use this context to inform your answers when relevant.

When you use information from a document, cite it at the end of the relevant sentence or paragraph using the format [[doc:filename]]. For example: "The revenue grew by 20% [[doc:report.pdf]]". Use the exact filename from the context block. You may cite multiple documents. Only cite documents you actually used.

--- CONTEXT ---
${contextBlock}
--- END CONTEXT ---

If the context is not relevant to the user's question, ignore it and answer normally without citations.`;
      }
    } catch (ragErr) {
      // Graceful degradation: if RAG fails, continue without context
      console.warn("RAG retrieval failed, continuing without context:", ragErr);
    }

    if (editPosition !== undefined && convId) {
      // === EDIT: create a new fork ===
      const existing = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.conversationId, convId))
        .orderBy(asc(chatMessages.position), asc(chatMessages.branchIndex));

      // Find the source message on the current branch at the edit position
      const sourceMsg = existing.find(
        (m) => m.position === editPosition && m.role === "user" && m.branch === branch
      );

      let branchGroup: string;
      let nextIndex: number;

      if (sourceMsg?.branchGroup) {
        branchGroup = sourceMsg.branchGroup;
        const groupVersions = existing.filter(
          (m) => m.branchGroup === branchGroup && m.role === "user"
        );
        nextIndex = Math.max(...groupVersions.map((m) => m.branchIndex)) + 1;
      } else {
        branchGroup = crypto.randomUUID();
        nextIndex = 1;
        if (sourceMsg) {
          await db
            .update(chatMessages)
            .set({ branchGroup, branchIndex: 0 })
            .where(eq(chatMessages.id, sourceMsg.id));
          const origAssistant = existing.find(
            (m) => m.parentMessageId === sourceMsg.id
          );
          if (origAssistant) {
            await db
              .update(chatMessages)
              .set({ branchGroup, branchIndex: 0 })
              .where(eq(chatMessages.id, origAssistant.id));
          }
        }
      }
      const newBranch = crypto.randomUUID();

      // Insert edited user message on the NEW branch
      const [newUserMsg] = await db
        .insert(chatMessages)
        .values({
          conversationId: convId,
          role: "user",
          content: lastUserMessage.content.trim(),
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
      }), ragSources);
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
          content: lastUserMessage.content.trim(),
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

      return createTextStreamResponse(result, convId, undefined, ragSources);
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
  ragSources?: RetrievedChunk[],
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
  if (ragSources && ragSources.length > 0) {
    // Deduplicate by documentId and send as JSON map of filename -> documentId
    const sourceMap: Record<string, string> = {};
    for (const src of ragSources) {
      sourceMap[src.filename] = src.documentId;
    }
    headers["X-Rag-Sources"] = JSON.stringify(sourceMap);
  }

  return new Response(stream, { headers });
}
