# ExitVault

ExitVault is a verified organizational memory product demo. It now includes a FastAPI backend, a Hindsight memory layer, and backend-driven Q&A that can use real LLM responses when an OpenAI key is configured.

## Quick start

1. Create a virtual environment.
2. Install dependencies:

```bash
python -m pip install -r requirements.txt
```

3. Copy the example environment file and add your API key if you want real LLM answers:

```bash
copy .env.example .env
```

4. Start the backend:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

5. Open the app in the browser at:

```text
http://localhost:8000/
```

## Notes

- The app uses SQLite by default for local dev, but you can configure PostgreSQL with DATABASE_URL.
- If OPENAI_API_KEY is empty, the app falls back to evidence-based memory generation instead of pretending to be an LLM.
- The frontend still serves from the same project root, while the API endpoints live under /api/*.
