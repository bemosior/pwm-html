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
# My Lesson

Content goes here.
```

Run `npm run build` and `dist/10-getting-started/10-intro.html` appears.

The lesson title is taken from the filename — `10-intro.md` becomes `Intro`. Add a `title:` front-matter field only if you need to override it:

```markdown
---
title: A Title the Filename Can't Express
---

# My Lesson
```

## Organizing lessons into sections

Sections are folders; lessons are files within them. The build generates a course sidebar and prev/next navigation on each page automatically.

- Section order follows folder name order. Use a numeric prefix (`10-getting-started/`, `20-advanced/`) to control sequence.
- Lesson order within a section follows filename order. Use a numeric prefix (`10-intro.md`, `20-next.md`).
- Use sparse numbering (10, 20, 30…) to leave room for insertions without renaming existing files.
- Section display names are derived from the folder name: the numeric prefix is stripped and hyphens become spaces (`20-the-five-minute-map` → `The Five Minute Map`).

To add a new section, just use a new section name — no other configuration needed.

## Embedding assets

Assets (images, video, PDFs) live in the `assets/` folder. They are never committed to the repo — drop them in locally or layer them in at deploy time. The build references them by path without copying.

When deployed, `assets/` sits at the repo root, two levels above lesson HTML files. The build rewrites `assets/` paths automatically.

```
web-root/
├── dist/
│   └── 10-getting-started/
│       └── 10-intro.html
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

## Deploying to Debian with Caddy

### One-time server setup

**Install Caddy:**

```sh
sudo apt update && sudo apt install caddy
```

**Create a deploy user:**

```sh
sudo useradd --system --no-create-home --shell /usr/sbin/nologin pwm-deploy
sudo chown -R pwm-deploy:pwm-deploy /var/www/pwm
sudo chmod -R 755 /var/www/pwm
```

The `caddy` service user only needs read access, which `755`/`644` provides.

**Configure Caddy** (`/etc/caddy/Caddyfile`):

```
yourdomain.com {
    handle_path /assets/* {
        root * /var/www/pwm/assets
        file_server
    }
    handle {
        root * /var/www/pwm/dist
        file_server
    }
}
```

```sh
sudo systemctl reload caddy
```

### Deploying

Build locally, then push `dist/` and `assets/` to the server as the deploy user:

```sh
npm run build

rsync -av --delete dist/ deploy@yourserver:/var/www/pwm/dist/
rsync -av --ignore-existing assets/ deploy@yourserver:/var/www/pwm/assets/
```

`--delete` on `dist/` removes stale lesson files when you rename or delete lessons. `--ignore-existing` on `assets/` avoids re-uploading large files that haven't changed — use `--checksum` instead if you need to force-update a specific asset in place.

To allow the deploy user to accept rsync over SSH without a password, add your public key to `/home/deploy/.ssh/authorized_keys` (or configure it via your CI system's secrets).

## Front-matter fields

Front-matter is optional. Add it only when overriding the default.

| Field | Default | Description |
|---|---|---|
| `title` | filename (prefix stripped) | Page title and `<title>` tag. |
