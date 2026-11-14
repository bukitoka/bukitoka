import { expect, test } from "@playwright/test"

test.describe("mobile Safari Snake", () => {
  test("touch steering does not pause on Safari focus changes but outside taps still pause", async ({
    page,
  }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Snake Xenzia", exact: true }).tap()
    const game = page.locator("[data-snake-status]")
    await page.getByRole("button", { name: "Start game", exact: true }).tap()
    await expect(game).toHaveAttribute("data-snake-status", "running")
    await page.waitForTimeout(180)
    await page.getByRole("button", { name: "Steer up", exact: true }).tap()
    await expect(game).toHaveAttribute("data-snake-status", "running")
    await page.waitForTimeout(180)
    await page.getByRole("button", { name: "Steer left", exact: true }).tap()
    await expect(game).toHaveAttribute("data-snake-status", "running")
    await page.getByRole("button", { name: "Pause game", exact: true }).tap()
    await expect(game).toHaveAttribute("data-snake-status", "paused")
    await page.getByRole("button", { name: "Resume game", exact: true }).tap()
    await expect(game).toHaveAttribute("data-snake-status", "running")
    await page
      .getByRole("button", { name: "Snake Xenzia game board", exact: true })
      .evaluate((element) => element.blur())
    await expect(game).toHaveAttribute("data-snake-status", "running")
    await page.getByText("A small detour", { exact: true }).tap()
    await expect(game).toHaveAttribute("data-snake-status", "paused")
    await page.getByRole("button", { name: "Resume game", exact: true }).tap()
    await page.locator("[data-arcade] > button").tap()
    await expect(game).toHaveAttribute("data-snake-status", "paused")
    await expect(game).not.toBeVisible()
  })
})
