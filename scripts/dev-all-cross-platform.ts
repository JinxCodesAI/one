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
      console.log(`  Stopping ${proc.name}...`);
      
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
      
      console.log(`  ✅ ${proc.name} stopped`);
    } catch (error) {
      console.log(`  ⚠️ ${proc.name} may have already stopped`);
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
    console.log(`🚀 Starting ${name}...`);
    
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
            console.log(`[${name}] ${line}`);
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
            console.error(`[${name}] ${line}`);
          }
        }
      }
    })();
    
    console.log(`✅ ${name} started on port ${port}`);
    
  } catch (error) {
    console.error(`❌ Failed to start ${name}:`, error.message);
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
