import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync } from 'fs';
import { join, basename } from 'path';
import { marked } from 'marked';
import { parseFrontMatter, titleFromFilename, sectionDisplayName, sectionSlug, lessonSlug, lessonHref, renderImage, buildSidebar, buildLessonNav } from './lib/build-utils.js';
import { generateThumbnails } from './lib/thumbnails.js';

const LESSONS_DIR = 'lessons';
const DIST_DIR = 'dist';
const TEMPLATE = readFileSync('template.html', 'utf8');

const renderer = new marked.Renderer();
renderer.image = renderImage;
renderer.link = (href, title, text) => {
  const titleAttr = title ? ` title="${title}"` : '';
  return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
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

generateThumbnails('assets');

// Pass 1: collect course structure from two-level directory tree
const sectionDirs = readdirSync(LESSONS_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name));

const lessons = [];
const sections = new Map();
const seenSectionSlugs = new Set();

for (const dir of sectionDirs) {
  const rawSectionDir = dir.name;
  const sectionDir = sectionSlug(rawSectionDir);
  if (seenSectionSlugs.has(sectionDir)) {
    throw new Error(`Section slug collision: "${sectionDir}" (from "${rawSectionDir}")`);
  }
  seenSectionSlugs.add(sectionDir);

  const sectionName = sectionDisplayName(rawSectionDir);
  const files = readdirSync(join(LESSONS_DIR, rawSectionDir))
    .filter(f => f.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b));

  const seenLessonSlugs = new Set();
  const sectionLessons = files.map(file => {
    const src = readFileSync(join(LESSONS_DIR, rawSectionDir, file), 'utf8');
    const { meta } = parseFrontMatter(src);
    const slug = lessonSlug(basename(file, '.md'));
    if (seenLessonSlugs.has(slug)) {
      throw new Error(`Lesson slug collision in "${sectionDir}": "${slug}" (from "${file}")`);
    }
    seenLessonSlugs.add(slug);
    const title = meta.title ?? titleFromFilename(file);
    return { file, slug, sectionDir, rawSectionDir, title };
  });

  sections.set(sectionName, sectionLessons);
  lessons.push(...sectionLessons);
}

// Write index.html redirecting to the first lesson, and a manifest for tests
if (lessons.length > 0) {
  const first = lessons[0];
  writeFileSync(join(DIST_DIR, 'index.html'),
    `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${first.sectionDir}/${first.slug}.html"></head></html>`);
  console.log(`✓ dist/index.html → ${first.sectionDir}/${first.slug}.html`);
  const manifest = lessons.map(l => `${l.sectionDir}/${l.slug}.html`);
  writeFileSync(join(DIST_DIR, 'lesson-order.json'), JSON.stringify(manifest, null, 2));
}

// Pass 2: render each lesson
for (const lesson of lessons) {
  const { file, slug, sectionDir, rawSectionDir } = lesson;
  const src = readFileSync(join(LESSONS_DIR, rawSectionDir, file), 'utf8');
  const { meta, body } = parseFrontMatter(src);
  const title = meta.title ?? titleFromFilename(file);
  const content = marked.parse(body.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
    (_, alt, url) => `![${alt}](${url.replace(/ /g, '%20')})`));
  const sidebar = buildSidebar(lesson, sections);
  const lessonNav = buildLessonNav(lesson, lessons);
  const html = TEMPLATE
    .replaceAll('{{title}}', title)
    .replace('{{sidebar}}', sidebar)
    .replaceAll('{{lesson-nav}}', lessonNav)
    .replace('{{content}}', content);
  const outDir = join(DIST_DIR, sectionDir);
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, `${slug}.html`);
  writeFileSync(outFile, html);
  console.log(`✓ ${outFile}`);
}
