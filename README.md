# HeartGuard AI

HeartGuard AI is a cardiology readmission forecasting app with a FastAPI backend and a React/Vite frontend. It stores prediction history, shows dashboard and analytics views, supports patient-specific assistant questions, and can print a dynamic prediction PDF report.

## Project Structure

- `backend/` - FastAPI API, prediction model loading, assistant endpoint, history export.
- `frontend/` - React dashboard, prediction wizard, analytics, patients, and assistant UI.
- `data/` - training datasets and generated prediction history.
- `start-heartguard.ps1` / `Run HeartGuard AI.bat` - one-click local launcher.

## Run Locally

1. Install backend dependencies:

```powershell
cd backend
py -3.11 -m pip install -r requirements.txt
```

2. Install frontend dependencies:

```powershell
cd ..\frontend
npm install
```

3. Start everything:

```powershell
cd ..
.\start-heartguard.ps1
```

The launcher starts the backend on `http://127.0.0.1:8000`, the frontend on `http://127.0.0.1:5173`, then opens the app in the browser.

## OpenAI Assistant Setup

Copy `.env.example` to `.env` and add your key:

```powershell
Copy-Item .env.example .env
notepad .env
```

Never commit `.env` or real API keys.

## Model

The backend expects the trained model at:

```text
backend/models/readmission_model.joblib
```

The model file is large and is tracked with Git LFS. If you do not download LFS files, retrain it with:

```powershell
py -3.11 backend/train_readmission_model.py
```

## Checks

```powershell
cd frontend
npm run lint
npm run build
```

```powershell
cd ..
py -3.11 -m py_compile backend/main.py
```

## Deploy On Render

This repo includes `render.yaml` for a two-service Render Blueprint:

- `heartguard-ai-api` - FastAPI backend.
- `heartguard-ai` - static React/Vite frontend.

Steps:

1. Push this repository to GitHub.
2. Open Render Dashboard.
3. Click **New +** > **Blueprint**.
4. Connect the GitHub repo `harry16102003/heart-guard-ai`.
5. Render will detect `render.yaml`.
6. Add `OPENAI_API_KEY` when Render prompts for it, or leave it blank to use the local fallback assistant.
7. Apply the Blueprint.

After deploy:

- Website: `https://heartguard-ai.onrender.com`
- API: `https://heartguard-ai-api.onrender.com/api/health`
