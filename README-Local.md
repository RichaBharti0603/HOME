# H.O.M.E Local Private AI

H.O.M.E Local is an offline-first, highly capable private operating assistant designed to run on your local machine via Docker and Ollama. 

It provides secure, latency-free analysis of local logs, files, and system performance without ever sending your sensitive data to the cloud.

## Features
- **100% Offline Inference:** Runs using Llama3 on your own hardware via Ollama.
- **Hardware Native:** Automatically utilizes your local CPU or GPU.
- **File System Access:** Can read logs, check configuration files, and list directories within the mounted volume.
- **Cloud-Local Bridge:** Connects to the H.O.M.E SaaS dashboard so you can send cloud incidents to your local agent for secure analysis.

## One-Click Installation

### Windows (PowerShell)
Open PowerShell as Administrator and run:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; .\install-local.ps1
```

### macOS / Linux
Open your terminal and run:
```bash
chmod +x install-local.sh
./install-local.sh
```

## Manual Installation
If you prefer not to use the scripts, simply ensure Docker is installed and run:
```bash
docker-compose -f docker-compose.local.yml up -d
docker exec home_local_ollama ollama pull llama3
```

## Usage
Once installed, the Local Control Center will be available at:
👉 **[http://localhost:9000](http://localhost:9000)**

You can access the AI Chat interface here to request file analysis or system metrics.

## Privacy & Security
The AI agent only has access to the directory mounted in `docker-compose.local.yml`. By default, this is your user home directory. To change the scope of the AI's file access, edit the `volumes` section of the `agent` service in the compose file:
```yaml
    volumes:
      - /path/to/specific/logs:/mnt/host
```
