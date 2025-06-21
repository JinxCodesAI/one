#!/usr/bin/env -S deno run --allow-run --allow-read
/**
 * Cross-platform unit test runner
 * Runs unit tests for all projects in the monorepo
 */

interface TestProject {
  name: string;
  path: string;
  hasTests: boolean;
}

const projects: TestProject[] = [
  { name: "AI API", path: "internal/ai-api", hasTests: true },
  { name: "AI Chat", path: "web/ai-chat", hasTests: true },
  { name: "Testing Infrastructure", path: "packages/testing-infrastructure", hasTests: false }
];

async function runTest(project: TestProject): Promise<boolean> {
  console.log(`\n🔬 Testing ${project.name}...`);
  
  try {
    const command = new Deno.Command("deno", {
      args: ["task", "--cwd", project.path, "test"],
      stdout: "piped",
      stderr: "piped",
    });
    
    const process = command.spawn();
    
    // Handle output
    const decoder = new TextDecoder();
    
    // Pipe stdout
    (async () => {
      for await (const chunk of process.stdout) {
        const text = decoder.decode(chunk);
        process.stdout.write(new TextEncoder().encode(text));
      }
    })();
    
    // Pipe stderr
    (async () => {
      for await (const chunk of process.stderr) {
        const text = decoder.decode(chunk);
        process.stderr.write(new TextEncoder().encode(text));
      }
    })();
    
    const status = await process.status;
    
    if (status.success) {
      console.log(`✅ ${project.name} tests passed`);
      return true;
    } else {
      if (!project.hasTests) {
        console.log(`ℹ️ No tests found in ${project.name} (expected)`);
        return true;
      } else {
        console.log(`❌ ${project.name} tests failed`);
        return false;
      }
    }
  } catch (error) {
    if (!project.hasTests) {
      console.log(`ℹ️ No tests found in ${project.name} (expected)`);
      return true;
    } else {
      console.log(`❌ Error running ${project.name} tests: ${error.message}`);
      return false;
    }
  }
}

async function main() {
  console.log("🔬 Running unit tests for all projects...");
  
  let allPassed = true;
  
  for (const project of projects) {
    const passed = await runTest(project);
    if (!passed) {
      allPassed = false;
    }
  }
  
  console.log("\n" + "=".repeat(50));
  if (allPassed) {
    console.log("✅ All unit tests completed successfully!");
  } else {
    console.log("❌ Some unit tests failed");
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
