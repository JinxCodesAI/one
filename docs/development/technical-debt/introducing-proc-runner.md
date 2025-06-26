# Full Guide: Migrating to `proc-runner` for Monorepo Orchestration

This guide provides a complete, step-by-step process for transitioning your
monorepo's service management from a custom Deno script to `proc-runner`. This
will solve your dependency startup issues and provide a cleaner, more scalable
solution.

---

## Part 1: Cleanup of the Old Approach

Before setting up the new system, it's important to remove the old scripts to
avoid conflicts.

### Step 1: Delete the Orchestration Script

The custom Deno script for managing processes is no longer needed. Navigate to
your project's root directory and delete the following file:

- `scripts/dev-all-cross-platform.ts`

### Step 2: Clear Out the Old `justfile` Recipes

Your `justfile` will be replaced with much simpler commands. Open your
`justfile` and **delete all the existing recipes** related to `dev-all`, `test`,
and `clean`. You can leave the Docker-related recipes if you wish, but for a
clean start, we will replace the development recipes entirely.

Your `justfile` will be populated with new content in Part 2.

---

## Part 2: Configuring `proc-runner`

Now, we will set up `proc-runner` as the new process manager.

### Step 1: Create the `proc.jsonc` Configuration File

In the **root directory** of your monorepo (`E:\AI\projects\one\`), create a new
file named `proc.jsonc`. This single file will define all your services and
their relationships.

Copy and paste the following complete configuration into `proc.jsonc`:

```jsonc
// E:/AI/projects/one/proc.jsonc
{
  "$schema": "[https://deno.land/x/proc_runner@v2.5.1/schema.json](https://deno.land/x/proc_runner@v2.5.1/schema.json)",
  "procs": {
    "ai-api": {
      "cmd": ["deno", "task", "dev"],
      "cwd": "internal/ai-api",
      "desc": "The main Deno-based AI backend API."
    },
    "ai-chat": {
      "cmd": ["npx", "vite"],
      "cwd": "web/ai-chat",
      "desc": "The Vite-based React frontend.",
      "runAfter": ["ai-api"]
    }
  }
}
```
