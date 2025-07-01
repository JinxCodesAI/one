/**
 * Storybook Main Configuration
 *
 * Configures Storybook for the component library with Node.js/ESM support
 */

import type { StorybookConfig } from "@storybook/react-vite";
import { join, dirname } from "path";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, "package.json")));
}

const config: StorybookConfig = {
  stories: [
    "../src/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)",
  ],

  addons: [
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-interactions"),
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-controls"),
    getAbsolutePath("@storybook/addon-viewport"),
    getAbsolutePath("@storybook/addon-backgrounds"),
    getAbsolutePath("@storybook/addon-measure"),
    getAbsolutePath("@storybook/addon-outline"),
    getAbsolutePath("@storybook/addon-a11y"), // Accessibility testing
  ],

  framework: {
    name: "@storybook/react-vite",
    options: {},
  },

  typescript: {
    check: false,
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },

  viteFinal: (config) => {
    // Ensure Vite can handle TypeScript files
    config.resolve = config.resolve || {};
    config.resolve.extensions = [
      ...(config.resolve.extensions || []),
      ".ts",
      ".tsx",
    ];

    // Handle path aliases for better module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": join(__dirname, "..", "src"),
      "@/atoms": join(__dirname, "..", "src", "atoms"),
      "@/molecules": join(__dirname, "..", "src", "molecules"),
      "@/organisms": join(__dirname, "..", "src", "organisms"),
      "@/tokens": join(__dirname, "..", "src", "tokens"),
      "@/hooks": join(__dirname, "..", "src", "hooks"),
      "@/utils": join(__dirname, "..", "src", "utils"),
    };

    // Ensure proper ESM handling
    config.define = {
      ...config.define,
      global: "globalThis",
    };

    // Fix dependency pre-bundling issues
    config.optimizeDeps = {
      ...config.optimizeDeps,
      disabled: false,
      force: true,
      exclude: [
        ...(config.optimizeDeps?.exclude || []),
        "function-bind",
      ],
    };

    // Handle Deno-style .ts imports in Node.js environment
    config.plugins = config.plugins || [];
    config.plugins.push({
      name: "resolve-ts-extensions",
      resolveId(id: string, importer?: string) {
        if (id.endsWith(".ts") && importer) {
          // Remove .ts extension for Node.js compatibility
          return id.slice(0, -3);
        }
        return null;
      },
    });

    return config;
  },

  docs: {
    autodocs: "tag",
    defaultName: "Documentation",
  },

  core: {
    disableTelemetry: true,
  },
};

export default config;
