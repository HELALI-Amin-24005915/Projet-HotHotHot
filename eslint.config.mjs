/* eslint-disable id-match */
import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "prefer-const": "error",
      "id-match": [
        "error",
        "^(?:[S]_.*|[I]_.*|[B]_.*|[F]_.*|[O]_.*|[A]_.*)$",
        {
          "properties": false,
          "onlyDeclarations": true
        }
      ]
    }
  }
];