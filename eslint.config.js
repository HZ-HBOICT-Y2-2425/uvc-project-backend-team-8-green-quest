import globals from "globals";
import importPlugin from "eslint-plugin-import"; // Import the plugin as an object

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: [
      "**/.svelte-kit/**",
      "**/microservice/**",
      "**/eslint.config.js",
    ],
    languageOptions: {
      ecmaVersion: "latest", // Use the latest ECMAScript version
      sourceType: "module",  // Enables ES module syntax
      globals: {
        ...globals.browser, // Browser global variables
        ...globals.node,    // Node.js global variables
      },
    },
    plugins: {
      import: importPlugin, // Plugins must now be defined as objects
    },
    rules: {
      "no-unused-vars": "warn",          // Warns about unused variables
      "no-console": "off",               // Allows console statements
      "indent": ["warn", 4],            // Enforces 4-space indentation                               // Enforces import order
    },
  },
];
