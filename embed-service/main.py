import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI(title="Embedding Service")

MODEL_NAME = os.getenv("MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")
model: SentenceTransformer | None = None


@app.on_event("startup")
def load_model():
    global model
    model = SentenceTransformer(MODEL_NAME)


class EmbedRequest(BaseModel):
    texts: list[str]


class EmbedResponse(BaseModel):
    embeddings: list[list[float]]
    dimension: int


@app.post("/embed", response_model=EmbedResponse)
def embed(req: EmbedRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    if not req.texts:
        raise HTTPException(status_code=400, detail="No texts provided")
    if len(req.texts) > 100:
        raise HTTPException(status_code=400, detail="Max 100 texts per request")

    embeddings = model.encode(req.texts, normalize_embeddings=True).tolist()
    return EmbedResponse(embeddings=embeddings, dimension=len(embeddings[0]))


@app.get("/health")
def health():
    return {
        "status": "ok" if model is not None else "loading",
        "model": MODEL_NAME,
        "dimension": 384,
    }
