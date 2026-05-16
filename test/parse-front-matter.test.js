import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontMatter } from '../lib/build-utils.js';

test('no front-matter returns empty meta and full src as body', () => {
  const src = '# Hello\n\nWorld';
  const { meta, body } = parseFrontMatter(src);
  assert.deepEqual(meta, {});
  assert.equal(body, src);
});

test('parses a single key-value pair', () => {
  const src = '---\ntitle: My Lesson\n---\nbody text';
  const { meta, body } = parseFrontMatter(src);
  assert.equal(meta.title, 'My Lesson');
  assert.equal(body, 'body text');
});

test('parses multiple key-value pairs', () => {
  const src = '---\ntitle: Intro\nauthor: Alice\n---\ncontent';
  const { meta } = parseFrontMatter(src);
  assert.equal(meta.title, 'Intro');
  assert.equal(meta.author, 'Alice');
});

test('handles value containing a colon', () => {
  const src = '---\nurl: https://example.com/path\n---\nbody';
  const { meta } = parseFrontMatter(src);
  assert.equal(meta.url, 'https://example.com/path');
});

test('body does not include the front-matter block', () => {
  const src = '---\ntitle: T\n---\nActual body';
  const { body } = parseFrontMatter(src);
  assert.equal(body, 'Actual body');
});

test('handles CRLF line endings', () => {
  const src = '---\r\ntitle: T\r\n---\r\nbody';
  const { meta, body } = parseFrontMatter(src);
  assert.equal(meta.title, 'T');
  assert.equal(body, 'body');
});
