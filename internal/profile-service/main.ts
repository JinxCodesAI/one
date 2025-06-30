/**
 * Profile Service - Main Entry Point
 * 
 * Starts the profile service HTTP server with configuration from environment variables.
 */

import { load } from "@std/dotenv";
import { createDatabaseAdapter } from "./database/mod.ts";
import { startServer } from "./server/server.ts";
import type { ProfileServiceConfig } from "./types.ts";

/**
 * Load configuration from environment variables
 */
async function loadConfig(): Promise<ProfileServiceConfig> {
  // Load .env file if it exists
  try {
    await load({ export: true });
  } catch {
    // .env file doesn't exist, that's fine
  }

  const config: ProfileServiceConfig = {
    port: parseInt(Deno.env.get("PROFILE_SERVICE_PORT") || Deno.env.get("PORT") || "8080"),
    databaseUrl: Deno.env.get("PROFILE_SERVICE_DATABASE_URL"),
    corsOrigins: (Deno.env.get("CORS_ORIGINS") === "" ? [] : (Deno.env.get("CORS_ORIGINS") || "https://*.jinxcodes.ai,http://localhost:*").split(",")),
    cookieDomain: Deno.env.get("COOKIE_DOMAIN") || ".jinxcodes.ai",
    dailyBonusAmount: parseInt(Deno.env.get("DAILY_BONUS_AMOUNT") || "10"),
    initialCreditsAmount: parseInt(Deno.env.get("INITIAL_CREDITS_AMOUNT") || "100")
  };

  return config;
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log("🚀 Starting Profile Service...");

  try {
    // Load configuration
    const config = await loadConfig();
    console.log("📋 Configuration loaded:");
    console.log(`   Port: ${config.port}`);
    console.log(`   Database: ${config.databaseUrl ? "PostgreSQL" : "In-Memory"}`);
    console.log(`   CORS Origins: ${config.corsOrigins.join(", ")}`);
    console.log(`   Cookie Domain: ${config.cookieDomain}`);
    console.log(`   Daily Bonus: ${config.dailyBonusAmount} credits`);
    console.log(`   Initial Credits: ${config.initialCreditsAmount} credits`);

    // Create database adapter
    const db = createDatabaseAdapter(config.databaseUrl);

    // Test database connection
    console.log("🔍 Testing database connection...");
    const isHealthy = await db.healthCheck();
    if (!isHealthy) {
      throw new Error("Database health check failed");
    }
    console.log("✅ Database connection successful");

    // Start server
    const server = await startServer(db, config);

    // Handle graceful shutdown
    const handleShutdown = () => {
      console.log("\n🛑 Shutting down Profile Service...");
      server.stop();
      Deno.exit(0);
    };

    Deno.addSignalListener("SIGINT", handleShutdown);
    if (Deno.build.os !== "windows") {
      Deno.addSignalListener("SIGTERM", handleShutdown);
    }

    console.log("✅ Profile Service started successfully");
    console.log("📡 Ready to handle requests");

  } catch (error) {
    console.error("❌ Failed to start Profile Service:", error);
    Deno.exit(1);
  }
}

// Run main function if this file is executed directly
if (import.meta.main) {
  main();
}

// Export for testing
export { main, loadConfig };
