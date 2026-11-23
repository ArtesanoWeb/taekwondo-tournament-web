import { fileURLToPath } from "node:url";

import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  // The browser tests in e2e/ run with Playwright (`npm run e2e`), not here.
  test: { exclude: [...configDefaults.exclude, "e2e/**"] },
});
