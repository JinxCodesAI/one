/**
 * Storybook Preview Configuration
 * 
 * Global configuration for all stories including themes, backgrounds, and viewports
 */

import type { Preview } from "@storybook/react";
import { theme } from "../src/tokens/index.ts";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
      expanded: true,
      sort: "requiredFirst",
    },
    docs: {
      toc: true,
      source: {
        state: "open",
      },
    },
    backgrounds: {
      default: "light",
      values: [
        {
          name: "light",
          value: theme.colors.background.primary,
        },
        {
          name: "dark",
          value: theme.colors.gray[900],
        },
        {
          name: "gradient",
          value: theme.colors.background.gradient,
        },
        {
          name: "glass",
          value: `linear-gradient(135deg, ${theme.colors.background.gradient}), ${theme.colors.background.glass}`,
        },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: "Mobile",
          styles: {
            width: "375px",
            height: "667px",
          },
        },
        tablet: {
          name: "Tablet",
          styles: {
            width: "768px",
            height: "1024px",
          },
        },
        desktop: {
          name: "Desktop",
          styles: {
            width: "1024px",
            height: "768px",
          },
        },
        wide: {
          name: "Wide Desktop",
          styles: {
            width: "1440px",
            height: "900px",
          },
        },
      },
    },
    layout: "centered",
  },

  globalTypes: {
    theme: {
      description: "Global theme for components",
      defaultValue: "default",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "default", title: "Default Theme" },
          { value: "aiChat", title: "AI Chat Theme" },
          { value: "todoApp", title: "Todo App Theme" },
        ],
        dynamicTitle: true,
      },
    },
  },

  decorators: [
    (Story, context) => {
      const { theme: selectedTheme } = context.globals;
      
      // Apply theme-specific styles to the story container
      const themeStyles = {
        default: {},
        aiChat: {
          "--primary-color": "#2563eb",
          "--background-color": "#ffffff",
        },
        todoApp: {
          "--primary-color": "#3b82f6",
          "--background-gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        },
      };

      return (
        <div
          style={{
            fontFamily: theme.typography.fontFamily.sans.join(", "),
            ...themeStyles[selectedTheme as keyof typeof themeStyles],
          }}
        >
          <Story />
        </div>
      );
    },
  ],

  tags: ["autodocs"],
};

export default preview;
