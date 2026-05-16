import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import { marked } from 'marked';

const LESSONS_DIR = 'lessons';
const DIST_DIR = 'dist';
const TEMPLATE = readFileSync('template.html', 'utf8');

function parseFrontMatter(src) {
  const match = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: src };
  const meta = Object.fromEntries(
    match[1].split('\n').map(line => {
      const [k, ...v] = line.split(':');
      return [k.trim(), v.join(':').trim()];
    })
  );
  return { meta, body: match[2] };
}

const renderer = new marked.Renderer();
renderer.image = (href, title, text) => {
  if (!href) return `<!-- missing asset: ${text} -->`;
  if (href.startsWith('assets/')) href = '../' + href;
  if (href.endsWith('.mp4')) {
    return `<video controls><source src="${href}" type="video/mp4">${text}</video>`;
  }
  if (href.endsWith('.pdf')) {
    const label = text || 'Download PDF';
    return `<a class="pdf-download" target="_blank" href="${href}" download>${label}</a>`;
  }
  return `<img src="${href}" alt="${text}">`;
};
marked.use({ renderer });

mkdirSync(DIST_DIR, { recursive: true });

const files = readdirSync(LESSONS_DIR).filter(f => f.endsWith('.md'));

// Pass 1: collect metadata for all lessons
const lessons = files.map(file => {
  const src = readFileSync(join(LESSONS_DIR, file), 'utf8');
  const { meta } = parseFrontMatter(src);
  const slug = basename(file, '.md');
  const title = meta.title ?? slug;
  const section = meta.section ?? '';
  return { file, slug, title, section };
});

// Sort sections alphabetically; within each section sort lessons by title.
// Lessons with no section go to the end.
const UNSECTIONED = '￿';
lessons.sort((a, b) => {
  const sA = a.section || UNSECTIONED;
  const sB = b.section || UNSECTIONED;
  if (sA !== sB) return sA.localeCompare(sB);
  return a.title.localeCompare(b.title);
});

// Build ordered map: section name → lesson array
const sections = new Map();
for (const lesson of lessons) {
  const key = lesson.section;
  if (!sections.has(key)) sections.set(key, []);
  sections.get(key).push(lesson);
}

function buildSidebar(currentSlug) {
  let html = '<nav class="course-nav">';
  for (const [section, items] of sections) {
    if (section) html += `<p class="nav-section">${section}</p>`;
    html += '<ul>';
    for (const item of items) {
      const cls = item.slug === currentSlug ? ' class="active"' : '';
      html += `<li><a href="${item.slug}.html"${cls}>${item.title}</a></li>`;
    }
    html += '</ul>';
  }
  html += '</nav>';
  return html;
}

function buildLessonNav(currentSlug) {
  const idx = lessons.findIndex(l => l.slug === currentSlug);
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx < lessons.length - 1 ? lessons[idx + 1] : null;
  let html = '<nav class="lesson-nav">';
  html += prev
    ? `<a href="${prev.slug}.html" class="nav-prev">← ${prev.title}</a>`
    : '<span></span>';
  html += next
    ? `<a href="${next.slug}.html" class="nav-next">${next.title} →</a>`
    : '<span></span>';
  html += '</nav>';
  return html;
}

// Write index.html redirecting to the first lesson
if (lessons.length > 0) {
  const first = lessons[0];
  writeFileSync(join(DIST_DIR, 'index.html'),
    `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${first.slug}.html"></head></html>`);
  console.log(`✓ dist/index.html → ${first.slug}.html`);
}

// Pass 2: generate HTML for each lesson
for (const { file, slug, title } of lessons) {
  const src = readFileSync(join(LESSONS_DIR, file), 'utf8');
  const { meta, body } = parseFrontMatter(src);
  const lessonTitle = meta.title ?? slug;
  const content = marked.parse(body.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
    (_, alt, url) => `![${alt}](${url.replace(/ /g, '%20')})`));
  const sidebar = buildSidebar(slug);
  const lessonNav = buildLessonNav(slug);
  const html = TEMPLATE
    .replace('{{title}}', lessonTitle)
    .replace('{{sidebar}}', sidebar)
    .replaceAll('{{lesson-nav}}', lessonNav)
    .replace('{{content}}', content);
  const outFile = join(DIST_DIR, file.replace(/\.md$/, '.html'));
  writeFileSync(outFile, html);
  console.log(`✓ ${outFile}`);
}
