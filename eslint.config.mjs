import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Regras do Codetomb (docs/06-regras-dev.md §5).
  {
    rules: {
      // Tipagem estrita: sem `any` (use `unknown` + Zod) e sem `!` para silenciar nulos.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // Compensa a menor rigidez do npm: só importar pacotes declarados no package.json.
      "import/no-extraneous-dependencies": "error",
    },
  },

  // Desliga regras de formatação que conflitam com o Prettier (deve ser o último bloco de regras).
  prettier,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
