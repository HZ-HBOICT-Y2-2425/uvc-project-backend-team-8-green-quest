import globals from "globals";
import importPlugin from "eslint-plugin-import";
import sonarjs from "eslint-plugin-sonarjs"; // Add the SonarJS plugin
import complexityPlugin from "eslint-plugin-complexity"; // Add the complexity plugin
 
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
      import: importPlugin,  // Plugins must now be defined as objects
      sonarjs,               // Add SonarJS for code smells
      complexity: complexityPlugin, // Add Complexity plugin
    },
    rules: {
      "no-unused-vars": "warn",            // Warns about unused variables
      "no-console": "off",                 // Allows console statements
      "indent": ["warn", 4],               // Enforces 4-space indentation
 
      // Import rules
      "import/order": [                    // Enforces import order
        "warn",
        {
          "groups": ["builtin", "external", "internal"],
          "newlines-between": "always",
          "alphabetize": { order: "asc", caseInsensitive: true },
        },
      ],
 
      // Cyclomatic Complexity
      "complexity": ["error", { max: 10 }], // Set max cyclomatic complexity to 10
 
      // SonarJS rules for code smells
      "sonarjs/cognitive-complexity": ["error", 15], // Enforce cognitive complexity
      "sonarjs/no-duplicate-string": "warn",        // Warn about duplicate strings
      "sonarjs/no-identical-functions": "error",    // Disallow identical functions
      "sonarjs/no-all-duplicated-branches": "warn", // Detect duplicated branches
    },
  },
];
