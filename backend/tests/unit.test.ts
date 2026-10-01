import { describe, it, expect } from 'vitest';
import {
  generateSlotTimes,
  doIntervalsOverlap,
  normalizeToSlot,
  durationInHours
} from '../src/utils/date.js';

describe('Date & Slot Utilities', () => {
  it('normalizes timestamp to interval boundaries', () => {
    const d = new Date('2026-10-19T10:14:32.000Z');
    const normalized = normalizeToSlot(d, 15);
    expect(normalized.toISOString()).toBe('2026-10-19T10:00:00.000Z');

    const d2 = new Date('2026-10-19T10:15:00.000Z');
    const normalized2 = normalizeToSlot(d2, 15);
    expect(normalized2.toISOString()).toBe('2026-10-19T10:15:00.000Z');
  });

  it('generates exact normalized slots including buffer time', () => {
    const start = new Date('2026-10-19T10:00:00.000Z');
    const end = new Date('2026-10-19T11:00:00.000Z');
    // 60 mins duration + 15 min buffer = 75 mins total -> 5 slots (10:00, 10:15, 10:30, 10:45, 11:00)
    const slots = generateSlotTimes(start, end, 15, 15);
    expect(slots.length).toBe(5);
    expect(slots[0].toISOString()).toBe('2026-10-19T10:00:00.000Z');
    expect(slots[4].toISOString()).toBe('2026-10-19T11:00:00.000Z');
  });

  it('correctly detects half-open interval overlap [start, end)', () => {
    const startA = new Date('2026-10-19T10:00:00.000Z');
    const endA = new Date('2026-10-19T11:00:00.000Z');

    // Overlapping interval
    const startB = new Date('2026-10-19T10:30:00.000Z');
    const endB = new Date('2026-10-19T11:30:00.000Z');
    expect(doIntervalsOverlap(startA, endA, startB, endB)).toBe(true);

    // Contiguous / Adjacent interval ending exactly when next begins: NO overlap in [)
    const startC = new Date('2026-10-19T11:00:00.000Z');
    const endC = new Date('2026-10-19T12:00:00.000Z');
    expect(doIntervalsOverlap(startA, endA, startC, endC)).toBe(false);

    // Completely disjoint
    const startD = new Date('2026-10-19T14:00:00.000Z');
    const endD = new Date('2026-10-19T15:00:00.000Z');
    expect(doIntervalsOverlap(startA, endA, startD, endD)).toBe(false);
  });

  it('computes exact fractional duration in hours', () => {
    const start = new Date('2026-10-19T10:00:00.000Z');
    const end = new Date('2026-10-19T11:30:00.000Z');
    expect(durationInHours(start, end)).toBe(1.5);
  });
});
