#!/usr/bin/env -S deno run --allow-net --allow-env --allow-read --allow-write --allow-run

/**
 * Test runner script for AI Chat v2
 * Provides convenient test execution with proper setup and reporting
 */

import { parseArgs } from "jsr:@std/cli/parse-args";

interface TestOptions {
  type: 'unit' | 'integration' | 'e2e' | 'all';
  watch: boolean;
  coverage: boolean;
  filter?: string;
  verbose: boolean;
}

async function runTests(options: TestOptions): Promise<void> {
  console.log(`🧪 Running ${options.type} tests...`);
  
  const args = ['test'];
  
  // Add permissions
  args.push('--allow-net', '--allow-env', '--allow-read', '--allow-write');
  
  // Add coverage if requested
  if (options.coverage) {
    args.push('--coverage=coverage/');
  }
  
  // Add watch mode if requested
  if (options.watch) {
    args.push('--watch');
  }
  
  // Add filter if provided
  if (options.filter) {
    args.push('--filter', options.filter);
  }
  
  // Add test paths based on type
  switch (options.type) {
    case 'unit':
      args.push('src/', '--exclude=**/*.e2e.ts', '--exclude=**/*.integration.ts');
      break;
    case 'integration':
      args.push('src/', '--filter=*.integration.ts');
      break;
    case 'e2e':
      args.push('e2e/');
      break;
    case 'all':
      args.push('src/', 'e2e/');
      break;
  }
  
  if (options.verbose) {
    console.log(`Running: deno ${args.join(' ')}`);
  }
  
  const command = new Deno.Command('deno', {
    args,
    stdout: 'inherit',
    stderr: 'inherit'
  });
  
  const { code } = await command.output();
  
  if (code === 0) {
    console.log(`✅ ${options.type} tests passed!`);
    
    if (options.coverage) {
      console.log('\n📊 Generating coverage report...');
      const coverageCommand = new Deno.Command('deno', {
        args: ['coverage', 'coverage/', '--html'],
        stdout: 'inherit',
        stderr: 'inherit'
      });
      await coverageCommand.output();
      console.log('Coverage report generated in coverage/html/');
    }
  } else {
    console.error(`❌ ${options.type} tests failed!`);
    Deno.exit(code);
  }
}

async function setupE2EEnvironment(): Promise<void> {
  console.log('🔧 Setting up E2E test environment...');
  
  // Check if AI API service is available
  try {
    const response = await fetch('http://localhost:8000/health');
    if (response.ok) {
      console.log('✅ AI API service is running');
      return;
    }
  } catch {
    // Service not running, we'll start it
  }
  
  console.log('🚀 Starting AI API service for E2E tests...');
  
  // Start the AI API service in the background
  const apiCommand = new Deno.Command('deno', {
    args: ['task', 'start'],
    cwd: '../../../../internal/ai-api',
    env: {
      PORT: '8000',
      OPENAI_API_KEY: 'test-key',
      GOOGLE_API_KEY: 'test-key',
      OPENROUTER_API_KEY: 'test-key'
    },
    stdout: 'piped',
    stderr: 'piped'
  });
  
  const process = apiCommand.spawn();
  
  // Wait for service to be ready
  let retries = 30;
  while (retries > 0) {
    try {
      const response = await fetch('http://localhost:8000/health');
      if (response.ok) {
        console.log('✅ AI API service is ready');
        return;
      }
    } catch {
      // Still starting
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    retries--;
  }
  
  console.error('❌ Failed to start AI API service');
  process.kill();
  Deno.exit(1);
}

function printHelp(): void {
  console.log(`
AI Chat v2 Test Runner

Usage: deno run scripts/test-runner.ts [options]

Options:
  --type <type>     Test type: unit, integration, e2e, all (default: all)
  --watch           Run tests in watch mode
  --coverage        Generate coverage report
  --filter <filter> Filter tests by name pattern
  --verbose         Verbose output
  --help            Show this help message

Examples:
  deno run scripts/test-runner.ts --type unit
  deno run scripts/test-runner.ts --type e2e --verbose
  deno run scripts/test-runner.ts --watch --type unit
  deno run scripts/test-runner.ts --coverage --type all
  deno run scripts/test-runner.ts --filter "MessageList"
`);
}

async function main(): Promise<void> {
  const args = parseArgs(Deno.args, {
    string: ['type', 'filter'],
    boolean: ['watch', 'coverage', 'verbose', 'help'],
    default: {
      type: 'all',
      watch: false,
      coverage: false,
      verbose: false,
      help: false
    }
  });
  
  if (args.help) {
    printHelp();
    return;
  }
  
  const options: TestOptions = {
    type: args.type as TestOptions['type'],
    watch: args.watch,
    coverage: args.coverage,
    filter: args.filter,
    verbose: args.verbose
  };
  
  // Validate test type
  if (!['unit', 'integration', 'e2e', 'all'].includes(options.type)) {
    console.error('❌ Invalid test type. Must be: unit, integration, e2e, or all');
    Deno.exit(1);
  }
  
  // Setup E2E environment if needed
  if (options.type === 'e2e' || options.type === 'all') {
    await setupE2EEnvironment();
  }
  
  // Run tests
  await runTests(options);
}

if (import.meta.main) {
  main().catch((error) => {
    console.error('❌ Test runner failed:', error);
    Deno.exit(1);
  });
}
