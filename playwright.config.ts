import { defineConfig, devices } from "@playwright/test"
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chrome",
      testIgnore: "**/safari.spec.ts",
      use: { channel: "chrome" },
    },
    {
      name: "mobile-safari",
      testMatch: "**/safari.spec.ts",
      use: { ...devices["iPhone 13"], browserName: "webkit" },
    },
  ],
  webServer: {
    command: "bun run start --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
  },
})
