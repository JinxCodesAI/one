# Windows Compatibility Guide

This guide addresses Windows-specific setup and troubleshooting for the AI Chat
monorepo.

## Overview

The monorepo is fully compatible with Windows, macOS, and Linux. All `just`
commands work identically across platforms thanks to cross-platform TypeScript
orchestration scripts.

## Installation on Windows

### Prerequisites

1. **Deno**: Install from [deno.land](https://deno.land/)
2. **just**: Install via package manager

### Installing `just` on Windows

#### Option 1: Chocolatey (Recommended)

```powershell
# Run PowerShell as Administrator
choco install just
```

#### Option 2: Scoop (No Admin Required)

```powershell
# Install Scoop first if you don't have it
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install just
scoop install just
```

#### Option 3: Cargo (If you have Rust)

```powershell
cargo install just
```

### Verify Installation

```powershell
just --version
# Should output: just 1.40.0 (or similar)

# Configure justfile for Windows (REQUIRED!)
just setup
# Should output: ✅ justfile configured for Windows (PowerShell)

# If you get "could not find the shell" error, run this instead:
deno run --allow-read --allow-write scripts/setup-justfile.ts
```

## Common Windows Issues and Solutions

### 1. "Could not find `cygpath` executable" or "could not find the shell" Error

**Problem**: These errors occur when `just` can't find the appropriate shell on
Windows.

**Solution 1 (Recommended)**:

```powershell
just setup
```

**Solution 2 (If just setup fails)**:

```powershell
deno run --allow-read --allow-write scripts/setup-justfile.ts
```

**What this does**:

- Detects your operating system automatically
- Configures PowerShell for Windows, sh for Unix systems
- Updates the justfile with the correct shell configuration
- Eliminates all shell-related errors

### 2. PowerShell Execution Policy Issues

**Problem**: PowerShell may block script execution.

**Solution**:

```powershell
# Check current policy
Get-ExecutionPolicy

# Set policy to allow local scripts (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 3. Chocolatey Permission Issues

**Problem**: "Access to the path 'C:\ProgramData\chocolatey\lib-bad' is denied"

**Solutions**:

1. **Run PowerShell as Administrator** and retry the installation
2. **Use Scoop instead** (doesn't require admin privileges)
3. **Clean Chocolatey cache**:
   ```powershell
   choco cache clean
   choco install just
   ```

### 4. Path Issues

**Problem**: `just` command not found after installation.

**Solution**:

1. **Restart your terminal** after installation
2. **Check PATH**:
   ```powershell
   $env:PATH -split ';' | Select-String chocolatey
   ```
3. **Manually add to PATH** if needed:
   ```powershell
   $env:PATH += ";C:\ProgramData\chocolatey\bin"
   ```

## Development Workflow on Windows

### Basic Commands

All commands work identically on Windows:

```powershell
# Development
just dev-all          # Start both services
just dev-api          # Start AI API only
just dev-chat         # Start AI Chat only

# Testing
just test             # Run all tests
just test-unit        # Unit tests only
just test-e2e         # E2E tests only

# Code quality
just lint             # Lint all projects
just fmt              # Format all projects
just check            # Lint + test
```

### Docker on Windows

If you prefer Docker development:

```powershell
# Make sure Docker Desktop is installed and running
just docker-dev       # Start with Docker Compose
just docker-stop      # Stop Docker services
just docker-logs      # View logs
just docker-clean     # Clean up
```

## Windows-Specific Features

### Cross-Platform Service Orchestration

The `just dev-all` command uses a TypeScript script
(`scripts/dev-all-cross-platform.ts`) that:

- ✅ **Works on Windows, macOS, and Linux**
- ✅ **Handles Ctrl+C gracefully** on all platforms
- ✅ **Provides colored output** with service prefixes
- ✅ **Manages process lifecycle** properly
- ✅ **No bash dependencies** required

### Terminal Compatibility

The project works with:

- ✅ **PowerShell** (recommended)
- ✅ **Command Prompt**
- ✅ **Windows Terminal**
- ✅ **VS Code integrated terminal**
- ✅ **Git Bash** (if you have it)

## Performance Notes

### Native vs Docker Development

**Native Development (Recommended)**:

- ✅ **Faster**: Direct Deno execution
- ✅ **Better hot reload**: Instant file change detection
- ✅ **Lower resource usage**: No container overhead
- ✅ **Easier debugging**: Native Windows debugging tools

**Docker Development (Optional)**:

- ✅ **Environment consistency**: Same as production
- ✅ **Isolation**: No local dependency conflicts
- ⚠️ **Slower**: Container overhead
- ⚠️ **File watching**: May be slower on Windows

## Troubleshooting Checklist

If you encounter issues:

1. **Check Prerequisites**:
   - [ ] Deno installed and in PATH
   - [ ] `just` installed and in PATH
   - [ ] PowerShell execution policy allows scripts

2. **Verify Installation**:
   ```powershell
   deno --version
   just --version
   ```

3. **Fix Shell Configuration (MOST COMMON ISSUE)**:
   ```powershell
   # If you get "could not find the shell" errors:

   # Try this first:
   just setup

   # If that fails, run directly:
   deno run --allow-read --allow-write scripts/setup-justfile.ts

   # Verify it worked:
   just --list
   ```

4. **Test Basic Commands**:
   ```powershell
   just --list
   just install
   ```

5. **Check Environment**:
   ```powershell
   # Verify you're in the project root
   ls justfile

   # Check if .env files exist
   ls internal/ai-api/.env.example
   ```

6. **Try Individual Services**:
   ```powershell
   # Test AI API separately
   cd internal/ai-api
   deno task dev

   # Test AI Chat separately (in new terminal)
   cd web/ai-chat
   deno task dev
   ```

## Getting Help

If you still encounter issues:

1. **Check the main README.md** for general setup instructions
2. **Review DEVELOPMENT.md** for detailed development workflow
3. **Look at existing GitHub issues** for similar problems
4. **Create a new issue** with:
   - Your Windows version
   - PowerShell version (`$PSVersionTable`)
   - Deno version (`deno --version`)
   - just version (`just --version`)
   - Complete error message
   - Steps to reproduce

## Success Indicators

You know everything is working when:

- ✅ `just --list` shows all available commands
- ✅ `just dev-all` starts both services without errors
- ✅ You can access http://localhost:3000 in your browser
- ✅ AI Chat loads and shows "Loading models..." (expected without API keys)
- ✅ Ctrl+C cleanly shuts down all services

The monorepo is designed to work seamlessly on Windows with the same developer
experience as macOS and Linux!
