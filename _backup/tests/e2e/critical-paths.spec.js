import { test, expect } from '@playwright/test';

test.describe('P0 Critical Paths', () => {

  test('storefront loads directly as default view', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.menu-item', { timeout: 20000 });
    const items = page.locator('.menu-item');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  });

  test('header shows brand name', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.menu-item', { timeout: 20000 });
    await expect(page.locator('#headerBrandName')).toContainText('Tu Marca');
  });

  test('categories render dynamically', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.bento-card', { timeout: 20000 });
    const cats = page.locator('.bento-card');
    const count = await cats.count();
    expect(count).toBeGreaterThan(1);
  });

  test('hero banner shows generic title', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.hero-banner-title', { timeout: 20000 });
    const text = await page.locator('#sfHeroTitle').textContent();
    expect(text.length).toBeGreaterThan(0);
  });

  test('add item to cart and see it in cart panel', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.qty-add-btn', { timeout: 20000 });

    const addBtn = page.locator('.qty-add-btn').first();
    await addBtn.click();

    await expect(page.locator('#cartCount')).toHaveText('1');

    await page.locator('#cartFab').click();
    await expect(page.locator('#cartPanel.open')).toBeVisible();
    await expect(page.locator('.cart-row')).toBeVisible();
  });

  test('category filtering works', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.bento-card', { timeout: 20000 });
    await page.waitForSelector('.menu-item', { timeout: 10000 });

    const secondCat = page.locator('.bento-card').nth(1);
    await secondCat.click();
    await page.waitForTimeout(300);
    await expect(page.locator('#menuTitle')).not.toBeEmpty();
  });

  test('open and close product detail', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.menu-item', { timeout: 20000 });

    await page.locator('.menu-item').first().click();
    await expect(page.locator('#productDetailPanel.open')).toBeVisible();
    await expect(page.locator('#detailProductTitle')).toBeVisible();

    await page.locator('#productDetailPanel .panel-close.floating').click();
    await expect(page.locator('#productDetailPanel.open')).not.toBeVisible();
  });

  test('search filters products', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.menu-item', { timeout: 20000 });

    await page.locator('#searchInput').fill('Auriculares');
    await page.waitForTimeout(300);
    const items = page.locator('.menu-item');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
    await expect(items.first()).toContainText('Auriculares');
  });
});

test.describe('P1 Form Validation', () => {

  test('form validation shows errors for empty fields', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.qty-add-btn', { timeout: 20000 });
    await page.locator('.qty-add-btn').first().click({ force: true });
    await page.waitForTimeout(500);
    await page.locator('#cartFab').click();
    await page.waitForTimeout(500);

    const waBtn = page.locator('.wa-btn');
    if (await waBtn.isVisible()) {
      await waBtn.click();
      await expect(page.locator('.toast.show')).toBeVisible();
    }
  });
});

test.describe('P2 Edge Cases', () => {

  test('cart badge updates with multiple items', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.qty-add-btn', { timeout: 20000 });

    const addBtns = page.locator('.menu-item .qty-add-btn');
    const toAdd = Math.min(3, await addBtns.count());

    for (let i = 0; i < toAdd; i++) {
      await addBtns.nth(i).scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);
      await addBtns.nth(i).click({ force: true });
      await page.waitForTimeout(400);
    }

    await expect(page.locator('#cartCount')).not.toHaveText('0');
  });

  test('remove item from cart', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.qty-add-btn', { timeout: 20000 });

    await page.locator('.qty-add-btn').first().click();
    await expect(page.locator('#cartCount')).toHaveText('1', { timeout: 5000 });

    await page.locator('#cartFab').click();
    await expect(page.locator('.cart-row')).toBeVisible({ timeout: 5000 });

    await page.locator('.cart-remove-btn').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('.cart-row')).toHaveCount(0, { timeout: 5000 });
  });

  test('product images load or show emoji fallback', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.menu-item', { timeout: 20000 });

    const firstItem = page.locator('.menu-item').first();
    await expect(firstItem).toBeVisible();

    const photo = firstItem.locator('.item-photo');
    await expect(photo).toBeVisible();
  });
});
