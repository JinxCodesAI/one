/**
 * Storybook Main Configuration
 * 
 * Configures Storybook for the component library with Deno support
 */

import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)",
  ],
  
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-links",
    "@storybook/addon-docs",
    "@storybook/addon-controls",
    "@storybook/addon-viewport",
    "@storybook/addon-backgrounds",
    "@storybook/addon-measure",
    "@storybook/addon-outline",
    "@storybook/addon-a11y", // Accessibility testing
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

  viteFinal: async (config) => {
    // Ensure Vite can handle TypeScript files
    config.resolve = config.resolve || {};
    config.resolve.extensions = [
      ...(config.resolve.extensions || []),
      ".ts",
      ".tsx",
    ];

    // Handle Deno-style imports
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/": new URL("../src/", import.meta.url).pathname,
    };

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
