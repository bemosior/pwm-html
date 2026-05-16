import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lessonSlug } from '../lib/build-utils.js';

test('strips numeric prefix and lowercases', () => {
  assert.equal(lessonSlug('010 - Introduction'), 'introduction');
});

test('strips numeric prefix and removes special characters', () => {
  // "030 - SC1. Purpose" → "sc1-purpose" (period removed)
  assert.equal(lessonSlug('030 - SC1. Purpose'), 'sc1-purpose');
});

test('no numeric prefix: lowercases and hyphenates spaces', () => {
  assert.equal(lessonSlug('my lesson'), 'my-lesson');
});
