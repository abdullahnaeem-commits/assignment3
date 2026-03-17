import { env } from "$env/dynamic/private";

const baseUrl = env.EMBEDDING_API_URL || "http://localhost:8000";

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const res = await fetch(`${baseUrl}/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Embedding service error (${res.status}): ${detail}`);
  }

  const data = await res.json();
  return data.embeddings;
}

export async function getEmbedding(text: string): Promise<number[]> {
  const [embedding] = await getEmbeddings([text]);
  return embedding;
}

export async function isEmbeddingServiceHealthy(): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === "ok";
  } catch {
    return false;
  }
}
