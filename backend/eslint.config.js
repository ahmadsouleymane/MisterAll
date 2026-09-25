import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      // Erreurs potentielles
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-console": "off", // Autorisé en backend pour les logs

      // Bonnes pratiques
      "eqeqeq": ["error", "always"],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-return-await": "warn",

      // Sécurité
      "no-script-url": "error",

      // Style
      "prefer-const": "warn",
      "no-var": "error",
      "object-shorthand": "warn",
      "prefer-template": "warn",
    },
  },
  {
    ignores: [
      "node_modules/**",
      "uploads/**",
      "avatars/**",
      "*.min.js",
    ],
  },
];
