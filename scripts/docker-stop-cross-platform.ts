#!/usr/bin/env -S deno run --allow-run
/**
 * Cross-platform Docker Compose stop script
 * Stops Docker Compose services gracefully
 */

async function runCommand(command: string, args: string[]): Promise<boolean> {
  try {
    const process = new Deno.Command(command, {
      args,
      stdout: "piped",
      stderr: "piped",
    }).spawn();
    
    const status = await process.status;
    return status.success;
  } catch (error) {
    console.log(`⚠️ Command failed: ${command} ${args.join(' ')} - ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("🛑 Stopping Docker Compose services...");
  
  // Try to stop development compose
  console.log("Stopping development services...");
  const devStopped = await runCommand("docker-compose", ["-f", "docker-compose.dev.yml", "down"]);
  if (devStopped) {
    console.log("✅ Development services stopped");
  } else {
    console.log("ℹ️ Development services were not running");
  }
  
  // Try to stop production compose
  console.log("Stopping production services...");
  const prodStopped = await runCommand("docker-compose", ["-f", "docker-compose.prod.yml", "down"]);
  if (prodStopped) {
    console.log("✅ Production services stopped");
  } else {
    console.log("ℹ️ Production services were not running");
  }
  
  console.log("🏁 Docker stop completed");
}

if (import.meta.main) {
  main();
}
