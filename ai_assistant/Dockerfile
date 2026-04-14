# Use official Python slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy AI assistant module
COPY ai_assistant/ ./ai_assistant/

# Set environment variable for Olama API key (can be overridden)
ENV OLAMA_API_KEY="local_key_here"

# Expose port for local FastAPI API
EXPOSE 8001

# Start AI assistant via FastAPI
CMD ["uvicorn", "ai_assistant.cli:app", "--host", "0.0.0.0", "--port", "8001"]