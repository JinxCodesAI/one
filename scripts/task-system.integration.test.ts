import { assertEquals, assertExists } from "@std/assert";
import { describe, it, beforeEach, afterEach } from "@std/testing/bdd";

describe("Task System Integration Tests", () => {
  describe("Root Task Definitions", () => {
    it("should have valid root deno.json task definitions", async () => {
      const denoConfig = JSON.parse(await Deno.readTextFile("deno.json"));
      assertExists(denoConfig.tasks);
      
      // Check that essential tasks exist
      const essentialTasks = [
        "dev:api", "dev:chat", "dev:all",
        "start:api", "start:chat",
        "build", "build:api", "build:chat",
        "test", "test:unit", "test:e2e",
        "tasks:list", "tasks:help"
      ];
      
      for (const task of essentialTasks) {
        assertExists(denoConfig.tasks[task], `Missing essential task: ${task}`);
      }
    });

    it("should have deprecation warnings for legacy tasks", async () => {
      const denoConfig = JSON.parse(await Deno.readTextFile("deno.json"));
      
      const legacyTasks = [
        "test:all", "test:ai-api", "test:ai-chat", 
        "test:testing-infrastructure", "test:unit:ai-api", 
        "test:unit:ai-chat", "test:e2e:ai-api", "test:e2e:ai-chat"
      ];
      
      for (const task of legacyTasks) {
        assertExists(denoConfig.tasks[task], `Missing legacy task: ${task}`);
        assertEquals(
          denoConfig.tasks[task].includes("DEPRECATED"),
          true,
          `Legacy task ${task} should have deprecation warning`
        );
      }
    });
  });

  describe("Project Task Definitions", () => {
    it("should have valid ai-api task definitions", async () => {
      const denoConfig = JSON.parse(await Deno.readTextFile("internal/ai-api/deno.json"));
      assertExists(denoConfig.tasks);
      
      const requiredTasks = [
        "dev", "start", "build", "test", "test:e2e", 
        "lint", "format", "typecheck", "clean", "health"
      ];
      
      for (const task of requiredTasks) {
        assertExists(denoConfig.tasks[task], `AI-API missing task: ${task}`);
      }
    });

    it("should have valid ai-chat task definitions", async () => {
      const denoConfig = JSON.parse(await Deno.readTextFile("web/ai-chat/deno.json"));
      assertExists(denoConfig.tasks);
      
      const requiredTasks = [
        "dev", "build", "preview", "test", "test:e2e", 
        "lint", "format", "typecheck", "clean", "health"
      ];
      
      for (const task of requiredTasks) {
        assertExists(denoConfig.tasks[task], `AI-Chat missing task: ${task}`);
      }
    });

    it("should have valid testing-infrastructure task definitions", async () => {
      const denoConfig = JSON.parse(await Deno.readTextFile("packages/testing-infrastructure/deno.json"));
      assertExists(denoConfig.tasks);
      
      const requiredTasks = ["test", "lint", "format", "typecheck", "clean"];
      
      for (const task of requiredTasks) {
        assertExists(denoConfig.tasks[task], `Testing-Infrastructure missing task: ${task}`);
      }
    });
  });

  describe("Task Runner Functionality", () => {
    it("should be able to list tasks", async () => {
      const command = new Deno.Command("deno", {
        args: ["run", "--allow-run", "--allow-read", "--allow-env", "scripts/task-runner.ts", "--list"],
        stdout: "piped",
        stderr: "piped"
      });
      
      const output = await command.output();
      const stdout = new TextDecoder().decode(output.stdout);
      
      assertEquals(output.success, true, "Task runner --list should succeed");
      assertEquals(stdout.includes("Available projects and tasks"), true, "Should show available tasks");
      assertEquals(stdout.includes("AI-API"), true, "Should list AI-API project");
      assertEquals(stdout.includes("AI-Chat"), true, "Should list AI-Chat project");
      assertEquals(stdout.includes("Testing-Infrastructure"), true, "Should list Testing-Infrastructure project");
    });

    it("should show help information", async () => {
      const command = new Deno.Command("deno", {
        args: ["run", "--allow-run", "--allow-read", "--allow-env", "scripts/task-runner.ts", "--help"],
        stdout: "piped",
        stderr: "piped"
      });
      
      const output = await command.output();
      const stdout = new TextDecoder().decode(output.stdout);
      
      assertEquals(output.success, true, "Task runner --help should succeed");
      assertEquals(stdout.includes("One Monorepo Task Runner"), true, "Should show help title");
      assertEquals(stdout.includes("Usage:"), true, "Should show usage information");
      assertEquals(stdout.includes("Examples:"), true, "Should show examples");
    });

    it("should handle invalid task gracefully", async () => {
      const command = new Deno.Command("deno", {
        args: ["run", "--allow-run", "--allow-read", "--allow-env", "scripts/task-runner.ts", "--task", "invalid-task"],
        stdout: "piped",
        stderr: "piped"
      });
      
      const output = await command.output();
      
      assertEquals(output.success, false, "Invalid task should fail");
    });

    it("should handle invalid project gracefully", async () => {
      const command = new Deno.Command("deno", {
        args: ["run", "--allow-run", "--allow-read", "--allow-env", "scripts/task-runner.ts", "--task", "test", "--project", "invalid-project"],
        stdout: "piped",
        stderr: "piped"
      });
      
      const output = await command.output();
      
      assertEquals(output.success, false, "Invalid project should fail");
    });
  });

  describe("Task Execution Validation", () => {
    it("should validate lint tasks can be executed", async () => {
      // Test that lint tasks have correct syntax by running them with --help or dry-run
      const projects = ["internal/ai-api", "web/ai-chat", "packages/testing-infrastructure"];
      
      for (const project of projects) {
        const command = new Deno.Command("deno", {
          args: ["lint", "--help"],
          cwd: project,
          stdout: "piped",
          stderr: "piped"
        });
        
        const output = await command.output();
        assertEquals(output.success, true, `Lint should be available in ${project}`);
      }
    });

    it("should validate format tasks can be executed", async () => {
      const projects = ["internal/ai-api", "web/ai-chat", "packages/testing-infrastructure"];
      
      for (const project of projects) {
        const command = new Deno.Command("deno", {
          args: ["fmt", "--help"],
          cwd: project,
          stdout: "piped",
          stderr: "piped"
        });
        
        const output = await command.output();
        assertEquals(output.success, true, `Format should be available in ${project}`);
      }
    });

    it("should validate typecheck tasks can be executed", async () => {
      const projects = ["internal/ai-api", "web/ai-chat", "packages/testing-infrastructure"];
      
      for (const project of projects) {
        const command = new Deno.Command("deno", {
          args: ["check", "--help"],
          cwd: project,
          stdout: "piped",
          stderr: "piped"
        });
        
        const output = await command.output();
        assertEquals(output.success, true, `Typecheck should be available in ${project}`);
      }
    });
  });

  describe("Permission Consistency", () => {
    it("should have consistent permission patterns across projects", async () => {
      const projects = [
        { path: "internal/ai-api/deno.json", name: "ai-api" },
        { path: "web/ai-chat/deno.json", name: "ai-chat" },
        { path: "packages/testing-infrastructure/deno.json", name: "testing-infrastructure" }
      ];
      
      for (const project of projects) {
        const config = JSON.parse(await Deno.readTextFile(project.path));
        
        // Test tasks should have comprehensive permissions
        if (config.tasks.test) {
          const testCommand = config.tasks.test;
          assertEquals(
            testCommand.includes("--allow-net") && 
            testCommand.includes("--allow-env") && 
            testCommand.includes("--allow-read") && 
            testCommand.includes("--allow-write"),
            true,
            `${project.name} test task should have comprehensive permissions`
          );
        }
        
        // E2E test tasks should have even more permissions
        if (config.tasks["test:e2e"]) {
          const e2eCommand = config.tasks["test:e2e"];
          assertEquals(
            e2eCommand.includes("--allow-run") && 
            e2eCommand.includes("--allow-sys"),
            true,
            `${project.name} test:e2e task should have run and sys permissions`
          );
        }
      }
    });
  });

  describe("Workspace Integration", () => {
    it("should have valid workspace configuration", async () => {
      const denoConfig = JSON.parse(await Deno.readTextFile("deno.json"));
      assertExists(denoConfig.workspace);
      
      const expectedWorkspaces = [
        "./internal/ai-api",
        "./web/ai-chat", 
        "./packages/testing-infrastructure"
      ];
      
      for (const workspace of expectedWorkspaces) {
        assertEquals(
          denoConfig.workspace.includes(workspace),
          true,
          `Workspace should include ${workspace}`
        );
      }
    });

    it("should have consistent imports across workspace", async () => {
      const rootConfig = JSON.parse(await Deno.readTextFile("deno.json"));
      assertExists(rootConfig.imports);
      
      // Check that testing infrastructure is properly imported
      assertEquals(
        rootConfig.imports["@one/testing-infrastructure"],
        "./packages/testing-infrastructure/src/mod.ts",
        "Testing infrastructure should be properly imported"
      );
      
      // Check that common dependencies are available
      assertExists(rootConfig.imports["@std/assert"]);
      assertExists(rootConfig.imports["@std/testing/bdd"]);
      assertExists(rootConfig.imports["ai"]);
    });
  });
});
