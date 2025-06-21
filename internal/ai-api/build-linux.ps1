# PowerShell script to build Linux binary using Docker
Write-Host "Building AI API for Linux using Docker..." -ForegroundColor Green

# Check if Docker is available
try {
    docker --version | Out-Null
    Write-Host "Docker found" -ForegroundColor Green
} catch {
    Write-Host "Docker not found. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

# Build the Docker image and extract the binary
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build -f Dockerfile.build -t ai-api-builder .

if ($LASTEXITCODE -eq 0) {
    Write-Host "Extracting Linux binary..." -ForegroundColor Yellow

    # Create a temporary container and copy the binary
    $containerId = docker create ai-api-builder /bin/sh
    if ($containerId) {
        docker cp "${containerId}:/ai-api-linux" ./ai-api-linux
        docker rm $containerId | Out-Null

        if (Test-Path "./ai-api-linux") {
            Write-Host "Success! Linux binary created: ai-api-linux" -ForegroundColor Green
            Write-Host "You can now upload this file to your Linux server." -ForegroundColor Green
        } else {
            Write-Host "Failed to extract binary" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Failed to create container" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Docker build failed" -ForegroundColor Red
    exit 1
}

# Clean up
docker rmi ai-api-builder -f 2>$null
