import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderImage } from '../lib/build-utils.js';

test('jpg href renders an img tag', () => {
  const out = renderImage('photo.jpg', '', 'alt text');
  assert.ok(out.startsWith('<img '));
  assert.ok(out.includes('src="photo.jpg"'));
});

test('mp4 href renders a media-controller with a video element', () => {
  const out = renderImage('video.mp4', '', '');
  assert.ok(out.startsWith('<media-controller>'));
  assert.ok(out.includes('<video slot="media"'));
  assert.ok(out.includes('<media-control-bar>'));
});

test('mp4 video tag includes source child element', () => {
  const out = renderImage('clip.mp4', '', '');
  assert.ok(out.includes('<source src="clip.mp4" type="video/mp4">'));
});

test('pdf href renders an anchor with class pdf-download', () => {
  const out = renderImage('doc.pdf', '', 'Download');
  assert.ok(out.includes('class="pdf-download"'));
  assert.ok(out.startsWith('<a '));
});

test('pdf anchor has download attribute', () => {
  const out = renderImage('doc.pdf', '', 'Download');
  assert.ok(out.includes(' download'));
});

test('pdf uses alt text as label', () => {
  const out = renderImage('doc.pdf', '', 'My Report');
  assert.ok(out.includes('>My Report<'));
});

test('pdf with empty alt falls back to Download PDF', () => {
  const out = renderImage('doc.pdf', '', '');
  assert.ok(out.includes('>Download PDF<'));
});

test('assets/ prefix is rewritten to ../../assets/', () => {
  const out = renderImage('assets/photo.jpg', '', 'img');
  assert.ok(out.includes('src="../../assets/photo.jpg"'));
});

test('path not starting with assets/ is not rewritten', () => {
  const out = renderImage('http://example.com/img.jpg', '', 'img');
  assert.ok(out.includes('src="http://example.com/img.jpg"'));
});

test('null href returns an HTML comment', () => {
  const out = renderImage(null, '', 'missing');
  assert.ok(out.startsWith('<!--'));
});

test('assets/ rewrite works for mp4', () => {
  const out = renderImage('assets/clip.mp4', '', '');
  assert.ok(out.includes('src="../../assets/clip.mp4"'));
});

test('mp4 with assets/ prefix includes poster attribute', () => {
  const out = renderImage('assets/clip.mp4', '', '');
  assert.ok(out.includes('poster="../../assets/clip.jpg"'));
});

test('mp4 without assets/ prefix has no poster attribute', () => {
  const out = renderImage('clip.mp4', '', '');
  assert.ok(!out.includes('poster='));
});

test('assets/ rewrite works for pdf', () => {
  const out = renderImage('assets/doc.pdf', '', 'PDF');
  assert.ok(out.includes('href="../../assets/doc.pdf"'));
});
