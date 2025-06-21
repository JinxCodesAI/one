#!/usr/bin/env -S deno run --allow-read --allow-write
/**
 * Cross-platform justfile setup
 * Configures the justfile with the appropriate shell for the current OS
 */

async function setupJustfile() {
  const isWindows = Deno.build.os === "windows";
  
  console.log(`🔧 Setting up justfile for ${isWindows ? "Windows" : "Unix"} system...`);
  
  try {
    // Read the current justfile
    const justfileContent = await Deno.readTextFile("justfile");
    
    // Determine the correct shell configuration
    const shellConfig = isWindows 
      ? 'set shell := ["powershell.exe", "-c"]'
      : 'set shell := ["sh", "-c"]';
    
    // Replace the shell configuration line
    const updatedContent = justfileContent.replace(
      /set shell := \[.*\]/,
      shellConfig
    );
    
    // Write the updated justfile
    await Deno.writeTextFile("justfile", updatedContent);
    
    console.log(`✅ justfile configured for ${isWindows ? "Windows (PowerShell)" : "Unix (sh)"}`);
    console.log(`🎯 Shell setting: ${shellConfig}`);
    
  } catch (error) {
    console.error(`❌ Error setting up justfile: ${error.message}`);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  setupJustfile();
}
