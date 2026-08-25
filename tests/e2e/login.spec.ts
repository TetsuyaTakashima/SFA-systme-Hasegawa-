import { expect, test } from "@playwright/test";

test("login page renders without an error overlay", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  const response = await page.goto("/login");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "営業管理へログイン" })).toBeVisible();
  await expect(page.getByLabel("ログインID")).toBeVisible();
  await expect(page.getByLabel("パスワード")).toBeVisible();
  await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);
  expect(await page.locator("body").innerText()).not.toHaveLength(0);
  expect(consoleErrors).toEqual([]);
});

test("protected pages redirect to login and preserve the destination", async ({ page }) => {
  await page.goto("/sales-targets?status=未着手");
  await expect(page).toHaveURL(/\/login\?next=%2Fsales-targets/u);
});

test("security headers and responsive width are present", async ({ page }) => {
  const response = await page.goto("/login");
  expect(response?.headers()["content-security-policy"]).toContain("script-src 'self' 'nonce-");
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1);
});
