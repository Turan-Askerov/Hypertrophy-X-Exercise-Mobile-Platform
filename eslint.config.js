// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const globals = require("globals");

module.exports = defineConfig([
  expoConfig,
  {
    files: ["scripts/**/*.js", "plugins/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    ignores: ["dist/*"],
  }
]);
