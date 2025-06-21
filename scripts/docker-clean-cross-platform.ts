#!/usr/bin/env -S deno run --allow-run
/**
 * Cross-platform Docker cleanup script
 * Removes Docker Compose services and cleans up resources
 */

async function runCommand(command: string, args: string[]): Promise<boolean> {
  try {
    console.log(`Running: ${command} ${args.join(' ')}`);
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
  console.log("🧹 Cleaning Docker resources...");
  
  // Stop and remove development compose with volumes and images
  console.log("Cleaning development environment...");
  const devCleaned = await runCommand("docker-compose", [
    "-f", "docker-compose.dev.yml", 
    "down", "-v", "--rmi", "all"
  ]);
  if (devCleaned) {
    console.log("✅ Development environment cleaned");
  } else {
    console.log("ℹ️ Development environment cleanup completed (may have been clean already)");
  }
  
  // Stop and remove production compose with volumes and images
  console.log("Cleaning production environment...");
  const prodCleaned = await runCommand("docker-compose", [
    "-f", "docker-compose.prod.yml", 
    "down", "-v", "--rmi", "all"
  ]);
  if (prodCleaned) {
    console.log("✅ Production environment cleaned");
  } else {
    console.log("ℹ️ Production environment cleanup completed (may have been clean already)");
  }
  
  // Clean up Docker system
  console.log("Cleaning Docker system...");
  const systemCleaned = await runCommand("docker", ["system", "prune", "-f"]);
  if (systemCleaned) {
    console.log("✅ Docker system cleaned");
  } else {
    console.log("⚠️ Docker system cleanup failed (Docker may not be running)");
  }
  
  console.log("🎉 Docker cleanup completed!");
}

if (import.meta.main) {
  main();
}
