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

for (const file of files) {
  const src = readFileSync(join(LESSONS_DIR, file), 'utf8');
  const { meta, body } = parseFrontMatter(src);
  const title = meta.title ?? basename(file, '.md');
  const content = marked.parse(body.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
    (_, alt, url) => `![${alt}](${url.replace(/ /g, '%20')})`));
  const html = TEMPLATE
    .replace('{{title}}', title)
    .replace('{{content}}', content);
  const outFile = join(DIST_DIR, file.replace(/\.md$/, '.html'));
  writeFileSync(outFile, html);
  console.log(`✓ ${outFile}`);
}
