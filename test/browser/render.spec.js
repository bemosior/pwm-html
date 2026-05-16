import { test, expect } from '@playwright/test';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const distDir = resolve(fileURLToPath(import.meta.url), '../../../dist');
const firstLesson = `file://${distDir}/10-welcome/010.html`;
const lastLesson = `file://${distDir}/40-bonus-content/120.html`;

test.describe('Layout', () => {
  test('page-layout uses CSS grid', async ({ page }) => {
    await page.goto(firstLesson);
    const display = await page.locator('.page-layout').evaluate(
      el => getComputedStyle(el).display
    );
    expect(display).toBe('grid');
  });

  test('sidebar nav exists with at least one anchor', async ({ page }) => {
    await page.goto(firstLesson);
    const links = page.locator('.course-nav a');
    expect(await links.count()).toBeGreaterThan(0);
  });

  test('lesson article element exists', async ({ page }) => {
    await page.goto(firstLesson);
    await expect(page.locator('article.lesson')).toBeVisible();
  });
});

test.describe('Navigation correctness', () => {
  test('active link in sidebar matches current page slug', async ({ page }) => {
    await page.goto(firstLesson);
    const activeHref = await page.locator('.course-nav a.active').getAttribute('href');
    expect(activeHref).toBe('010.html');
  });

  test('lesson-nav appears at top and bottom of article', async ({ page }) => {
    await page.goto(firstLesson);
    const navs = page.locator('article.lesson .lesson-nav');
    expect(await navs.count()).toBe(2);
  });

  test('first lesson has no prev anchor (span placeholder)', async ({ page }) => {
    await page.goto(firstLesson);
    const prevLink = page.locator('.lesson-nav .nav-prev');
    expect(await prevLink.count()).toBe(0);
  });

  test('last lesson has no next anchor (span placeholder)', async ({ page }) => {
    await page.goto(lastLesson);
    const nextLink = page.locator('.lesson-nav .nav-next');
    expect(await nextLink.count()).toBe(0);
  });

  test('middle lesson has both prev and next links', async ({ page }) => {
    await page.goto(`file://${distDir}/10-welcome/020.html`);
    await expect(page.locator('.lesson-nav .nav-prev').first()).toBeVisible();
    await expect(page.locator('.lesson-nav .nav-next').first()).toBeVisible();
  });

  test('clicking a sidebar link navigates to that page', async ({ page }) => {
    await page.goto(firstLesson);
    // click the second lesson in sidebar
    await page.locator('.course-nav a:not(.active)').first().click();
    await expect(page).not.toHaveURL(firstLesson);
    // landed on a valid lesson page
    await expect(page.locator('article.lesson')).toBeVisible();
  });
});

test.describe('Responsive layout', () => {
  test('at 375px viewport sidebar collapses to single column', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(firstLesson);
    const columns = await page.locator('.page-layout').evaluate(
      el => getComputedStyle(el).gridTemplateColumns
    );
    // Single column: value should not contain two distinct column widths
    expect(columns).not.toMatch(/\d+px \d+px/);
  });
});
