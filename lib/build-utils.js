export function sectionSlug(dirName) {
  const m = dirName.match(/^(\d+)\s*-\s*(.+)$/);
  if (!m) return dirName.toLowerCase().replace(/\s+/g, '-');
  const num = parseInt(m[1], 10).toString();
  const name = m[2].toLowerCase().replace(/\s+/g, '-');
  return `${num}-${name}`;
}

export function lessonSlug(rawSlug) {
  const m = rawSlug.match(/^(\d+)\s*-\s*(.+)$/);
  if (m) {
    const name = m[2].toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');
    return `${m[1]}-${name}`;
  }
  return rawSlug;
}

export function parseFrontMatter(src) {
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

export function titleFromFilename(filename) {
  return filename.replace(/\.md$/, '').replace(/^\d+\s*-\s*/, '');
}

export function sectionDisplayName(dirName) {
  return dirName
    .replace(/^\d+\s*-\s*/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function lessonHref(fromSectionDir, toSectionDir, toSlug) {
  if (fromSectionDir === toSectionDir) return `${toSlug}.html`;
  return `../${toSectionDir}/${toSlug}.html`;
}

export function renderImage(href, title, text) {
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
}

export function buildSidebar(currentLesson, sections) {
  let html = '<nav class="course-nav">';
  for (const [sectionName, items] of sections) {
    html += `<p class="nav-section">${sectionName}</p><ul>`;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const href = lessonHref(currentLesson.sectionDir, item.sectionDir, item.slug);
      const cls = item === currentLesson ? ' class="active"' : '';
      const num = String(i + 1).padStart(2, '0');
      html += `<li><a href="${href}"${cls}>${num}. ${item.title}</a></li>`;
    }
    html += '</ul>';
  }
  html += '</nav>';
  return html;
}

export function buildLessonNav(currentLesson, lessons) {
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
