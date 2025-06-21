#!/usr/bin/env -S deno run --allow-run --allow-read --allow-env
/**
 * Centralized Task Runner for One Monorepo
 * Provides consistent task execution across all workspace projects
 */

import { parseArgs } from "jsr:@std/cli/parse-args";

// Standard permission sets
export const PERMISSION_SETS = {
  basic: ["--allow-net", "--allow-env", "--allow-read"],
  development: ["--allow-net", "--allow-env", "--allow-read", "--allow-write", "--watch"],
  testing: ["--allow-net", "--allow-env", "--allow-read", "--allow-write", "--allow-run", "--allow-sys"],
  all: ["-A"]
} as const;

// Project configurations
export interface ProjectConfig {
  name: string;
  path: string;
  color: string;
  tasks: Record<string, TaskConfig>;
}

export interface TaskConfig {
  command: string[];
  permissions: keyof typeof PERMISSION_SETS;
  description: string;
  parallel?: boolean;
  dependencies?: string[];
}

// Workspace projects
export const PROJECTS: Record<string, ProjectConfig> = {
  "ai-api": {
    name: "AI-API",
    path: "./internal/ai-api",
    color: "\x1b[36m", // Cyan
    tasks: {
      dev: {
        command: ["deno", "run", "main.ts"],
        permissions: "development",
        description: "Start AI-API development server"
      },
      start: {
        command: ["deno", "run", "main.ts"],
        permissions: "basic",
        description: "Start AI-API production server"
      },
      test: {
        command: ["deno", "test", "--ignore=e2e/"],
        permissions: "testing",
        description: "Run AI-API unit tests"
      },
      "test:e2e": {
        command: ["deno", "test", "e2e/**/*.e2e.ts"],
        permissions: "testing",
        description: "Run AI-API E2E tests"
      },
      build: {
        command: ["deno", "compile", "--output", "dist/ai-api", "main.ts"],
        permissions: "basic",
        description: "Build AI-API for production"
      },
      lint: {
        command: ["deno", "lint"],
        permissions: "basic",
        description: "Run AI-API linter"
      },
      format: {
        command: ["deno", "fmt"],
        permissions: "basic",
        description: "Format AI-API code"
      }
    }
  },
  "ai-chat": {
    name: "AI-Chat",
    path: "./web/ai-chat",
    color: "\x1b[35m", // Magenta
    tasks: {
      dev: {
        command: ["deno", "run", "--node-modules-dir", "npm:vite"],
        permissions: "all",
        description: "Start AI-Chat development server"
      },
      build: {
        command: ["deno", "run", "--node-modules-dir", "npm:vite", "build"],
        permissions: "all",
        description: "Build AI-Chat for production"
      },
      preview: {
        command: ["deno", "run", "--node-modules-dir", "npm:vite", "preview"],
        permissions: "all",
        description: "Preview AI-Chat production build"
      },
      test: {
        command: ["deno", "test", "src/"],
        permissions: "testing",
        description: "Run AI-Chat unit tests"
      },
      "test:e2e": {
        command: ["deno", "test", "e2e/**/*.e2e.ts"],
        permissions: "testing",
        description: "Run AI-Chat E2E tests"
      },
      lint: {
        command: ["deno", "lint", "src/", "e2e/"],
        permissions: "basic",
        description: "Run AI-Chat linter"
      },
      format: {
        command: ["deno", "fmt", "src/", "e2e/"],
        permissions: "basic",
        description: "Format AI-Chat code"
      }
    }
  },
  "testing-infrastructure": {
    name: "Testing-Infrastructure",
    path: "./packages/testing-infrastructure",
    color: "\x1b[33m", // Yellow
    tasks: {
      test: {
        command: ["deno", "test"],
        permissions: "testing",
        description: "Run testing infrastructure tests"
      },
      lint: {
        command: ["deno", "lint", "src/"],
        permissions: "basic",
        description: "Run testing infrastructure linter"
      },
      format: {
        command: ["deno", "fmt", "src/"],
        permissions: "basic",
        description: "Format testing infrastructure code"
      }
    }
  }
};

const RESET_COLOR = "\x1b[0m";

/**
 * Execute a task for a specific project
 */
export async function executeTask(
  projectKey: string,
  taskName: string,
  options: { verbose?: boolean; parallel?: boolean } = {}
): Promise<{ success: boolean; output: string; error?: string }> {
  const project = PROJECTS[projectKey];
  if (!project) {
    throw new Error(`Unknown project: ${projectKey}`);
  }

  const task = project.tasks[taskName];
  if (!task) {
    if (options.verbose) {
      console.log(`${project.color}[${project.name}]${RESET_COLOR} Skipping - task '${taskName}' not available`);
    }
    return { success: true, output: `Task '${taskName}' not available for project '${projectKey}'` };
  }

  const { color, name, path } = project;
  const { command, permissions } = task;
  
  // Build full command with permissions (only for deno run commands)
  const permissionFlags = PERMISSION_SETS[permissions];
  let fullCommand: string[];

  if (command[0] === "deno" && command[1] === "run") {
    // For deno run commands, insert permissions after "deno run"
    fullCommand = [...command.slice(0, 2), ...permissionFlags, ...command.slice(2)];
  } else if (command[0] === "deno" && (command[1] === "test" || command[1] === "compile")) {
    // For deno test and compile commands, insert permissions after the subcommand
    fullCommand = [...command.slice(0, 2), ...permissionFlags, ...command.slice(2)];
  } else {
    // For other commands (lint, fmt, etc.), don't add permissions
    fullCommand = [...command];
  }

  if (options.verbose) {
    console.log(`${color}[${name}]${RESET_COLOR} Running: ${fullCommand.join(" ")} in ${path}`);
  }

  try {
    const process = new Deno.Command(fullCommand[0], {
      args: fullCommand.slice(1),
      cwd: path,
      stdout: "piped",
      stderr: "piped",
    });

    const child = process.spawn();
    const output = await child.output();
    
    const stdout = new TextDecoder().decode(output.stdout);
    const stderr = new TextDecoder().decode(output.stderr);
    
    if (output.success) {
      if (options.verbose && stdout) {
        console.log(`${color}[${name}]${RESET_COLOR} ${stdout}`);
      }
      return { success: true, output: stdout };
    } else {
      const errorMsg = stderr || stdout || "Unknown error";
      console.error(`${color}[${name}]${RESET_COLOR} Error: ${errorMsg}`);
      return { success: false, output: stdout, error: errorMsg };
    }
  } catch (error) {
    const errorMsg = `Failed to execute task: ${error instanceof Error ? error.message : String(error)}`;
    console.error(`${color}[${name}]${RESET_COLOR} ${errorMsg}`);
    return { success: false, output: "", error: errorMsg };
  }
}

/**
 * Execute tasks across multiple projects
 */
export async function executeMultiProjectTask(
  taskName: string,
  projectKeys: string[] = Object.keys(PROJECTS),
  options: { verbose?: boolean; parallel?: boolean; continueOnError?: boolean } = {}
): Promise<{ success: boolean; results: Record<string, any> }> {
  console.log(`🚀 Running '${taskName}' across projects: ${projectKeys.join(", ")}`);
  
  const results: Record<string, any> = {};
  let overallSuccess = true;

  if (options.parallel) {
    // Execute tasks in parallel
    const promises = projectKeys.map(async (projectKey) => {
      const result = await executeTask(projectKey, taskName, options);
      results[projectKey] = result;
      if (!result.success) {
        overallSuccess = false;
      }
      return result;
    });

    await Promise.all(promises);
  } else {
    // Execute tasks sequentially
    for (const projectKey of projectKeys) {
      const result = await executeTask(projectKey, taskName, options);
      results[projectKey] = result;
      
      if (!result.success) {
        overallSuccess = false;
        if (!options.continueOnError) {
          console.error(`❌ Task '${taskName}' failed for project '${projectKey}'. Stopping execution.`);
          break;
        }
      }
    }
  }

  // Print summary
  console.log(`\n📊 Task '${taskName}' Summary:`);
  for (const [projectKey, result] of Object.entries(results)) {
    const status = result.success ? "✅ PASSED" : "❌ FAILED";
    const project = PROJECTS[projectKey];
    console.log(`  ${project.color}[${project.name}]${RESET_COLOR} ${status}`);
  }

  return { success: overallSuccess, results };
}

/**
 * List available tasks
 */
export function listTasks(projectKey?: string): void {
  if (projectKey) {
    const project = PROJECTS[projectKey];
    if (!project) {
      console.error(`Unknown project: ${projectKey}`);
      return;
    }
    
    console.log(`\n📋 Available tasks for ${project.color}[${project.name}]${RESET_COLOR}:`);
    for (const [taskName, task] of Object.entries(project.tasks)) {
      console.log(`  ${taskName.padEnd(15)} - ${task.description}`);
    }
  } else {
    console.log("\n📋 Available projects and tasks:");
    for (const [projectKey, project] of Object.entries(PROJECTS)) {
      console.log(`\n${project.color}[${project.name}]${RESET_COLOR} (${projectKey}):`);
      for (const [taskName, task] of Object.entries(project.tasks)) {
        console.log(`  ${taskName.padEnd(15)} - ${task.description}`);
      }
    }
  }
}

/**
 * Main CLI interface
 */
async function main(): Promise<void> {
  const args = parseArgs(Deno.args, {
    string: ["project", "task"],
    boolean: ["verbose", "parallel", "continue-on-error", "list", "help"],
    alias: {
      p: "project",
      t: "task",
      v: "verbose",
      l: "list",
      h: "help"
    },
    default: {
      verbose: false,
      parallel: false,
      "continue-on-error": false,
      list: false,
      help: false
    }
  });

  if (args.help) {
    console.log(`
🛠️  One Monorepo Task Runner

Usage:
  deno run scripts/task-runner.ts [options]

Options:
  -t, --task <name>           Task to run
  -p, --project <name>        Specific project (default: all)
  -v, --verbose               Verbose output
  --parallel                  Run tasks in parallel
  --continue-on-error         Continue on task failure
  -l, --list                  List available tasks
  -h, --help                  Show this help

Examples:
  deno run scripts/task-runner.ts --task test
  deno run scripts/task-runner.ts --task dev --project ai-api
  deno run scripts/task-runner.ts --task test --parallel --verbose
  deno run scripts/task-runner.ts --list
    `);
    return;
  }

  if (args.list) {
    listTasks(args.project);
    return;
  }

  if (!args.task) {
    console.error("❌ Task name is required. Use --task <name> or --help for usage.");
    Deno.exit(1);
  }

  const projectKeys = args.project ? [args.project] : Object.keys(PROJECTS);
  const options = {
    verbose: args.verbose,
    parallel: args.parallel,
    continueOnError: args["continue-on-error"]
  };

  const result = await executeMultiProjectTask(args.task, projectKeys, options);
  
  if (!result.success) {
    console.error(`\n❌ Task '${args.task}' completed with failures.`);
    Deno.exit(1);
  } else {
    console.log(`\n✅ Task '${args.task}' completed successfully.`);
  }
}

if (import.meta.main) {
  await main();
}
