import jsxA11y from "eslint-plugin-jsx-a11y"
import tseslint from "typescript-eslint"
import prettierConfig from "eslint-config-prettier"

export default tseslint.config(
  // Global ignores
  {
    ignores: ["node_modules/", "dist/", "build/", ".cache/", "public/build/"],
  },

  // Base TypeScript configuration
  ...tseslint.configs.recommended,

  // JSX/React specific configuration
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
    },
    settings: {
      react: {
        version: "detect",
      },
      formComponents: ["Form"],
      linkComponents: [
        { name: "Link", linkAttribute: "to" },
        { name: "NavLink", linkAttribute: "to" },
      ],
    },
  },

  // Prettier config must be last to override other configs
  prettierConfig
)
