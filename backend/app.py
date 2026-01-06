from fastapi import FastAPI
from routes import ai_assistant, compliance, monitoring
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="HOME AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(ai_assistant.router)
app.include_router(compliance.router)
app.include_router(monitoring.router)
