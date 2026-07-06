import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateSeptemberCalendar } from '../js/calendar.js';

test('September 2026 has exactly 30 day entries', () => {
  const days = generateSeptemberCalendar(2026).filter((d) => d !== null);
  assert.equal(days.length, 30);
});

test('day 13 is marked as the wedding day and no other day is', () => {
  const days = generateSeptemberCalendar(2026).filter((d) => d !== null);
  const weddingDays = days.filter((d) => d.isWeddingDay);
  assert.equal(weddingDays.length, 1);
  assert.equal(weddingDays[0].day, 13);
});

test('grid is padded with leading nulls to align day 1 to its real Monday-first weekday', () => {
  // September 1, 2026 is a Tuesday (independently verified), so the Monday-first
  // grid needs exactly 1 leading blank (Mon) before day 1 lands on Tuesday.
  const grid = generateSeptemberCalendar(2026);
  let leading = 0;
  while (grid[leading] === null) leading++;
  assert.equal(leading, 1);
  assert.equal(grid[leading].day, 1);
});
