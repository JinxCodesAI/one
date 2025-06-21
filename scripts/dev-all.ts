#!/usr/bin/env -S deno run --allow-run --allow-read
/**
 * Development orchestration script
 * Starts both AI API and AI Chat services concurrently
 */

interface ProcessInfo {
  name: string;
  command: string[];
  cwd: string;
  color: string;
}

const processes: ProcessInfo[] = [
  {
    name: "AI-API",
    command: ["deno", "task", "dev"],
    cwd: "./internal/ai-api",
    color: "\x1b[36m", // Cyan
  },
  {
    name: "AI-Chat",
    command: ["deno", "task", "dev"],
    cwd: "./web/ai-chat",
    color: "\x1b[35m", // Magenta
  },
];

const RESET_COLOR = "\x1b[0m";

/**
 * Start a process and handle its output
 */
async function startProcess(processInfo: ProcessInfo): Promise<void> {
  const { name, command, cwd, color } = processInfo;
  
  console.log(`${color}[${name}]${RESET_COLOR} Starting: ${command.join(" ")} in ${cwd}`);
  
  try {
    const process = new Deno.Command(command[0], {
      args: command.slice(1),
      cwd,
      stdout: "piped",
      stderr: "piped",
    });
    
    const child = process.spawn();
    
    // Handle stdout
    const stdoutReader = child.stdout.getReader();
    const stderrReader = child.stderr.getReader();
    
    // Read stdout
    (async () => {
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await stdoutReader.read();
          if (done) break;
          
          const text = decoder.decode(value);
          const lines = text.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            console.log(`${color}[${name}]${RESET_COLOR} ${line}`);
          }
        }
      } catch (error) {
        console.error(`${color}[${name}]${RESET_COLOR} stdout error:`, error);
      }
    })();
    
    // Read stderr
    (async () => {
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await stderrReader.read();
          if (done) break;
          
          const text = decoder.decode(value);
          const lines = text.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            console.error(`${color}[${name}]${RESET_COLOR} ${line}`);
          }
        }
      } catch (error) {
        console.error(`${color}[${name}]${RESET_COLOR} stderr error:`, error);
      }
    })();
    
    // Wait for process to complete
    const status = await child.status;
    console.log(`${color}[${name}]${RESET_COLOR} Process exited with code: ${status.code}`);
    
  } catch (error) {
    console.error(`${color}[${name}]${RESET_COLOR} Failed to start:`, error);
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log("🚀 Starting development environment...");
  console.log("📡 AI API will be available at: http://localhost:8000");
  console.log("🌐 AI Chat will be available at: http://localhost:3000");
  console.log("Press Ctrl+C to stop all services\n");
  
  // Start all processes concurrently
  const promises = processes.map(startProcess);
  
  // Handle Ctrl+C gracefully
  Deno.addSignalListener("SIGINT", () => {
    console.log("\n🛑 Shutting down all services...");
    Deno.exit(0);
  });
  
  // Wait for all processes (they should run indefinitely)
  await Promise.all(promises);
}

if (import.meta.main) {
  await main();
}
