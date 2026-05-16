# AGENTS.md

Guidance for AI agents working in this repository.

## Project overview

A minimal static-site LMS. Lessons are markdown files; `build.js` converts them to self-contained HTML pages using `template.html` as the shell.

## Key files

| File | Role |
|---|---|
| `build.js` | Build script — reads `lessons/*.md`, writes `dist/*.html` |
| `template.html` | HTML/CSS shell; placeholders are `{{title}}` and `{{content}}` |
| `lessons/` | Source markdown files, one per lesson |
| `assets/` | Images, videos, and PDFs — gitignored, layered in at deploy time |
| `dist/` | Build output — gitignored, never edit directly |

## Build

```sh
npm install   # first time only
npm run build
```

Always run `npm run build` after touching `build.js`, `template.html`, or any file in `lessons/` to verify the output is valid.

## Conventions

- **Front-matter** at the top of each lesson uses `---` fences. Fields: `title` (string, optional override — defaults to the filename with the numeric prefix stripped). Front-matter can be omitted entirely if no overrides are needed.
- **Lesson filenames** use kebab-case with a numeric prefix: `10-intro.md`, `20-next-topic.md`. The slug becomes the output filename.
- **Sections are folders** under `lessons/`, also with a numeric prefix: `10-getting-started/`, `20-advanced/`. Section display names are derived by stripping the numeric prefix and converting hyphens to spaces. Output is namespaced: `dist/10-getting-started/10-intro.html`.
- **Course structure** is built in two passes: first the build reads all section folders and lesson files (both sorted by name) to establish order; then it renders each lesson with a sidebar and prev/next navigation injected via `{{sidebar}}` and `{{lesson-nav}}` placeholders in `template.html`. Cross-section links use relative `../` paths.
- **No external assets.** All CSS lives inline in `template.html`. Output files must be fully self-contained — no `<link>` or `<script src>` tags pointing outside the file.
- **Images, video, and PDFs** use image syntax in markdown — the build dispatches on file extension:
  - `![alt](assets/photo.jpg)` → `<img>`
  - `![caption](assets/lesson.mp4)` → `<video controls>`
  - `![Download Label](assets/file.pdf)` → styled `<a class="pdf-download" download>` button
- **Asset paths are rewritten by the build.** `assets/foo.jpg` in markdown becomes `../assets/foo.jpg` in the HTML output, reflecting that `assets/` sits one level above `dist/` in the deployed structure. Never copy assets into `dist/`.
- **`assets/` is deploy-only.** Files placed there locally are gitignored. Do not commit assets and do not reference them with absolute paths.
- **One dependency.** `marked` handles markdown parsing. Do not add further runtime dependencies without a strong reason.
- **ESM only.** `package.json` sets `"type": "module"`. Keep `build.js` using `import`/`export` syntax.

## Testing principles

**A test must be able to fail.**
Before accepting a test, ask: "what code change would make this fail?" If it's hard to answer, the test isn't testing what it claims. The `lastLesson` URL pointed to a mid-course lesson — the "last lesson has no next" test was silently passing for the wrong reason and wouldn't have caught a broken nav.

**Hardcoded fixtures must match reality.**
Any hardcoded path or value must be verifiably correct. If the lesson structure changes, audit fixture values. Prefer deriving dynamic boundaries (first lesson, last lesson) programmatically from the source structure rather than hardcoding them.

**Unit tests for logic; browser tests for rendered output.**
Functions in `lib/build-utils.js` get Node unit tests against return values. Whether CSS grid is applied, whether navigation links exist in the page — those need a real browser. Don't test layout in unit tests; don't test slug conversion via Playwright.

**Test behavior, not shape.**
Assert that the active link matches the current page slug, not that a specific HTML string appears. Behavior is the contract; implementation details change.

**One concern per test.**
A test that fails should tell you what broke, not just "something in navigation." Separate assertions into separate tests when they cover distinct behaviors.

**Test names are obligations.**
A test named "last lesson has no next anchor" creates a promise: the fixture URL must be the last lesson. When the name no longer describes the fixture, fix both.

**Test at the seams.**
The bug we fixed lived between `build.js` and the rendered output — unit tests passed because pure functions got ideal inputs; no test exercised the actual path the build wrote to disk. Seams between components (file I/O, template injection, cross-section linking) are where integration bugs hide.

**Test what you'd manually verify after a change.**
Whatever you'd click through or grep for to feel confident a change didn't break anything is a candidate for automation. If you wouldn't bother checking it, ask whether it matters.

**Bugs that happened once are worth a permanent test.**
Once a real failure occurs, add a test that would have caught it. Regressions are the highest-confidence signals that something is worth locking down.

**Don't test your dependencies.**
`marked` parses markdown correctly — that's its job. Test your code's behavior given their outputs, not the dependencies themselves.

**Test the contract, not every permutation.**
`lessonHref` has two meaningful cases: same section, cross-section. Three tests cover the contract. More variations of the same case add noise without catching new classes of bugs. Ask "what distinct behavior does this exercise?" — if the answer matches an existing test, skip it.

## What to avoid

- Do not write to `dist/` directly — it is always regenerated by the build.
- Do not add a dev server, watcher, or bundler unless the user explicitly asks.
- Do not modify `package-lock.json` by hand.
