#!/usr/bin/env -S deno run --allow-run --allow-read --allow-write --allow-env
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
    } catch (_error) {
      console.log(`  ⚠️ ${proc.name} may have already stopped`);
    }
  }

  console.log("🏁 All services stopped");
  Deno.exit(0);
}

/**
 * Start a service and track it
 * --- MODIFIED ---
 * Added an optional `cwd` parameter to explicitly set the working directory for the command.
 */
function startService(
  name: string,
  command: string[],
  port: number,
  cwd?: string,
): Promise<void> {
  try {
    console.log(`🚀 Starting ${name}...`);

    // --- MODIFIED ---
    // The `cwd` option is passed directly to Deno.Command. This ensures the process
    // starts in the correct directory, which is crucial for tools like Vite.
    const process = new Deno.Command(command[0], {
      args: command.slice(1),
      cwd: cwd, // Sets the working directory for the new process
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
        const lines = text.split("\n");
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
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.trim()) {
            console.error(`[${name}] error: ${line}`);
          }
        }
      }
    })();

    console.log(`✅ ${name} started on port ${port}`);
  } catch (error) {
    console.error(`❌ Failed to start ${name}:`, (error as Error).message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  // Set up signal handlers for graceful shutdown
  Deno.addSignalListener("SIGINT", cleanup);

  // Only add SIGTERM listener on Unix systems (Windows doesn't support it)
  if (Deno.build.os !== "windows") {
    Deno.addSignalListener("SIGTERM", cleanup);
  }

  // On Windows, add additional cleanup handlers
  if (Deno.build.os === "windows") {
    // Windows supports SIGBREAK (Ctrl+Break)
    try {
      Deno.addSignalListener("SIGBREAK", cleanup);
    } catch {
      // SIGBREAK might not be available in all Windows versions
    }
    globalThis.addEventListener("unload", cleanup);
  }

  try {
    console.log("🚀 Starting all services concurrently...");
    console.log("📡 AI API will be available at: http://localhost:8000");
    console.log("🌐 AI Chat will be available at: http://localhost:3000");
    console.log("Press Ctrl+C to stop all services");
    console.log("");

    // This step is fine, ensures Deno dependencies are cached. No changes needed.
    console.log("🔄 Ensuring Deno dependencies are cached...");
    try {
      const cacheProcess = new Deno.Command("deno", {
        args: ["cache", "web/ai-chat/src/main.tsx"],
      }).outputSync();
      if (cacheProcess.status.success) {
        console.log("✅ Deno dependencies cached");
      } else {
        console.warn("⚠️  Could not cache Deno dependencies.");
      }
    } catch (error) {
      console.log(
        "⚠️ Dependency resolution warning:",
        (error as Error).message,
      );
    }

    // Start AI API service
    // --- UNCHANGED ---
    // This is a Deno service, so running it with `deno task` is correct.
    await startService(
      "AI-API",
      ["deno", "task", "--cwd", "internal/ai-api", "dev"],
      8000,
    );

    // Small delay to let API start first
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Start AI Chat service
    // --- MODIFIED ---
    // This is the key change. We now run `npx vite` directly.
    // We pass the working directory 'web/ai-chat' as the `cwd` option.
    // This replicates the successful manual test you performed.
    await startService(
      "AI-Chat",
      ["npx", "vite"],
      3000,
      "web/ai-chat",
    );

    console.log("");
    console.log("🎉 All services started successfully!");
    console.log("🌐 Open http://localhost:3000 in your browser");
    console.log("");

    // Wait for all processes to complete (they shouldn't unless there's an error)
    const promises = processes.map((proc) => proc.process.status);
    await Promise.race(promises);
  } catch (error) {
    console.error("❌ Error starting services:", (error as Error).message);
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
