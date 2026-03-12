# Assignment 3 - RAG-Powered AI Chat

A full-stack SvelteKit application with authentication, AI chat (Google Gemini), document-based RAG (Retrieval-Augmented Generation) using pgvector, and a Python embedding microservice.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│  SvelteKit   │────▶│  PostgreSQL   │     │  Python Embed    │
│  Frontend +  │     │  + pgvector   │     │  Service (8000)  │
│  API (5173)  │────▶│  (5432)       │     │  MiniLM-L6-v2   │
└─────────────┘     └──────────────┘     └──────────────────┘
       │                                          ▲
       └──────────────────────────────────────────┘
                   Embedding requests
```

## Features

- **Authentication**: Auth.js with credentials, Google OAuth, GitHub OAuth, email verification, password reset
- **Admin Dashboard**: Role-based access control (RBAC) for admin users
- **AI Chat**: Streaming responses via Vercel AI SDK + Google Gemini
- **Chat Branching**: Edit messages and fork conversations (like ChatGPT)
- **RAG Pipeline**: Upload documents (.txt, .pdf) → chunk → embed → retrieve context for chat
- **Markdown Rendering**: Full markdown support with syntax highlighting (highlight.js)
- **Citations**: Source references displayed as badges on AI responses
- **UI Polish**: Timestamps, copy-to-clipboard, streaming cursor, sidebar search

## Tech Stack

- **Framework:** SvelteKit 5
- **Auth:** Auth.js (database sessions, OAuth, credentials)
- **Database:** PostgreSQL 16 + pgvector + Drizzle ORM
- **Styling:** TailwindCSS
- **AI Chat:** Vercel AI SDK + Google Gemini
- **Embeddings:** sentence-transformers/all-MiniLM-L6-v2 (Python FastAPI)
- **Markdown:** marked + highlight.js + DOMPurify
- **Email:** Nodemailer (SMTP)

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- pnpm

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd assignment3
pnpm install
```

### 2. Environment setup

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Start infrastructure

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL 16** with pgvector extension on port 5432
- **Python embedding service** (sentence-transformers/all-MiniLM-L6-v2) on port 8000

### 4. Push database schema

```bash
pnpm db:push
```

### 5. Start development server

```bash
pnpm dev
```

Visit http://localhost:5173

## Docker Services

| Service | Port | Description |
|---------|------|-------------|
| db | 5432 | PostgreSQL 16 with pgvector |
| embed-api | 8000 | Python FastAPI embedding service |

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret for Auth.js sessions |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |
| `SMTP_HOST` | SMTP server host (e.g., smtp.gmail.com) |
| `SMTP_PORT` | SMTP port (e.g., 587) |
| `SMTP_USER` | SMTP email address |
| `SMTP_PASS` | SMTP password / app password |
| `GEMINI_API_KEY` | Google Gemini API key |
| `EMBEDDING_API_URL` | Embedding service URL (default: http://localhost:8000) |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Send chat message (streaming) |
| `/api/conversations` | GET, POST, DELETE | Manage conversations |
| `/api/documents` | GET, POST | List/upload documents |
| `/api/documents/[id]` | DELETE | Delete a document |
| `/api/healthz` | GET | Health check (DB, pgvector, embeddings) |
| `/api/version` | GET | App version info |

## RAG Pipeline

1. **Upload**: User uploads .txt or .pdf file (max 10MB)
2. **Extract**: Text extracted from document (pdf-parse for PDFs)
3. **Chunk**: Text split into overlapping chunks (~500 chars)
4. **Embed**: Chunks sent to Python service for embedding (384-dim vectors)
5. **Store**: Embeddings stored in pgvector
6. **Retrieve**: On chat, query embedded → cosine similarity search → top-K chunks
7. **Augment**: Retrieved context injected into system prompt with `[Source N]` tags
8. **Cite**: Citations displayed as badges below AI responses

## Database Commands

```bash
pnpm db:push      # Push schema to database
pnpm db:migrate   # Run migrations
pnpm db:start     # Open Drizzle Studio
pnpm db:generate  # Generate migration files
```

## Troubleshooting

### Database connection fails
- Ensure Docker containers are running: `docker-compose ps`
- Verify `DATABASE_URL` in `.env` matches your PostgreSQL credentials

### Embedding service not responding
- Check: `curl http://localhost:8000/health`
- View logs: `docker-compose logs embed-api`
- First build takes time to download the ML model (~90MB)

### OAuth not working
- Google: Set authorized redirect URI to `http://localhost:5173/auth/callback/google`
- GitHub: Set callback URL to `http://localhost:5173/auth/callback/github`

### Emails not sending
- For Gmail: enable 2FA and generate an App Password
- Use the App Password as `SMTP_PASS`, not your regular password

### AI Chat not responding
- Verify `GEMINI_API_KEY` is set in `.env`
- Get a key from [Google AI Studio](https://aistudio.google.com/apikey)

### Health check
- Visit `/api/healthz` to check all service statuses
- Visit `/api/version` for app version info
