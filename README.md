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
---

# My Lesson

Content goes here.
```

Run `npm run build` and `dist/my-lesson.html` appears.

## Front-matter fields

| Field | Required | Description |
|---|---|---|
| `title` | no | Page title and `<title>` tag. Defaults to the filename. |
| `description` | no | Optional subtitle. |
