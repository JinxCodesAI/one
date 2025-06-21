#!/usr/bin/env -S deno run --allow-read --allow-write
/**
 * Cross-platform cleanup script
 * Removes build artifacts and cache directories
 */

const pathsToClean = [
  "internal/ai-api/dist",
  "web/ai-chat/dist", 
  "node_modules/.cache"
];

async function cleanPath(path: string): Promise<void> {
  try {
    const stat = await Deno.stat(path);
    if (stat.isDirectory) {
      console.log(`🗑️ Removing directory: ${path}`);
      await Deno.remove(path, { recursive: true });
      console.log(`✅ Removed: ${path}`);
    } else {
      console.log(`🗑️ Removing file: ${path}`);
      await Deno.remove(path);
      console.log(`✅ Removed: ${path}`);
    }
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.log(`ℹ️ Path not found (already clean): ${path}`);
    } else {
      console.log(`⚠️ Could not remove ${path}: ${error.message}`);
    }
  }
}

async function main() {
  console.log("🧹 Starting cleanup...");
  
  for (const path of pathsToClean) {
    await cleanPath(path);
  }
  
  console.log("✨ Cleanup completed!");
}

if (import.meta.main) {
  main();
}
