import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lessonHref } from '../lib/build-utils.js';

test('same section returns slug.html', () => {
  assert.equal(lessonHref('10-welcome', '10-welcome', '010'), '010.html');
});

test('cross-section returns ../toSection/slug.html', () => {
  assert.equal(lessonHref('10-welcome', '20-advanced', '010'), '../20-advanced/010.html');
});

