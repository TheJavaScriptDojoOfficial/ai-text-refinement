# AI Text Refinement

A **local-first** AI text refinement app. Paste text, pick a refinement mode (grammar, clarity, professional, Teams, email, Jira, etc.), and get a rewritten version using a **local LLM** via [Ollama](https://ollama.com)—no cloud API keys required.

**Stack:** React + Vite + TypeScript + Tailwind (frontend) · Python + FastAPI (backend) · Ollama (local LLM)

---

## Features

- **Refinement modes:** Grammar only, clarity, concise, professional, polite, assertive, bullet points, Teams message, email, Jira comment, or custom instruction
- **Exactness:** Strict, balanced, or loose preservation of structure and meaning
- **Entity preservation:** URLs, emails, IDs, numbers, file paths, and technical terms are masked and restored so the model doesn’t change them
- **Output validation:** Placeholder checks and optional retry so refined text stays consistent with the original entities

---

## Prerequisites

- **Python 3.9+** (for backend)
- **Node.js 18+** and **npm** (for frontend)
- **Ollama** (local LLM runtime)

---

## 1. Install Ollama

Ollama runs the local model. Install it first and keep it running while you use the app.

### macOS

- **Option A:** Download from [ollama.com](https://ollama.com) and open the app.
- **Option B:** Homebrew:
  ```bash
  brew install ollama
  ollama serve   # or start the Ollama app from Applications
  ```

### Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama serve
```

Or follow the official [Linux install guide](https://github.com/ollama/ollama/blob/main/docs/linux.md).

### Windows

- Download the installer from [ollama.com](https://ollama.com) and run it.
- Ollama usually runs in the background; ensure it’s started (system tray or restart the app).

---

## 2. Pull the default model

The app uses **qwen2.5:7b-instruct** by default. Pull it (once) with:

```bash
ollama pull qwen2.5:7b-instruct
```

Check that it’s available:

```bash
ollama list
```

You can use another model by changing the backend config (see [Configuration](#configuration) below).

---

## 3. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-text-refinement.git
cd ai-text-refinement
```

Replace `YOUR_USERNAME` with your GitHub username or the repo URL you use.

---

## 4. Run the backend (Python / FastAPI)

### macOS / Linux

```bash
cd backend

# Create a virtual environment (recommended)
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be at **http://localhost:8000**.

### Windows (PowerShell or Command Prompt)

```bash
cd backend

# Create a virtual environment (recommended)
python -m venv .venv
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 5. Run the frontend (React / Vite)

Open a **second terminal** in the project root.

### macOS / Linux / Windows

```bash
cd frontend

npm install
npm run dev
```

The app will be at **http://localhost:5173**. The Vite dev server proxies `/api` to the backend at `http://localhost:8000`, so you use the frontend URL only.

---

## 6. Use the app

1. **Ollama** – Make sure Ollama is running and the model is pulled (`ollama list`).
2. **Backend** – Running at http://localhost:8000 (see step 4).
3. **Frontend** – Running at http://localhost:5173 (see step 5).

Open **http://localhost:5173** in your browser, paste text, choose a mode (and optional exactness), then click **Refine**. The refined text appears on the right; you can copy it or use **Use output** to replace the input.

---

## Quick reference

| What              | Command / URL |
|-------------------|----------------|
| Backend API       | `http://localhost:8000` |
| Frontend app      | `http://localhost:5173` |
| API docs (Swagger)| http://localhost:8000/docs |
| Check Ollama      | `ollama list` |
| Default model     | `qwen2.5:7b-instruct` |

---

## Configuration

- **Backend (Ollama):** Edit `backend/app/config.py` to change `base_url`, `model`, or `timeout_seconds`.
- **Frontend API proxy:** In `frontend/vite.config.ts`, the `/api` proxy target is `http://localhost:8000`. Change it if your backend runs on another host/port.

---

## API example (mode-based)

```bash
curl -X POST http://localhost:8000/api/refine \
  -H "Content-Type: application/json" \
  -d '{
    "input_text": "can you send me that report asap",
    "mode": "professional",
    "exactness": "balanced"
  }'
```

Response:

```json
{
  "refined_text": "Could you please send me that report at your earliest convenience?",
  "mode": "professional",
  "entities_preserved": true,
  "validation_passed": true
}
```

When `mode` is `"custom"`, include `custom_instruction` in the request body.

---

## Project structure

```
├── frontend/          # React + Vite + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/  # UI (refiner, TextInput, etc.)
│   │   ├── config/      # Refinement modes for UI
│   │   ├── store/       # Refine state
│   │   ├── services/    # API client
│   │   └── ...
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/         # FastAPI routes
│   │   ├── services/    # Refiner, Ollama, prompt builder
│   │   ├── schemas/     # Request/response models
│   │   ├── utils/       # Entity extraction, validation
│   │   └── refinement_modes.py
│   └── requirements.txt
├── docker/             # Optional Dockerfile for backend
└── README.md
```

---

## Troubleshooting

- **“Failed to refine text” / connection errors**  
  Ensure Ollama is running (`ollama serve` or the Ollama app) and the model is pulled (`ollama pull qwen2.5:7b-instruct`). Backend must be able to reach `http://localhost:11434`.

- **Refined output empty or wrong**  
  Check the browser Network tab for the `/api/refine` response. If the backend returns 502, Ollama may be down or the model name in `backend/app/config.py` may not match what you have (`ollama list`).

- **Frontend can’t reach backend**  
  Start the backend first, then the frontend. Use http://localhost:5173 so the Vite proxy can forward `/api` to port 8000.

- **Python not found (Windows)**  
  Install Python from [python.org](https://www.python.org/downloads/) and ensure “Add Python to PATH” is checked. Use `python` and `pip` in the commands above.

---

## License

See the [LICENSE](LICENSE) file in the repository.
