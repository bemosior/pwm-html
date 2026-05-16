# pwm-html

A micro-LMS. Write lessons in markdown, build to self-contained HTML files, deploy anywhere.

## Usage

```sh
npm install
npm run build
```

Output goes to `dist/`. Each file is a standalone HTML page with no external dependencies — drop it on any static host (GitHub Pages, Netlify, S3, etc.).

## Writing a lesson

Create a `.md` file in `lessons/`:

```markdown
---
title: My Lesson
section: Getting Started
---

# My Lesson

Content goes here.
```

Run `npm run build` and `dist/my-lesson.html` appears.

## Organizing lessons into sections

The `section` front-matter field assigns a lesson to a named section. The build collects all lessons, groups them by section, and generates a course sidebar and prev/next navigation on each page automatically.

- Sections are ordered alphabetically.
- Lessons within a section are ordered alphabetically by title.
- Lessons with no `section` field appear at the end of the sidebar with no section heading.

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
| `description` | no | Optional subtitle. |
| `section` | no | Section name for the course sidebar. Lessons without this appear at the end. |
