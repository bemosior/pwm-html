import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSidebar } from '../lib/build-utils.js';

function makeLesson(slug, sectionDir, title) {
  return { slug, sectionDir, title, file: `${slug}.md` };
}

function makeSection(name, lessons) {
  const sections = new Map();
  sections.set(name, lessons);
  return sections;
}

test('active class on current lesson, not on others', () => {
  const l1 = makeLesson('introduction', 'welcome', 'Intro');
  const l2 = makeLesson('benefits', 'welcome', 'Benefits');
  const sections = makeSection('Welcome', [l1, l2]);

  const html = buildSidebar(l1, sections);
  assert.ok(html.includes('class="active"'));
  // active only on l1's anchor
  const activeCount = (html.match(/class="active"/g) || []).length;
  assert.equal(activeCount, 1);
  assert.ok(html.includes(`href="introduction.html" class="active"`));
});

test('no active class when current is not in section', () => {
  const l1 = makeLesson('introduction', 'welcome', 'Intro');
  const l2 = makeLesson('deep-dive', 'advanced', 'Deep Dive');
  const sections = new Map([['Welcome', [l1]], ['Advanced', [l2]]]);
  const html = buildSidebar(l2, sections);
  // l2 is active; l1 should not be
  assert.ok(!html.includes(`href="../welcome/introduction.html" class="active"`));
  assert.ok(html.includes(`href="deep-dive.html" class="active"`));
});

test('same-section href uses slug-only form', () => {
  const l1 = makeLesson('introduction', 'welcome', 'Intro');
  const sections = makeSection('Welcome', [l1]);
  const html = buildSidebar(l1, sections);
  assert.ok(html.includes('href="introduction.html"'));
});

test('cross-section href uses ../section/slug form', () => {
  const l1 = makeLesson('introduction', 'welcome', 'Intro');
  const l2 = makeLesson('deep-dive', 'advanced', 'Deep Dive');
  const sections = new Map([['Welcome', [l1]], ['Advanced', [l2]]]);
  const html = buildSidebar(l1, sections);
  assert.ok(html.includes('href="../advanced/deep-dive.html"'));
});

test('lesson numbers are zero-padded', () => {
  const lessons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n =>
    makeLesson(`lesson-${n}`, 'section', `Lesson ${n}`)
  );
  const sections = makeSection('Section', lessons);
  const html = buildSidebar(lessons[0], sections);
  assert.ok(html.includes('01.'));
  assert.ok(html.includes('10.'));
});

test('section names appear as nav-section paragraphs', () => {
  const l1 = makeLesson('introduction', 'welcome', 'Intro');
  const sections = makeSection('Welcome', [l1]);
  const html = buildSidebar(l1, sections);
  assert.ok(html.includes('<p class="nav-section">Welcome</p>'));
});

test('output is wrapped in nav.course-nav', () => {
  const l1 = makeLesson('introduction', 'welcome', 'Intro');
  const sections = makeSection('Welcome', [l1]);
  const html = buildSidebar(l1, sections);
  assert.ok(html.startsWith('<nav class="course-nav">'));
  assert.ok(html.endsWith('</nav>'));
});
