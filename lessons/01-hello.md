---
title: Hello, World
description: A first lesson to prove the pipeline works.
---

# Hello, World

Welcome to the first lesson. By the end you'll know how the build pipeline works and what you can do in lesson content.

## What this is

This is a micro-LMS. Each lesson lives in a `.md` file under `lessons/`. Running `npm run build` converts every lesson into a self-contained `.html` file in `dist/` — no server required, no build framework.

## Markdown features

You can use all standard markdown:

- **Bold** and *italic* text
- Inline `code` snippets
- Lists like this one

### Code blocks

```js
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet('world'));
```

### Blockquotes

> The best way to learn is to build something real and ship it.

## What's next

Add a new file to `lessons/` and run `npm run build` again. Each file becomes its own page.

## Media Test

![Chapter 1 intro](assets/01 introduction.mp4)

![A descriptive caption](assets/03.png)

![Download the worksheet](assets/05.pdf)

