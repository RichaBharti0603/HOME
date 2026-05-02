# H.O.M.E. Local Private AI Installer (Windows)
$ErrorActionPreference = "Stop"

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " H.O.M.E. Local Private AI Installer (Windows)" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# Check for Docker
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first: https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

try {
    docker info > $null 2>&1
} catch {
    Write-Host "❌ Docker daemon is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker is installed and running." -ForegroundColor Green

# Download docker-compose if not present
if (!(Test-Path "docker-compose.local.yml")) {
    Write-Host "📥 Downloading docker-compose.local.yml..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri "https://raw.githubusercontent.com/home-ai/home/main/docker-compose.local.yml" -OutFile "docker-compose.local.yml"
    } catch {
        Write-Host "⚠️ Could not download compose file. Ensure you are running this in the H.O.M.E directory." -ForegroundColor Yellow
    }
}

Write-Host "🚀 Starting H.O.M.E Local AI Stack..." -ForegroundColor Cyan
docker-compose -f docker-compose.local.yml up -d

Write-Host "⏳ Waiting for Ollama to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "🧠 Pulling Llama3 model (this may take a few minutes)..." -ForegroundColor Cyan
docker exec home_local_ollama ollama pull llama3

Write-Host "==============================================" -ForegroundColor Green
Write-Host "✅ Installation Complete!" -ForegroundColor Green
Write-Host "👉 Local Control Center: http://localhost:9000" -ForegroundColor White
Write-Host "👉 You can now connect this agent to your H.O.M.E Cloud dashboard." -ForegroundColor White
Write-Host "==============================================" -ForegroundColor Green
