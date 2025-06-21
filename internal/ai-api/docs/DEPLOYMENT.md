# AI API Deployment Guide

## Cross-Compilation for Linux

### Using Docker (Recommended)

The easiest way to compile the AI API for Linux from Windows is using Docker:

```powershell
# Run the build script
powershell -ExecutionPolicy Bypass -File build-linux.ps1
```

This will:
1. Build a Docker image with Deno 2.3.6
2. Compile the application inside the Linux container
3. Extract the `ai-api-linux` binary to your current directory

### Manual Docker Build

If you prefer to run the commands manually:

```bash
# Build the Docker image
docker build -f Dockerfile.build -t ai-api-builder .

# Create a container and extract the binary
docker create ai-api-builder /bin/sh
# Copy the container ID from the output, then:
docker cp <container-id>:/ai-api-linux ./ai-api-linux
docker rm <container-id>

# Clean up
docker rmi ai-api-builder
```

## Deploying to Linux Server

1. **Upload the binary** to your Linux server:
   ```bash
   scp ai-api-linux user@your-server:/path/to/deployment/
   ```

2. **Make it executable**:
   ```bash
   chmod +x ai-api-linux
   ```

3. **Set up environment variables** (create a `.env` file or export them):
   ```bash
   export OPENAI_API_KEY="your-openai-key"
   export GOOGLE_API_KEY="your-google-key"
   export OPENROUTER_API_KEY="your-openrouter-key"
   export PORT=3000
   ```

4. **Run the application**:
   ```bash
   ./ai-api-linux
   ```

## Running as a Service (systemd)

Create a systemd service file at `/etc/systemd/system/ai-api.service`:

```ini
[Unit]
Description=AI API Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/deployment
ExecStart=/path/to/deployment/ai-api-linux
Restart=always
RestartSec=10
Environment=OPENAI_API_KEY=your-openai-key
Environment=GOOGLE_API_KEY=your-google-key
Environment=OPENROUTER_API_KEY=your-openrouter-key
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

Then enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable ai-api
sudo systemctl start ai-api
sudo systemctl status ai-api
```

## Troubleshooting

### Windows Compilation Issues

If you encounter npm VFS errors on Windows, use the Docker approach instead of direct compilation.

### Binary Size

The compiled binary is approximately 95MB and includes all dependencies. This is normal for Deno compiled applications with npm dependencies.

### Port Configuration

The default port is 3000. You can change it by setting the `PORT` environment variable.
