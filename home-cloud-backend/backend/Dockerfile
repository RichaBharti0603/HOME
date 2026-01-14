# backend/Dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy backend files
COPY . /app

# Install dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Expose port (Render uses $PORT)
ENV PORT 10000

# Start server
CMD uvicorn app:app --host 0.0.0.0 --port $PORT
