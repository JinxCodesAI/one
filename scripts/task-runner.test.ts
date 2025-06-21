import { assertEquals, assertExists, assertRejects } from "@std/assert";
import { describe, it, beforeEach, afterEach } from "@std/testing/bdd";
import { 
  PERMISSION_SETS, 
  PROJECTS, 
  executeTask, 
  executeMultiProjectTask,
  listTasks 
} from "./task-runner.ts";

describe("Task Runner", () => {
  describe("PERMISSION_SETS", () => {
    it("should have all required permission sets", () => {
      assertExists(PERMISSION_SETS.basic);
      assertExists(PERMISSION_SETS.development);
      assertExists(PERMISSION_SETS.testing);
      assertExists(PERMISSION_SETS.all);
    });

    it("should have correct basic permissions", () => {
      assertEquals(PERMISSION_SETS.basic, ["--allow-net", "--allow-env", "--allow-read"]);
    });

    it("should have correct development permissions", () => {
      assertEquals(PERMISSION_SETS.development, ["--allow-net", "--allow-env", "--allow-read", "--allow-write", "--watch"]);
    });

    it("should have correct testing permissions", () => {
      assertEquals(PERMISSION_SETS.testing, ["--allow-net", "--allow-env", "--allow-read", "--allow-write", "--allow-run", "--allow-sys"]);
    });

    it("should have correct all permissions", () => {
      assertEquals(PERMISSION_SETS.all, ["-A"]);
    });
  });

  describe("PROJECTS", () => {
    it("should have all required projects", () => {
      assertExists(PROJECTS["ai-api"]);
      assertExists(PROJECTS["ai-chat"]);
      assertExists(PROJECTS["testing-infrastructure"]);
    });

    it("should have correct ai-api project configuration", () => {
      const project = PROJECTS["ai-api"];
      assertEquals(project.name, "AI-API");
      assertEquals(project.path, "./internal/ai-api");
      assertEquals(project.color, "\x1b[36m");
      assertExists(project.tasks.dev);
      assertExists(project.tasks.start);
      assertExists(project.tasks.test);
      assertExists(project.tasks["test:e2e"]);
      assertExists(project.tasks.build);
    });

    it("should have correct ai-chat project configuration", () => {
      const project = PROJECTS["ai-chat"];
      assertEquals(project.name, "AI-Chat");
      assertEquals(project.path, "./web/ai-chat");
      assertEquals(project.color, "\x1b[35m");
      assertExists(project.tasks.dev);
      assertExists(project.tasks.build);
      assertExists(project.tasks.preview);
      assertExists(project.tasks.test);
      assertExists(project.tasks["test:e2e"]);
    });

    it("should have correct testing-infrastructure project configuration", () => {
      const project = PROJECTS["testing-infrastructure"];
      assertEquals(project.name, "Testing-Infrastructure");
      assertEquals(project.path, "./packages/testing-infrastructure");
      assertEquals(project.color, "\x1b[33m");
      assertExists(project.tasks.test);
    });
  });

  describe("Task Validation", () => {
    it("should validate that all tasks have required properties", () => {
      for (const [projectKey, project] of Object.entries(PROJECTS)) {
        for (const [taskName, task] of Object.entries(project.tasks)) {
          assertExists(task.command, `Task ${projectKey}:${taskName} missing command`);
          assertExists(task.permissions, `Task ${projectKey}:${taskName} missing permissions`);
          assertExists(task.description, `Task ${projectKey}:${taskName} missing description`);
          
          // Validate permissions exist
          assertExists(PERMISSION_SETS[task.permissions], `Task ${projectKey}:${taskName} has invalid permissions: ${task.permissions}`);
          
          // Validate command is array
          assertEquals(Array.isArray(task.command), true, `Task ${projectKey}:${taskName} command must be array`);
          
          // Validate command has at least one element
          assertEquals(task.command.length > 0, true, `Task ${projectKey}:${taskName} command cannot be empty`);
        }
      }
    });

    it("should validate that all projects have test tasks", () => {
      for (const [projectKey, project] of Object.entries(PROJECTS)) {
        assertExists(project.tasks.test, `Project ${projectKey} missing test task`);
      }
    });

    it("should validate that dev tasks use appropriate permissions", () => {
      for (const [projectKey, project] of Object.entries(PROJECTS)) {
        if (project.tasks.dev) {
          const devTask = project.tasks.dev;
          // Dev tasks should use development or all permissions
          const validPermissions = ["development", "all"];
          assertEquals(
            validPermissions.includes(devTask.permissions), 
            true, 
            `Project ${projectKey} dev task should use development or all permissions, got: ${devTask.permissions}`
          );
        }
      }
    });
  });

  describe("executeTask", () => {
    it("should reject unknown project", async () => {
      await assertRejects(
        () => executeTask("unknown-project", "test"),
        Error,
        "Unknown project: unknown-project"
      );
    });

    it("should reject unknown task", async () => {
      await assertRejects(
        () => executeTask("ai-api", "unknown-task"),
        Error,
        "Unknown task 'unknown-task' for project 'ai-api'"
      );
    });

    // Note: We can't easily test actual task execution without mocking Deno.Command
    // In a real environment, these would be integration tests
  });

  describe("executeMultiProjectTask", () => {
    it("should handle empty project list", async () => {
      const result = await executeMultiProjectTask("test", [], { verbose: false });
      assertEquals(result.success, true);
      assertEquals(Object.keys(result.results).length, 0);
    });

    // Note: Actual execution tests would require mocking or integration testing
  });

  describe("listTasks", () => {
    it("should not throw when listing all tasks", () => {
      // Capture console output to avoid cluttering test output
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (...args: any[]) => logs.push(args.join(" "));
      
      try {
        listTasks();
        // Should have logged something
        assertEquals(logs.length > 0, true);
      } finally {
        console.log = originalLog;
      }
    });

    it("should not throw when listing specific project tasks", () => {
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (...args: any[]) => logs.push(args.join(" "));
      
      try {
        listTasks("ai-api");
        assertEquals(logs.length > 0, true);
      } finally {
        console.log = originalLog;
      }
    });

    it("should handle unknown project gracefully", () => {
      const originalError = console.error;
      const errors: string[] = [];
      console.error = (...args: any[]) => errors.push(args.join(" "));
      
      try {
        listTasks("unknown-project");
        assertEquals(errors.length > 0, true);
        assertEquals(errors[0].includes("Unknown project"), true);
      } finally {
        console.error = originalError;
      }
    });
  });

  describe("Task Consistency", () => {
    it("should have consistent task naming across projects", () => {
      const commonTasks = ["test", "lint", "format"];
      
      for (const taskName of commonTasks) {
        const projectsWithTask = Object.entries(PROJECTS)
          .filter(([_, project]) => project.tasks[taskName])
          .map(([key, _]) => key);
        
        // All projects should have these common tasks
        assertEquals(
          projectsWithTask.length, 
          Object.keys(PROJECTS).length,
          `Task '${taskName}' should be available in all projects. Missing in: ${
            Object.keys(PROJECTS).filter(p => !projectsWithTask.includes(p)).join(", ")
          }`
        );
      }
    });

    it("should have consistent permission usage for similar tasks", () => {
      // Test tasks should all use testing permissions
      for (const [projectKey, project] of Object.entries(PROJECTS)) {
        if (project.tasks.test) {
          assertEquals(
            project.tasks.test.permissions,
            "testing",
            `Project ${projectKey} test task should use testing permissions`
          );
        }
        
        if (project.tasks["test:e2e"]) {
          assertEquals(
            project.tasks["test:e2e"].permissions,
            "testing",
            `Project ${projectKey} test:e2e task should use testing permissions`
          );
        }
      }

      // Lint and format tasks should use basic permissions
      for (const [projectKey, project] of Object.entries(PROJECTS)) {
        if (project.tasks.lint) {
          assertEquals(
            project.tasks.lint.permissions,
            "basic",
            `Project ${projectKey} lint task should use basic permissions`
          );
        }
        
        if (project.tasks.format) {
          assertEquals(
            project.tasks.format.permissions,
            "basic",
            `Project ${projectKey} format task should use basic permissions`
          );
        }
      }
    });
  });
});
