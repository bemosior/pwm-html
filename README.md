# pwm-html

A micro-LMS. Write lessons in markdown, build to self-contained HTML files, deploy anywhere.

## Usage

```sh
npm install
npm run build
```

Output goes to `dist/`. Each file is a standalone HTML page with no external dependencies — drop it on any static host (GitHub Pages, Netlify, S3, etc.).

## Writing a lesson

Lessons live inside section folders under `lessons/`. Both the section folder and the lesson file use a numeric prefix to control order:

```
lessons/
  10-getting-started/
    10-intro.md
    20-next-topic.md
  20-advanced/
    10-deep-dive.md
```

```markdown
---
title: My Lesson
---

# My Lesson

Content goes here.
```

Run `npm run build` and `dist/10-getting-started/10-intro.html` appears.

## Organizing lessons into sections

Sections are folders; lessons are files within them. The build generates a course sidebar and prev/next navigation on each page automatically.

- Section order follows folder name order. Use a numeric prefix (`10-getting-started/`, `20-advanced/`) to control sequence.
- Lesson order within a section follows filename order. Use a numeric prefix (`10-intro.md`, `20-next.md`).
- Use sparse numbering (10, 20, 30…) to leave room for insertions without renaming existing files.
- Section display names are derived from the folder name: the numeric prefix is stripped and hyphens become spaces (`20-the-five-minute-map` → `The Five Minute Map`).

To add a new section, just use a new section name — no other configuration needed.

## Embedding assets

Assets (images, video, PDFs) live in the `assets/` folder. They are never committed to the repo — drop them in locally or layer them in at deploy time. The build references them by path without copying.

When deployed, `assets/` sits at the repo root, one level above `dist/`. The build rewrites `assets/` paths to `../assets/` automatically.

```
web-root/
├── dist/
│   └── my-lesson.html
└── assets/
    ├── photo.jpg
    └── lesson.mp4
```

### Images

```markdown
![A descriptive caption](assets/photo.jpg)
```

### Video

```markdown
![Chapter 1 intro](assets/lesson.mp4)
```

Rendered as a native `<video controls>` element. MP4 only.

### PDF download

```markdown
![Download the worksheet](assets/worksheet.pdf)
```

Rendered as a styled download button. Clicking it triggers a browser download.

## Front-matter fields

| Field | Required | Description |
|---|---|---|
| `title` | no | Page title and `<title>` tag. Defaults to the filename. |
