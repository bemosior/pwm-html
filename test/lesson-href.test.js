import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lessonHref } from '../lib/build-utils.js';

test('same section returns slug.html', () => {
  assert.equal(lessonHref('welcome', 'welcome', 'introduction'), 'introduction.html');
});

test('cross-section returns ../toSection/slug.html', () => {
  assert.equal(lessonHref('welcome', 'advanced', 'deep-dive'), '../advanced/deep-dive.html');
});
