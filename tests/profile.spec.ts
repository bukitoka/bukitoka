import { expect, test } from "@playwright/test"

test("profile and resume are available without JavaScript", async ({
  browser,
  request,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "paperwork.",
  )
  await expect(
    page
      .locator("#work")
      .getByRole("heading", { name: "WineAdore", exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: /Someone has to/ }),
  ).toBeVisible()
  const response = await request.get("/resume/pdf")
  expect(response.status()).toBe(200)
  expect(response.headers()["content-type"]).toBe("application/pdf")
  expect(response.headers()["content-disposition"]).toContain(
    "Kusuma-Jaya-Resume.pdf",
  )
  const pdf = await response.body()
  expect(pdf.subarray(0, 5).toString()).toBe("%PDF-")
  expect(pdf.toString("latin1")).toMatch(/\/Type \/Pages\s+\/Count 2/)
  expect(pdf.toString("latin1")).toContain("FixelText-Regular")
  expect(pdf.toString("latin1")).toContain("JetBrainsMono-Regular")
  await context.close()
})

test("themes default to device, persist overrides, and follow system changes", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" })
  await page.goto("/")
  await expect(page.locator("html")).toHaveClass(/light/)
  await expect(
    page.getByRole("button", { name: "Device theme", exact: true }),
  ).toHaveAttribute("aria-pressed", "true")
  await page.emulateMedia({ colorScheme: "dark" })
  await expect(page.locator("html")).toHaveClass(/dark/)
  await page.getByRole("button", { name: "light theme", exact: true }).click()
  await expect(page.locator("html")).toHaveClass(/light/)
  await expect(
    page.getByRole("button", { name: "light theme", exact: true }),
  ).toHaveAttribute("aria-pressed", "true")
  await page.reload()
  await expect(page.locator("html")).toHaveClass(/light/)
  await page.getByRole("button", { name: "Device theme", exact: true }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)
  await page.emulateMedia({ colorScheme: "light" })
  await expect(page.locator("html")).toHaveClass(/light/)
})

test("layouts fit narrow phones through desktop with reduced motion", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  await page.evaluate(() => document.fonts.ready)
  for (const width of [320, 360, 390, 640, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `overflow at ${width}px`,
    ).toBe(true)
    const clippedHeadings = await page
      .locator("h1, h2, h3")
      .evaluateAll((headings) =>
        headings
          .filter((heading) => {
            const range = document.createRange()
            range.selectNodeContents(heading)
            const text = range.getBoundingClientRect()
            const box = heading.getBoundingClientRect()
            return text.right > box.right + 2 || text.left < box.left - 2
          })
          .map((heading) => heading.textContent),
      )
    expect(clippedHeadings, `clipped headings at ${width}px`).toEqual([])
  }

  const experience = page
    .locator("details")
    .filter({ hasText: "Jobseeker Company" })
  await experience.locator("summary").click()
  await expect(experience).toHaveAttribute("open", "")
  expect(errors).toEqual([])
})

test("scroll drives the progress bar and artwork, and reduced motion keeps artwork still", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/")
  const progress = page.locator("[data-scroll-progress]")
  const artwork = page.locator("[data-parallax]").first()
  const initialTransform = await artwork.evaluate(
    (element) => getComputedStyle(element).transform,
  )
  await page.locator("#about").scrollIntoViewIfNeeded()
  await expect
    .poll(() =>
      progress.evaluate((element) => {
        const transform = getComputedStyle(element).transform
        return transform !== "none" && new DOMMatrixReadOnly(transform).a > 0.1
      }),
    )
    .toBe(true)
  await expect
    .poll(() =>
      artwork.evaluate((element) => getComputedStyle(element).transform),
    )
    .not.toBe(initialTransform)
  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect(artwork).toHaveCSS("transform", "none")
  await expect(page.locator("[data-scroll-ribbon]")).toHaveCSS(
    "transform",
    "none",
  )
})

test("mobile navigation and touch controls are usable without parallax", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 740 },
    isMobile: true,
    hasTouch: true,
  })
  const page = await context.newPage()
  await page.goto("/")
  const nav = page.getByRole("navigation", { name: "Main navigation" })
  await expect(nav).toBeVisible()
  for (const control of await nav.getByRole("link").all()) {
    expect(
      Math.round((await control.boundingBox())?.height ?? 0),
    ).toBeGreaterThanOrEqual(44)
  }
  for (const control of await page
    .getByRole("group", { name: "Color theme" })
    .getByRole("button")
    .all()) {
    const box = await control.boundingBox()
    expect(Math.round(box?.width ?? 0)).toBeGreaterThanOrEqual(44)
    expect(Math.round(box?.height ?? 0)).toBeGreaterThanOrEqual(44)
  }
  await nav.getByRole("link", { name: "About", exact: true }).click()
  await expect(page).toHaveURL(/#about$/)
  await expect(page.locator("[data-parallax]").first()).toHaveCSS(
    "transform",
    "none",
  )
  await expect(page.locator("[data-parallax]").last()).toHaveCSS(
    "transform",
    "none",
  )
  await context.close()
})

test("visitors can compose, remix, and pause the artwork on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/")
  const playground = page.locator("[data-composition]")
  await page
    .getByRole("button", { name: "Take a small detour", exact: true })
    .click()
  await page.getByRole("button", { name: "Balance", exact: true }).focus()
  await page.keyboard.press("Enter")
  await expect(playground).toHaveAttribute("data-composition", "Balance")
  await expect(
    page.getByRole("button", { name: "Balance", exact: true }),
  ).toHaveAttribute("aria-pressed", "true")
  await page.getByRole("button", { name: "Remix", exact: true }).click()
  await expect(playground.getByRole("status")).toContainText("variation 2")
  await expect(playground.getByRole("img")).toHaveAccessibleName(
    "Balance geometric composition, variation 2",
  )
  await expect(
    page.getByRole("button", { name: "Pause motion", exact: true }),
  ).toHaveAttribute("aria-pressed", "true")
  await page.getByRole("button", { name: "Pause motion", exact: true }).click()
  await page.getByRole("button", { name: "Signal", exact: true }).click()
  await expect(playground.getByRole("status")).toContainText(
    "Signal · variation 1",
  )
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect(
    page.getByRole("button", { name: "Play motion", exact: true }),
  ).toBeDisabled()
  await expect(playground.getByRole("status")).toContainText("reduced motion")
})

test("project notes reveal the actual engineering work", async ({ page }) => {
  await page.goto("/")
  const wine = page.locator("article").filter({
    has: page.getByRole("heading", { name: "WineAdore", exact: true }),
  })
  await wine.locator("summary").click()
  await expect(wine.getByText(/Custom SSR, code splitting/)).toBeVisible()
  await expect(
    wine.getByRole("link", { name: "Explore WineAdore", exact: true }),
  ).toHaveAttribute("href", "https://wineadore.com")
})

test("the mobile opening leads into the story before the optional playground", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  await page.evaluate(() => document.fonts.ready)
  const hero = page.locator("main > section").first()
  await expect(hero.getByRole("heading", { level: 1 })).toContainText(
    "with paperwork.",
  )
  await expect(hero).not.toContainText("Full-stack software engineer")
  await expect(hero).not.toContainText("UTC +08:00")
  const read = hero.getByRole("link", { name: "Read the work", exact: true })
  const box = await read.boundingBox()
  expect(box).not.toBeNull()
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThan(740)
  const detour = page.getByRole("button", {
    name: "Take a small detour",
    exact: true,
  })
  await expect(detour).toHaveAttribute("aria-expanded", "false")
  await expect(
    page.getByRole("button", { name: "Balance", exact: true }),
  ).not.toBeVisible()
  await read.click()
  await expect(page).toHaveURL(/#work$/)
  await expect(
    page.getByRole("heading", { name: /From loan forms/ }),
  ).toBeVisible()
  await expect(page.locator("#experience details").first()).toContainText(
    "MKM Honda",
  )
})

test("WhatsApp badge links to the resume number and respects reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/")
  const badge = page.getByRole("link", {
    name: "Chat with Kusuma on WhatsApp",
    exact: true,
  })
  await expect(badge).toBeVisible()
  await expect(badge).toHaveAttribute("href", "https://wa.me/6287760474110")
  await expect(badge).toHaveAttribute("target", "_blank")
  const ring = badge.locator("svg").first()
  await expect(ring).toHaveCSS("animation-name", "spin")
  await expect(ring).toHaveCSS("animation-duration", "45s")
  const labelWidths = await ring
    .locator("text")
    .evaluateAll((labels) =>
      labels.map((label) => (label as SVGTextElement).getComputedTextLength()),
    )
  expect(labelWidths).toHaveLength(4)
  for (const width of labelWidths)
    expect(width).toBeLessThan((2 * Math.PI * 40) / 4 - 12)
  const box = await badge.boundingBox()
  expect(box?.width).toBe(80)
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320)
  await badge.focus()
  await expect(ring).toHaveCSS("animation-play-state", "paused")
  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect(ring).toHaveCSS("animation-name", "none")
})

test("background grid animates quietly on desktop and stays static on phones or reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/")
  const grid = page.locator("[data-grid-background]")
  const trace = page.locator("[data-grid-trace]").first()
  await expect(grid).toHaveAttribute("aria-hidden", "true")
  await expect(grid).toHaveCSS("pointer-events", "none")
  await expect(trace).toHaveCSS("animation-name", "grid-trace")
  await expect(trace).toHaveCSS("animation-duration", "24s")
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(trace).toHaveCSS("animation-name", "none")
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect(trace).toHaveCSS("animation-name", "none")
  await expect(grid).toBeVisible()
  await page.getByRole("link", { name: "Read the work", exact: true }).click()
  await expect(page).toHaveURL(/#work$/)
})

test("navigation animates focus and follows the section being read", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  const nav = page.getByRole("navigation", { name: "Main navigation" })
  const about = nav.getByRole("link", { name: "About", exact: true })
  await about.focus()
  await expect(about.locator("[data-nav-indicator]")).toBeVisible()
  await expect(
    nav.getByRole("link", { name: "Let’s talk", exact: true }).locator("svg"),
  ).toHaveClass(/lucide-arrow-up-right/)
  await about.click()
  await expect(about).toHaveAttribute("aria-current", "location")
  await expect(page.locator("header")).toHaveCSS("transform", "none")
  await page.locator("#work").scrollIntoViewIfNeeded()
  await expect(
    nav.getByRole("link", { name: "Selected work", exact: true }),
  ).toHaveAttribute("aria-current", "location")
})

test("Snake Xenzia supports play, scoring, touch steering, pause, and switching detours", async ({
  page,
}) => {
  await page.clock.install()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  await page
    .getByRole("button", { name: "Take a small detour", exact: true })
    .click()
  await page.getByRole("button", { name: "Snake Xenzia", exact: true }).click()
  const game = page.locator("[data-snake-status]")
  await expect(game).toHaveAttribute("data-snake-status", "ready")
  await page.getByRole("button", { name: "Start game", exact: true }).click()
  await expect(game).toHaveAttribute("data-snake-status", "running")
  await page.clock.runFor(700)
  await expect(game.getByRole("status")).toContainText("Score 1")
  await page.getByRole("button", { name: "Pause game", exact: true }).click()
  await expect(game).toHaveAttribute("data-snake-status", "paused")
  await page.clock.runFor(1000)
  await expect(game).toHaveAttribute("data-snake-status", "paused")
  await page.getByRole("button", { name: "Resume game", exact: true }).click()
  await page.getByRole("button", { name: "Steer up", exact: true }).click()
  await expect(game).toHaveAttribute("data-snake-status", "running")
  await page.clock.runFor(170)
  const best = await game.getByText(/^Best this visit/).textContent()
  await page.getByRole("button", { name: "Shapes", exact: true }).click()
  await expect(game).toHaveAttribute("data-snake-status", "paused")
  await page.getByRole("button", { name: "Snake Xenzia", exact: true }).click()
  await page.getByRole("button", { name: "Restart", exact: true }).click()
  await expect(game.getByText(/^Best this visit/)).toHaveText(best ?? "")
  await expect(game.getByRole("status")).toContainText("Score 0")
  await page
    .getByRole("button", { name: "Snake Xenzia game board", exact: true })
    .press("Space")
  await expect(game).toHaveAttribute("data-snake-status", "paused")
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})

test("hire me leads to contact and WineAdore uses an illustrated storefront", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  const hire = page
    .locator("main > section")
    .first()
    .getByRole("link", { name: "Hire me", exact: true })
  await expect(hire).toHaveAttribute("href", "#contact")
  await expect(hire).toHaveCSS("background-color", "rgb(231, 180, 90)")
  await expect(
    page.locator("header").getByRole("link", { name: "Hire me", exact: true }),
  ).toBeVisible()
  const storefront = page.getByRole("img", {
    name: "WineAdore storefront illustration",
    exact: true,
  })
  await storefront.scrollIntoViewIfNeeded()
  await expect(storefront).toBeVisible()
  await expect(
    page.getByRole("img", {
      name: "AutoCRM dashboard illustration",
      exact: true,
    }),
  ).toBeVisible()
  await expect(page.locator('img[src*="wineadore-storefront"]')).toHaveCount(0)
  await hire.click()
  await expect(page).toHaveURL(/#contact$/)
  await expect(page.locator("#contact").getByRole("heading")).toBeVisible()
})

test("section reveals and the hero replay when returning to them", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/")
  await page.evaluate(() => document.fonts.ready)
  const heading = page.locator("#work h2")
  const top = await page
    .locator("#work")
    .evaluate((element) => element.getBoundingClientRect().top + scrollY - 150)

  function headingOffset() {
    return heading.evaluate((element) => {
      const transform = getComputedStyle(element).transform
      if (transform === "none") return 0
      const matrix = new DOMMatrixReadOnly(transform)
      return Math.abs(matrix.m42) + Math.abs(matrix.b) * 100
    })
  }
  for (const visit of [1, 2]) {
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
    )
    await expect(
      heading,
      `leave section before visit ${visit}`,
    ).not.toBeInViewport()
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    )
    await page.evaluate(
      (top) => window.scrollTo({ top, behavior: "instant" }),
      top,
    )
    await expect
      .poll(headingOffset, { message: `animation starts on visit ${visit}` })
      .toBeGreaterThan(1)
    await expect
      .poll(headingOffset, { message: `animation finishes on visit ${visit}` })
      .toBeLessThan(0.1)
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }))
  const line = page.locator("h1 > span > span").first()
  await expect
    .poll(() =>
      line.evaluate((element) => {
        const value = getComputedStyle(element).transform
        return value === "none" ? 0 : Math.abs(new DOMMatrixReadOnly(value).m42)
      }),
    )
    .toBeGreaterThan(1)
  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect(line).toHaveCSS("transform", "none")
  await expect.poll(headingOffset).toBeLessThan(0.1)
})

test("resume stays light, works without JavaScript, and generates a fresh PDF download", async ({
  browser,
  request,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()
  await page.goto("/resume")
  await expect(page.locator("[data-resume]")).toHaveCSS(
    "background-color",
    "rgb(239, 248, 241)",
  )
  await expect(page.locator("[data-resume]")).toHaveCSS(
    "color",
    "rgb(5, 31, 32)",
  )
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "I Ketut Kusumajaya",
  )
  for (const name of [
    "Summary",
    "Work Experience",
    "Projects",
    "Skills",
    "Education",
    "Certifications",
    "Languages",
  ]) {
    await expect(
      page.getByRole("heading", { level: 2, name, exact: true }),
    ).toBeVisible()
  }
  await expect(page.locator("main")).toContainText("May 2025 – Sep 2026")
  await expect(page.locator("main")).not.toContainText("A practical toolkit")
  await expect(
    page.getByRole("heading", { name: "WineAdore", exact: true }),
  ).toHaveCount(2)
  await expect(
    page.getByRole("heading", { name: "MKM Honda", exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Download PDF", exact: true }),
  ).toHaveAttribute("href", "/resume/pdf")
  await expect(
    page.getByRole("link", {
      name: "Chat with Kusuma on WhatsApp",
      exact: true,
    }),
  ).toHaveCount(0)
  await expect(page.locator("[data-grid-background]")).toHaveCount(0)
  await expect(page.locator("main")).not.toContainText("yopmail")
  await expect(page.locator("main")).not.toContainText("Password")
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  }
  expect((await request.get("/Kusuma_resume.pdf")).status()).toBe(404)
  await context.close()
})

test("viewing the light resume preserves the portfolio theme and the download works", async ({
  page,
}) => {
  await page.goto("/")
  await page.getByRole("button", { name: "dark theme", exact: true }).click()
  await page
    .locator("main > section")
    .first()
    .getByRole("link", { name: "View résumé", exact: true })
    .click()
  await expect(page).toHaveURL(/\/resume$/)
  await expect(page.locator("[data-resume]")).toHaveCSS(
    "background-color",
    "rgb(239, 248, 241)",
  )
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Download PDF", exact: true }).click(),
  ])
  expect(download.suggestedFilename()).toBe("Kusuma-Jaya-Resume.pdf")
  expect(await download.failure()).toBeNull()
  await page.getByRole("link", { name: "Back to profile", exact: true }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)
})
