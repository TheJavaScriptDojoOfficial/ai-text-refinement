## AI Text Refinement

A minimal local-first AI text refinement application.

### Project structure

- **frontend**: Vite + React + TypeScript + TailwindCSS UI
- **backend**: FastAPI service with placeholder Ollama integration

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server will typically run on `http://localhost:5173`.

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API server will typically run on `http://localhost:8000`.

### API

- `GET /health` – basic health check
- `POST /refine` – placeholder endpoint that accepts text and refinement options and returns refined text

### Notes

- Frontend and backend are intentionally decoupled and can be deployed separately.
- Ollama integration is stubbed behind a service layer so you can later swap in real local LLM calls.

