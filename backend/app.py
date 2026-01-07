from fastapi import FastAPI
from pydantic import BaseModel
from backend.ai.prompt_router import route_prompt

app = FastAPI()

class Query(BaseModel):
    question: str
    mode: str = "local"  # local | azure

@app.post("/ask")
def ask(query: Query):
    response = route_prompt(query.question, query.mode)
    return {"answer": response}
