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

    const corner = await page
      .locator("[data-profile-badge]")
      .evaluate((badge) => {
        const photo = badge.parentElement?.querySelector("img")
        if (!photo) throw new Error("Profile photo is missing")
        const image = photo.getBoundingClientRect()
        const circle = badge.getBoundingClientRect()
        return {
          right: circle.right - image.right,
          bottom: circle.bottom - image.bottom,
        }
      })
    expect(corner.right).toBeCloseTo(width < 640 ? 8 : width < 768 ? 12 : 20, 0)
    expect(corner.bottom).toBeCloseTo(width < 640 ? 8 : 20, 0)
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

test("arcade supports platform movement, jumping, and switching games on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  await page
    .getByRole("button", { name: "Take a small detour", exact: true })
    .click()
  await expect(page.locator("[data-whatsapp-link]")).not.toBeVisible()
  const platform = page.getByRole("application", {
    name: "Super Kusuma platform game",
    includeHidden: true,
  })
  await expect(platform).toHaveAttribute("data-platform-status", "ready")
  await page
    .getByRole("button", { name: "Start adventure", exact: true })
    .click()
  await expect(platform).toHaveAttribute("data-platform-status", "running")
  const hero = page.locator("[data-platform-player]")
  const before = await hero.getAttribute("transform")
  await page.keyboard.down("ArrowRight")
  await expect.poll(() => hero.getAttribute("transform")).not.toBe(before)
  await page.keyboard.up("ArrowRight")
  await page.keyboard.press("Space")
  await expect
    .poll(async () => {
      const transform = await hero.getAttribute("transform")
      return Number(transform?.match(/translate\([^ ]+ ([^)]+)\)/)?.[1] ?? 216)
    })
    .toBeLessThan(210)
  await page.keyboard.press("p")
  await expect(platform).toHaveAttribute("data-platform-status", "paused")
  await page.getByRole("button", { name: "Plane shooter", exact: true }).click()
  const plane = page.getByRole("application", {
    name: "Plane shooter",
    exact: true,
    includeHidden: true,
  })
  await plane.getByRole("button", { name: "Start flight", exact: true }).click()
  await expect(plane).toHaveAttribute("data-flight-state", "running")
  await page.getByRole("button", { name: "Super Kusuma", exact: true }).click()
  await expect(plane).toHaveAttribute("data-flight-state", "paused")
  await expect(platform).toHaveAttribute("data-platform-status", "paused")
  await platform
    .getByRole("button", { name: "Resume adventure", exact: true })
    .first()
    .click()
  await expect(platform).toHaveAttribute("data-platform-status", "running")
  await page
    .getByRole("button", { name: "Take a small detour", exact: true })
    .click()
  await expect(platform).toHaveAttribute("data-platform-status", "paused")
  await expect(platform).not.toBeVisible()
  await expect(page.locator("[data-whatsapp-link]")).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
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
    page.getByRole("button", { name: "Super Kusuma", exact: true }),
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
  await page.getByRole("button", { name: "Super Kusuma", exact: true }).click()
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

test("experience timeline follows scrolling, replays, and respects reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 800 })
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/")
  const entries = page.locator("[data-experience-entry]")
  const progress = page.locator("[data-experience-progress]").first()
  const scale = () =>
    progress.evaluate(
      (element) => new DOMMatrix(getComputedStyle(element).transform).m22,
    )

  await expect(entries).toHaveCount(5)
  await expect(entries.first()).toContainText("ITB STIKOM Bali")
  await expect(entries.nth(1)).toContainText("MKM Honda")
  await expect(page.locator("#experience details").first()).not.toContainText(
    "Laravel",
  )
  await expect.poll(scale).toBeLessThan(0.01)
  await entries
    .first()
    .evaluate((element) =>
      element.scrollIntoView({ block: "center", behavior: "instant" }),
    )
  await expect.poll(scale).toBeGreaterThan(0.2)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }))
  await expect.poll(scale).toBeLessThan(0.01)
  await entries
    .first()
    .evaluate((element) =>
      element.scrollIntoView({ block: "center", behavior: "instant" }),
    )
  await expect.poll(scale).toBeGreaterThan(0.2)

  await page.emulateMedia({ reducedMotion: "reduce" })
  for (const line of await page.locator("[data-experience-progress]").all()) {
    await expect(line).toHaveCSS("transform", "none")
  }
  for (const entry of await entries.all()) {
    await expect(entry).toHaveCSS("transform", "none")
    await expect(entry).toHaveCSS("opacity", "1")
  }
})

test("not-found page matches the theme and offers working recovery links", async ({
  page,
  browser,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" })
  const response = await page.goto("/this-page-does-not-exist")
  expect(response?.status()).toBe(404)
  await expect(page).toHaveTitle("Page not found · Kusuma")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "This page took a detour.",
  )
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  )
  await expect(page.locator("html")).toHaveClass(/dark/)
  await page.getByRole("button", { name: "light theme", exact: true }).click()
  await page.reload()
  await expect(page.locator("html")).toHaveClass(/light/)
  await expect(
    page.getByRole("link", { name: "See selected work", exact: true }),
  ).toHaveAttribute("href", "/#work")
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  }
  await page.getByRole("link", { name: "Back to home", exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator("h1")).toContainText("It started")

  const context = await browser.newContext({ javaScriptEnabled: false })
  const staticPage = await context.newPage()
  expect((await staticPage.goto("/another-missing-page"))?.status()).toBe(404)
  await expect(
    staticPage.getByRole("link", { name: "Back to home", exact: true }),
  ).toBeVisible()
  await context.close()
})

test("404 plane shooter supports scoring, steering, pause, and touch controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/flight-detour")
  const board = page.getByRole("application", { name: "404 plane shooter" })
  const player = page.locator("[data-flight-player]")
  const score = page.locator("[data-flight-score]")
  await expect(board).toHaveAttribute("data-flight-state", "ready")
  await page.getByRole("button", { name: "Start flight", exact: true }).click()
  await expect(board).toHaveAttribute("data-flight-state", "running")
  await expect
    .poll(async () => Number(await score.textContent()))
    .toBeGreaterThanOrEqual(10)
  const start = await player.getAttribute("transform")
  await page.keyboard.down("ArrowLeft")
  await expect.poll(() => player.getAttribute("transform")).not.toBe(start)
  await page.keyboard.up("ArrowLeft")
  await page.keyboard.press("Space")
  await expect(board).toHaveAttribute("data-flight-state", "paused")
  const stopped = await player.getAttribute("transform")
  await page.waitForTimeout(150)
  await expect(player).toHaveAttribute("transform", stopped ?? "")
  await board
    .getByRole("button", { name: "Resume flight", exact: true })
    .first()
    .click()
  await expect(board).toHaveAttribute("data-flight-state", "running")
  await page.getByRole("link", { name: "Back to home", exact: true }).focus()
  await expect(board).toHaveAttribute("data-flight-state", "paused")

  await page.setViewportSize({ width: 320, height: 900 })
  await board.scrollIntoViewIfNeeded()
  await board
    .getByRole("button", { name: "Resume flight", exact: true })
    .first()
    .click()
  const right = page.getByRole("button", { name: "Steer right", exact: true })
  const bounds = await right.boundingBox()
  expect(bounds?.width).toBeGreaterThanOrEqual(44)
  expect(bounds?.height).toBeGreaterThanOrEqual(44)
  const before = await player.getAttribute("transform")
  await page.mouse.move((bounds?.x ?? 0) + 22, (bounds?.y ?? 0) + 22)
  await page.mouse.down()
  await expect.poll(() => player.getAttribute("transform")).not.toBe(before)
  await page.mouse.up()
  await page
    .getByRole("button", { name: "Restart flight", exact: true })
    .click()
  await expect(score).toHaveText("0")
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})
