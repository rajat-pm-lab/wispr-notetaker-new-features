from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="Wispr Notetaker — Actionable CTAs",
    description="Feature enhancement: actionable next steps with one-click CTAs",
    version="1.0.0",
)

# Import routers
from app.api.meetings import router as meetings_router
from app.api.actions import router as actions_router

app.include_router(meetings_router)
app.include_router(actions_router)

# Serve frontend
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
app.mount("/static", StaticFiles(directory=frontend_dir), name="static")


@app.get("/")
async def serve_frontend():
    return FileResponse(os.path.join(frontend_dir, "index.html"))


@app.get("/health")
async def health():
    return {"status": "ok", "slack_configured": bool(os.getenv("SLACK_BOT_TOKEN"))}
