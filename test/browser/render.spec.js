import { test, expect } from '@playwright/test';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync } from 'fs';

const distDir = resolve(fileURLToPath(import.meta.url), '../../../dist');

function orderedLessonUrls() {
  const sections = readdirSync(distDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));
  const urls = [];
  for (const section of sections) {
    readdirSync(join(distDir, section.name))
      .filter(f => f.endsWith('.html'))
      .sort()
      .forEach(f => urls.push(`file://${join(distDir, section.name, f)}`));
  }
  return urls;
}

const lessonUrls = orderedLessonUrls();
const firstLesson = lessonUrls[0];
const lastLesson = lessonUrls[lessonUrls.length - 1];

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
    expect(activeHref).toBe(firstLesson.split('/').pop());
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
    await page.goto(lessonUrls[1]);
    await expect(page.locator('.lesson-nav .nav-prev').first()).toBeVisible();
    await expect(page.locator('.lesson-nav .nav-next').first()).toBeVisible();
  });

  test('clicking a sidebar link navigates to that page', async ({ page }) => {
    await page.goto(firstLesson);
    const targetHref = await page.locator('.course-nav a:not(.active)').first().getAttribute('href');
    await page.locator('.course-nav a:not(.active)').first().click();
    const activeHref = await page.locator('.course-nav a.active').getAttribute('href');
    expect(activeHref).toBe(targetHref);
  });
});

test.describe('Responsive layout', () => {
  test('at 375px viewport sidebar collapses to single column', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(firstLesson);
    const display = await page.locator('.page-layout').evaluate(
      el => getComputedStyle(el).display
    );
    expect(display).toBe('block');
  });
});
