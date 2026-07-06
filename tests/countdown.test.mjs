import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateTimeLeft } from '../js/countdown.js';

test('returns zeroed values and ended=true when target is in the past', () => {
  const target = new Date('2026-09-13T00:00:00');
  const now = new Date('2026-09-14T00:00:00');
  assert.deepEqual(calculateTimeLeft(target, now), { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true });
});

test('computes exact days/hours/minutes/seconds remaining', () => {
  const target = new Date('2026-09-13T00:00:00');
  const now = new Date('2026-09-11T21:56:56');
  assert.deepEqual(calculateTimeLeft(target, now), { days: 1, hours: 2, minutes: 3, seconds: 4, ended: false });
});

test('rounds down to zero seconds right at the target instant', () => {
  const target = new Date('2026-09-13T00:00:00');
  assert.deepEqual(calculateTimeLeft(target, target), { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true });
});
