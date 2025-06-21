# Windows Fix Script for just dev-all
# Run this if you're still getting cygpath errors

Write-Host "🔧 Fixing Windows compatibility for just dev-all..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "justfile")) {
    Write-Host "❌ Error: justfile not found. Make sure you're in the project root directory." -ForegroundColor Red
    exit 1
}

# Check if the cross-platform script exists
if (-not (Test-Path "scripts/dev-all-cross-platform.ts")) {
    Write-Host "📁 Creating scripts directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "scripts" | Out-Null
    
    Write-Host "📝 Creating cross-platform script..." -ForegroundColor Yellow
    @"
#!/usr/bin/env -S deno run --allow-run --allow-read
/**
 * Cross-platform development server orchestration
 * Replaces bash-specific dev-all recipe for Windows compatibility
 */

interface ProcessInfo {
  name: string;
  process: Deno.ChildProcess;
  port: number;
}

const processes: ProcessInfo[] = [];
let isShuttingDown = false;

/**
 * Cleanup function to terminate all child processes
 */
async function cleanup() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log("\n🛑 Shutting down all services...");
  
  for (const proc of processes) {
    try {
      console.log(`  Stopping `${proc.name}...`);
      
      // Try graceful shutdown first
      proc.process.kill("SIGTERM");
      
      // Wait a bit for graceful shutdown
      const timeout = setTimeout(() => {
        try {
          proc.process.kill("SIGKILL");
        } catch {
          // Process might already be dead
        }
      }, 3000);
      
      await proc.process.status;
      clearTimeout(timeout);
      
      console.log(`  ✅ `${proc.name} stopped`);
    } catch (error) {
      console.log(`  ⚠️ `${proc.name} may have already stopped`);
    }
  }
  
  console.log("🏁 All services stopped");
  Deno.exit(0);
}

/**
 * Start a service and track it
 */
async function startService(name: string, command: string[], port: number): Promise<void> {
  try {
    console.log(`🚀 Starting `${name}...`);
    
    const process = new Deno.Command(command[0], {
      args: command.slice(1),
      stdout: "piped",
      stderr: "piped",
    }).spawn();
    
    processes.push({ name, process, port });
    
    // Handle process output
    const decoder = new TextDecoder();
    
    // Pipe stdout
    (async () => {
      for await (const chunk of process.stdout) {
        const text = decoder.decode(chunk);
        // Prefix output with service name
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.trim()) {
            console.log(`[`${name}] `${line}`);
          }
        }
      }
    })();
    
    // Pipe stderr
    (async () => {
      for await (const chunk of process.stderr) {
        const text = decoder.decode(chunk);
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.trim()) {
            console.error(`[`${name}] `${line}`);
          }
        }
      }
    })();
    
    console.log(`✅ `${name} started on port `${port}`);
    
  } catch (error) {
    console.error(`❌ Failed to start `${name}:`, error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  // Set up signal handlers for graceful shutdown
  Deno.addSignalListener("SIGINT", cleanup);
  Deno.addSignalListener("SIGTERM", cleanup);
  
  // On Windows, we need to handle Ctrl+C differently
  if (Deno.build.os === "windows") {
    // Windows doesn't support SIGTERM, so we rely on SIGINT (Ctrl+C)
    globalThis.addEventListener("unload", cleanup);
  }
  
  try {
    console.log("🚀 Starting all services concurrently...");
    console.log("📡 AI API will be available at: http://localhost:8000");
    console.log("🌐 AI Chat will be available at: http://localhost:3000");
    console.log("Press Ctrl+C to stop all services");
    console.log("");
    
    // Start AI API service
    await startService(
      "AI-API", 
      ["deno", "task", "--cwd", "internal/ai-api", "dev"], 
      8000
    );
    
    // Small delay to let API start first
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start AI Chat service
    await startService(
      "AI-Chat", 
      ["deno", "task", "--cwd", "web/ai-chat", "dev"], 
      3000
    );
    
    console.log("");
    console.log("🎉 All services started successfully!");
    console.log("🌐 Open http://localhost:3000 in your browser");
    console.log("");
    
    // Wait for all processes to complete (they shouldn't unless there's an error)
    const promises = processes.map(proc => proc.process.status);
    await Promise.race(promises);
    
  } catch (error) {
    console.error("❌ Error starting services:", error.message);
    await cleanup();
    Deno.exit(1);
  }
}

// Handle unhandled promise rejections
globalThis.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  cleanup();
});

// Start the application
if (import.meta.main) {
  main();
}
"@ | Out-File -FilePath "scripts/dev-all-cross-platform.ts" -Encoding UTF8
}

# Check the current justfile dev-all recipe
$justfileContent = Get-Content "justfile" -Raw
if ($justfileContent -match "#!/usr/bin/env bash") {
    Write-Host "🔧 Fixing justfile dev-all recipe..." -ForegroundColor Yellow
    
    # Read the justfile and fix the dev-all recipe
    $lines = Get-Content "justfile"
    $newLines = @()
    $inDevAll = $false
    $skipUntilNextRecipe = $false
    
    foreach ($line in $lines) {
        if ($line -match "^dev-all:") {
            $inDevAll = $true
            $skipUntilNextRecipe = $false
            $newLines += $line
            $newLines += "    @echo `"🚀 Starting all services concurrently...`""
            $newLines += "    @echo `"📡 AI API will be available at: http://localhost:8000`""
            $newLines += "    @echo `"🌐 AI Chat will be available at: http://localhost:3000`""
            $newLines += "    @echo `"Press Ctrl+C to stop all services`""
            $newLines += "    @echo `"`""
            $newLines += "    @deno run --allow-run --allow-read scripts/dev-all-cross-platform.ts"
            $skipUntilNextRecipe = $true
        } elseif ($skipUntilNextRecipe -and $line -match "^[a-zA-Z].*:") {
            # Found next recipe, stop skipping
            $skipUntilNextRecipe = $false
            $inDevAll = $false
            $newLines += ""
            $newLines += $line
        } elseif (-not $skipUntilNextRecipe) {
            $newLines += $line
        }
    }
    
    # Write the fixed justfile
    $newLines | Out-File -FilePath "justfile" -Encoding UTF8
    Write-Host "✅ justfile fixed!" -ForegroundColor Green
} else {
    Write-Host "✅ justfile already has cross-platform dev-all recipe" -ForegroundColor Green
}

Write-Host ""
Write-Host "🧪 Testing the fix..." -ForegroundColor Cyan

# Test just --list
try {
    $output = & just --list 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ just --list works!" -ForegroundColor Green
    } else {
        Write-Host "❌ just --list failed: $output" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error running just --list: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Windows compatibility fix complete!" -ForegroundColor Green
Write-Host "You can now run: just dev-all" -ForegroundColor Cyan
