import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sectionDisplayName } from '../lib/build-utils.js';

test('strips numeric prefix', () => {
  assert.equal(sectionDisplayName('010 - Welcome'), 'Welcome');
});

test('replaces hyphens with spaces', () => {
  assert.equal(sectionDisplayName('20-getting-started'), 'Getting Started');
});

test('title-cases each word', () => {
  assert.equal(sectionDisplayName('30-advanced-topics'), 'Advanced Topics');
});

test('handles multi-word section name', () => {
  assert.equal(sectionDisplayName('020 - The Five Minute Wardley Map'), 'The Five Minute Wardley Map');
});

test('handles section with no numeric prefix', () => {
  assert.equal(sectionDisplayName('intro'), 'Intro');
});
