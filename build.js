import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync } from 'fs';
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

function sectionDisplayName(dirName) {
  return dirName
    .replace(/^\d+-/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function lessonHref(fromSectionDir, toSectionDir, toSlug) {
  if (fromSectionDir === toSectionDir) return `${toSlug}.html`;
  return `../${toSectionDir}/${toSlug}.html`;
}

const renderer = new marked.Renderer();
renderer.image = (href, title, text) => {
  if (!href) return `<!-- missing asset: ${text} -->`;
  if (href.startsWith('assets/')) href = '../../' + href;
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

// Clean dist
mkdirSync(DIST_DIR, { recursive: true });
for (const entry of readdirSync(DIST_DIR, { withFileTypes: true })) {
  if (entry.isDirectory()) {
    rmSync(join(DIST_DIR, entry.name), { recursive: true });
  } else if (entry.name.endsWith('.html')) {
    rmSync(join(DIST_DIR, entry.name));
  }
}

// Pass 1: collect course structure from two-level directory tree
const sectionDirs = readdirSync(LESSONS_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name));

const lessons = [];
const sections = new Map();

for (const dir of sectionDirs) {
  const sectionDir = dir.name;
  const sectionName = sectionDisplayName(sectionDir);
  const files = readdirSync(join(LESSONS_DIR, sectionDir))
    .filter(f => f.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b));

  const sectionLessons = files.map(file => {
    const src = readFileSync(join(LESSONS_DIR, sectionDir, file), 'utf8');
    const { meta } = parseFrontMatter(src);
    const slug = basename(file, '.md');
    const title = meta.title ?? slug;
    return { file, slug, sectionDir, title };
  });

  sections.set(sectionName, sectionLessons);
  lessons.push(...sectionLessons);
}

function buildSidebar(currentLesson) {
  let html = '<nav class="course-nav">';
  for (const [sectionName, items] of sections) {
    html += `<p class="nav-section">${sectionName}</p><ul>`;
    for (const item of items) {
      const href = lessonHref(currentLesson.sectionDir, item.sectionDir, item.slug);
      const cls = item === currentLesson ? ' class="active"' : '';
      html += `<li><a href="${href}"${cls}>${item.title}</a></li>`;
    }
    html += '</ul>';
  }
  html += '</nav>';
  return html;
}

function buildLessonNav(currentLesson) {
  const idx = lessons.indexOf(currentLesson);
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx < lessons.length - 1 ? lessons[idx + 1] : null;
  let html = '<nav class="lesson-nav">';
  html += prev
    ? `<a href="${lessonHref(currentLesson.sectionDir, prev.sectionDir, prev.slug)}" class="nav-prev">← ${prev.title}</a>`
    : '<span></span>';
  html += next
    ? `<a href="${lessonHref(currentLesson.sectionDir, next.sectionDir, next.slug)}" class="nav-next">${next.title} →</a>`
    : '<span></span>';
  html += '</nav>';
  return html;
}

// Write index.html redirecting to the first lesson
if (lessons.length > 0) {
  const first = lessons[0];
  writeFileSync(join(DIST_DIR, 'index.html'),
    `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${first.sectionDir}/${first.slug}.html"></head></html>`);
  console.log(`✓ dist/index.html → ${first.sectionDir}/${first.slug}.html`);
}

// Pass 2: render each lesson
for (const lesson of lessons) {
  const { file, slug, sectionDir } = lesson;
  const src = readFileSync(join(LESSONS_DIR, sectionDir, file), 'utf8');
  const { meta, body } = parseFrontMatter(src);
  const title = meta.title ?? slug;
  const content = marked.parse(body.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
    (_, alt, url) => `![${alt}](${url.replace(/ /g, '%20')})`));
  const sidebar = buildSidebar(lesson);
  const lessonNav = buildLessonNav(lesson);
  const html = TEMPLATE
    .replace('{{title}}', title)
    .replace('{{sidebar}}', sidebar)
    .replaceAll('{{lesson-nav}}', lessonNav)
    .replace('{{content}}', content);
  const outDir = join(DIST_DIR, sectionDir);
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, `${slug}.html`);
  writeFileSync(outFile, html);
  console.log(`✓ ${outFile}`);
}
