/**
 * Storybook Manager Configuration
 * 
 * Customizes the Storybook UI and branding
 */

import { addons } from "@storybook/manager-api";
import { create } from "@storybook/theming/create";

const theme = create({
  base: "light",
  brandTitle: "@one/component-library",
  brandUrl: "https://github.com/JinxCodesAI/one",
  brandTarget: "_self",

  // Colors
  colorPrimary: "#3b82f6",
  colorSecondary: "#6366f1",

  // UI
  appBg: "#ffffff",
  appContentBg: "#ffffff",
  appBorderColor: "#e5e7eb",
  appBorderRadius: 8,

  // Typography
  fontBase: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
  fontCode: '"Fira Code", "Monaco", "Consolas", monospace',

  // Text colors
  textColor: "#374151",
  textInverseColor: "#ffffff",

  // Toolbar default and active colors
  barTextColor: "#6b7280",
  barSelectedColor: "#3b82f6",
  barBg: "#f9fafb",

  // Form colors
  inputBg: "#ffffff",
  inputBorder: "#d1d5db",
  inputTextColor: "#374151",
  inputBorderRadius: 6,
});

addons.setConfig({
  theme,
  panelPosition: "bottom",
  selectedPanel: "controls",
  sidebar: {
    showRoots: false,
    collapsedRoots: ["other"],
  },
});
