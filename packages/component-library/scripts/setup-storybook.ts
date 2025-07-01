#!/usr/bin/env -S deno run --allow-run --allow-read --allow-write

/**
 * Storybook Setup Script
 * 
 * Automates the setup of Storybook for the component library
 */

async function runCommand(command: string, args: string[] = []): Promise<void> {
  console.log(`Running: ${command} ${args.join(" ")}`);
  
  const process = new Deno.Command(command, {
    args,
    stdout: "inherit",
    stderr: "inherit",
  });
  
  const { success } = await process.output();
  
  if (!success) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

async function checkNodeInstalled(): Promise<boolean> {
  try {
    const process = new Deno.Command("node", {
      args: ["--version"],
      stdout: "piped",
      stderr: "piped",
    });
    
    const { success } = await process.output();
    return success;
  } catch {
    return false;
  }
}

async function checkNpmInstalled(): Promise<boolean> {
  try {
    const process = new Deno.Command("npm", {
      args: ["--version"],
      stdout: "piped",
      stderr: "piped",
    });
    
    const { success } = await process.output();
    return success;
  } catch {
    return false;
  }
}

async function main() {
  console.log("🚀 Setting up Storybook for @one/component-library");
  console.log("=" .repeat(50));
  
  // Check prerequisites
  console.log("\n📋 Checking prerequisites...");
  
  const nodeInstalled = await checkNodeInstalled();
  if (!nodeInstalled) {
    console.error("❌ Node.js is not installed. Please install Node.js first.");
    console.log("   Download from: https://nodejs.org/");
    Deno.exit(1);
  }
  console.log("✅ Node.js is installed");
  
  const npmInstalled = await checkNpmInstalled();
  if (!npmInstalled) {
    console.error("❌ npm is not installed. Please install npm first.");
    Deno.exit(1);
  }
  console.log("✅ npm is installed");
  
  // Install dependencies
  console.log("\n📦 Installing Storybook dependencies...");
  try {
    await runCommand("npm", ["install"]);
    console.log("✅ Dependencies installed successfully");
  } catch (error) {
    console.error("❌ Failed to install dependencies:", error.message);
    Deno.exit(1);
  }
  
  // Verify Storybook installation
  console.log("\n🔍 Verifying Storybook installation...");
  try {
    const process = new Deno.Command("npx", {
      args: ["storybook", "--version"],
      stdout: "piped",
      stderr: "piped",
    });
    
    const { success, stdout } = await process.output();
    if (success) {
      const version = new TextDecoder().decode(stdout).trim();
      console.log(`✅ Storybook installed: ${version}`);
    } else {
      throw new Error("Storybook not found");
    }
  } catch (error) {
    console.error("❌ Storybook verification failed:", error.message);
    Deno.exit(1);
  }
  
  // Success message
  console.log("\n🎉 Storybook setup completed successfully!");
  console.log("\n📚 Next steps:");
  console.log("   1. Start Storybook: deno task storybook");
  console.log("   2. Open http://localhost:6006 in your browser");
  console.log("   3. Explore the component documentation");
  console.log("\n🔧 Available commands:");
  console.log("   • deno task storybook         - Start development server");
  console.log("   • deno task storybook:build   - Build for production");
  console.log("   • deno task storybook:serve   - Serve built Storybook");
}

if (import.meta.main) {
  await main();
}
