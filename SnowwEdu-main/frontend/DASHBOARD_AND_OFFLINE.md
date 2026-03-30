# SnowwEdu — Dashboard + Offline (View-Only)

## Where is my personal dashboard?
- **URL**: `http://localhost:3000/dashboard`
- **Navbar**: the **Dashboard** link appears **after you sign in**.
- **Sign in page**: `http://localhost:3000/sign-in`

The dashboard shows:
- your profile controls + **Log out**
- growth stats (saved items / last 7 days)
- recent learning activity

## Backend (FastAPI) — required for generation right now
Your current generation pages call the backend directly at:
- `http://127.0.0.1:8000/generate_course`
- `http://127.0.0.1:8000/generate_roadmap`

### Start backend
From `SnowwEdu/backend/`:

```bash
python -m uvicorn main:app --reload --port 8000
```

Make sure `SnowwEdu/backend/.env` contains:
- `GROQ_API_KEY=...`

### Quick check
Open backend docs:
- `http://127.0.0.1:8000/docs`

## Offline support (view-only)
**You cannot generate new courses/roadmaps offline** (LLM needs internet).
But you *can*:
- open the app shell offline (PWA/service worker)
- **view previously saved** courses/roadmaps offline (cached locally)

### How offline viewing works
- When you click **Save to dashboard** on results pages, the app stores a copy locally (for offline viewing).
- When you later open a saved item by id, the app tries:
  1) local/offline cache first
  2) server fetch if online

### How to test offline
1. Generate a course/roadmap while online.
2. Click **Save to dashboard** (this writes to DB + offline cache).
3. Turn off Wi‑Fi / enable airplane mode.
4. Re-open the saved item page (the app should load from offline cache).

## Notes
- If the dashboard link is missing, you are **not signed in** yet. Go to `/sign-in`.
- If generation fails, confirm the backend is running on port `8000` and Groq keys are set.

