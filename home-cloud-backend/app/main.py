from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, projects, monitors

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(monitors.router)