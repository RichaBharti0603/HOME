import asyncio
from fastapi import FastAPI
from app.db.init_db import init_db
from app.routers.websites import router as website_router
from app.routers.monitoring import router as monitoring_router
from app.services.scheduler import monitoring_loop

app = FastAPI()

@app.on_event("startup")
async def startup():
    init_db()
    asyncio.create_task(monitoring_loop())

app.include_router(website_router)
app.include_router(monitoring_router)

@app.get("/")
def root():
    return {"message": "Home AI Backend Running"}
