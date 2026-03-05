import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { GEMINI_API_KEY } from "$env/static/private";
import type { RequestHandler } from "./$types";

const google = createGoogleGenerativeAI({
  apiKey: GEMINI_API_KEY,
});

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await request.json();

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: "You are a helpful AI assistant. Be concise and clear in your responses.",
    messages,
  });

  return result.toDataStreamResponse();
};
