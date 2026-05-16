import { test } from 'node:test';
import assert from 'node:assert/strict';
import { titleFromFilename } from '../lib/build-utils.js';

test('strips numeric prefix and .md extension', () => {
  assert.equal(titleFromFilename('010 - Introduction.md'), 'Introduction');
});

test('no numeric prefix: strips only .md extension', () => {
  assert.equal(titleFromFilename('my-lesson.md'), 'my-lesson');
});
