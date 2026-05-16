import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLessonNav } from '../lib/build-utils.js';

function makeLesson(slug, sectionDir, title) {
  return { slug, sectionDir, title, file: `${slug}.md` };
}

test('first lesson has no prev link', () => {
  const l1 = makeLesson('introduction', 'welcome', 'Intro');
  const l2 = makeLesson('next', 'welcome', 'Next');
  const html = buildLessonNav(l1, [l1, l2]);
  assert.ok(!html.includes('nav-prev'));
});

test('last lesson has no next link', () => {
  const l1 = makeLesson('introduction', 'welcome', 'Intro');
  const l2 = makeLesson('last', 'welcome', 'Last');
  const html = buildLessonNav(l2, [l1, l2]);
  assert.ok(!html.includes('nav-next'));
});

test('middle lesson has both prev and next links', () => {
  const l1 = makeLesson('first', 'welcome', 'First');
  const l2 = makeLesson('middle', 'welcome', 'Middle');
  const l3 = makeLesson('last', 'welcome', 'Last');
  const html = buildLessonNav(l2, [l1, l2, l3]);
  assert.ok(html.includes('nav-prev'));
  assert.ok(html.includes('nav-next'));
});

test('cross-section prev link uses ../section/slug form', () => {
  const l1 = makeLesson('introduction', 'welcome', 'Intro');
  const l2 = makeLesson('deep-dive', 'advanced', 'Deep Dive');
  const html = buildLessonNav(l2, [l1, l2]);
  assert.ok(html.includes('href="../welcome/introduction.html"'));
});

test('cross-section next link uses ../section/slug form', () => {
  const l1 = makeLesson('introduction', 'welcome', 'Intro');
  const l2 = makeLesson('deep-dive', 'advanced', 'Deep Dive');
  const html = buildLessonNav(l1, [l1, l2]);
  assert.ok(html.includes('href="../advanced/deep-dive.html"'));
});

test('prev link contains left arrow', () => {
  const l1 = makeLesson('first', 'welcome', 'First');
  const l2 = makeLesson('second', 'welcome', 'Second');
  const html = buildLessonNav(l2, [l1, l2]);
  assert.ok(html.includes('← First'));
});

test('next link contains right arrow', () => {
  const l1 = makeLesson('first', 'welcome', 'First');
  const l2 = makeLesson('second', 'welcome', 'Second');
  const html = buildLessonNav(l1, [l1, l2]);
  assert.ok(html.includes('Second →'));
});

test('output is wrapped in nav.lesson-nav', () => {
  const l1 = makeLesson('only', 'welcome', 'Only');
  const html = buildLessonNav(l1, [l1]);
  assert.ok(html.startsWith('<nav class="lesson-nav">'));
  assert.ok(html.endsWith('</nav>'));
});
