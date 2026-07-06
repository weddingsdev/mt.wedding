import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRsvp } from '../js/rsvp.js';

test('rejects empty name and missing attending choice', () => {
  const result = validateRsvp({ name: '', attending: '' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.name);
  assert.ok(result.errors.attending);
});

test('rejects whitespace-only name', () => {
  const result = validateRsvp({ name: '   ', attending: 'yes' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.name);
});

test('rejects an attending value that is not yes/no', () => {
  const result = validateRsvp({ name: 'Іван Іванов', attending: 'maybe' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.attending);
});

test('accepts a valid submission with attending=yes', () => {
  const result = validateRsvp({ name: 'Іван Іванов', attending: 'yes' });
  assert.deepEqual(result, { valid: true, errors: {} });
});

test('accepts a valid submission with attending=no', () => {
  const result = validateRsvp({ name: 'Іван Іванов', attending: 'no' });
  assert.deepEqual(result, { valid: true, errors: {} });
});
