#!/usr/bin/env -S deno run --allow-run --allow-read --allow-env
/**
 * Cross-platform unit test runner
 * Runs unit tests for all projects in the monorepo
 */

// --- MODIFIED ---
// Added a `runner` property to distinguish between Deno and Node.js projects.
interface TestProject {
  name: string;
  path: string;
  hasTests: boolean;
  runner: "deno" | "node"; 
}

// --- MODIFIED ---
// Specified the correct runner for each project.
const projects: TestProject[] = [
  { name: "AI API", path: "internal/ai-api", hasTests: true, runner: "deno" },
  { name: "AI Chat", path: "web/ai-chat", hasTests: true, runner: "node" },
  { name: "Testing Infrastructure", path: "packages/testing-infrastructure", hasTests: false, runner: "deno" }
];

async function runTest(project: TestProject): Promise<boolean> {
  if (!project.hasTests) {
    console.log(`\nℹ️ Skipping tests for ${project.name} (no tests configured)`);
    return true;
  }

  console.log(`\n🔬 Testing ${project.name} with ${project.runner} runner...`);
  
  try {
    // --- MODIFIED ---
    // The command is now chosen based on the `runner` property.
    // For "node", we use `npm test`, which is the standard.
    // This assumes your `package.json` in `web/ai-chat` has a "test" script.
    const commandArray = project.runner === "node"
      ? ["npm", "test"] // Standard way to run tests in a Node.js project
      : ["deno", "task", "test"]; // The existing Deno-native way

    const process = new Deno.Command(commandArray[0], {
      args: commandArray.slice(1),
      cwd: project.path, // Explicitly set the CWD for the process
      stdout: "piped",
      stderr: "piped",
    }).spawn();
    
    // --- MODIFIED ---
    // Replaced the manual, inefficient piping with the recommended `pipeTo` method.
    // This properly streams the output from the child process to the main process.
    const outputPromise = process.stdout.pipeTo(Deno.stdout.writable);
    const errorPromise = process.stderr.pipeTo(Deno.stderr.writable);

    // Wait for the process to finish and for the streams to be fully piped.
    const [status] = await Promise.all([process.status, outputPromise, errorPromise]);
    
    if (status.success) {
      console.log(`\n✅ ${project.name} tests passed`);
      return true;
    } else {
      console.log(`\n❌ ${project.name} tests failed`);
      return false;
    }
  } catch (error) {
    console.log(`\n❌ Error running ${project.name} tests: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("🔬 Running unit tests for all projects...");
  
  let allPassed = true;
  
  // Running tests sequentially to keep output clean
  for (const project of projects) {
    if (!await runTest(project)) {
      allPassed = false;
    }
_  }
  
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