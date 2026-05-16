import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sectionSlug } from '../lib/build-utils.js';

test('strips numeric prefix and lowercases', () => {
  assert.equal(sectionSlug('010 - Welcome'), 'welcome');
});

test('strips numeric prefix and hyphenates spaces', () => {
  assert.equal(sectionSlug('020 - The Five Minute Wardley Map'), 'the-five-minute-wardley-map');
});

test('no numeric prefix: lowercases and hyphenates', () => {
  assert.equal(sectionSlug('Getting Started'), 'getting-started');
});
