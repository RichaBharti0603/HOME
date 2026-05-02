#!/bin/bash
set -e

echo "=============================================="
echo " H.O.M.E. Local Private AI Installer (Unix)"
echo "=============================================="

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is installed and running."

# Download docker-compose if not present
if [ ! -f "docker-compose.local.yml" ]; then
    echo "📥 Downloading docker-compose.local.yml..."
    curl -sO https://raw.githubusercontent.com/home-ai/home/main/docker-compose.local.yml || echo "⚠️ Could not download compose file, using existing if available."
fi

echo "🚀 Starting H.O.M.E Local AI Stack..."
docker-compose -f docker-compose.local.yml up -d

echo "⏳ Waiting for Ollama to initialize..."
sleep 5

echo "🧠 Pulling Llama3 model (this may take a few minutes)..."
docker exec home_local_ollama ollama pull llama3

echo "=============================================="
echo "✅ Installation Complete!"
echo "👉 Local Control Center: http://localhost:9000"
echo "👉 You can now connect this agent to your H.O.M.E Cloud dashboard."
echo "=============================================="
