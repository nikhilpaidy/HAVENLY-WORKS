import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/database/connection.js';
import { MeetingRoom } from '../src/modules/rooms/room.model.js';
import { Company } from '../src/modules/companies/company.model.js';
import { InventorySlot } from '../src/modules/inventory/inventory.model.js';
import { Booking } from '../src/modules/bookings/booking.model.js';
import { AllowancePeriod } from '../src/modules/allowances/allowance.model.js';

const app = createApp();
let authToken: string;
let roomId: string;
let companyId: string;

beforeAll(async () => {
  await connectDatabase();

  // Login as Coworking Admin
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'aptapace@gmail.com',
      password: 'Apta@2026'
    });

  authToken = loginRes.body.data.accessToken;

  const room = await MeetingRoom.findOne({ isActive: true });
  roomId = room!._id.toString();

  // Create temporary test company for concurrency run
  const testComp = await Company.findOneAndUpdate(
    { name: 'Concurrency Test Client Corp' },
    {
      organizationId: room!.organizationId,
      name: 'Concurrency Test Client Corp',
      slug: 'concurrency-test-client',
      allowanceConfig: {
        monthlyFreeHours: 50,
        extraHourRate: 40,
        currency: 'USD',
        resetDayOfMonth: 1
      },
      status: 'ACTIVE'
    },
    { upsert: true, new: true }
  );
  companyId = testComp._id.toString();

  // Initialize current allowance period ahead of concurrent booking race
  const { getOrCreateCurrentAllowance } = await import(
    '../src/modules/allowances/allowance.service.js'
  );
  await getOrCreateCurrentAllowance(testComp._id);
});

afterAll(async () => {
  await Company.deleteMany({ name: 'Concurrency Test Client Corp' });
  await AllowancePeriod.deleteMany({ companyId });
  await disconnectDatabase();
});

describe('Critical Concurrency Protection Tests', () => {
  it('guarantees that exactly one simultaneous booking succeeds for the same room and time', async () => {
    // Target date 15 days in the future
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 15);
    const start = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 14, 0, 0));
    const end = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 15, 0, 0));

    // Clean up any test slots from prior runs
    await InventorySlot.deleteMany({
      roomId,
      slotTime: { $gte: start, $lte: new Date(end.getTime() + 30 * 60 * 1000) }
    });
    await Booking.deleteMany({
      roomId,
      startTime: start
    });

    // Prepare 5 concurrent identical booking requests
    const attempts = Array.from({ length: 5 }).map((_, i) =>
      request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roomId,
          companyId,
          title: `Concurrent Attempt #${i + 1}`,
          attendeeCount: 4,
          startTime: start.toISOString(),
          endTime: end.toISOString()
        })
    );

    // Fire all concurrently
    const results = await Promise.all(attempts);

    const successCount = results.filter((r) => r.status === 201).length;
    const conflictCount = results.filter((r) => r.status === 409).length;

    // EXACTLY 1 MUST SUCCEED, 4 MUST BE 409 CONFLICT
    expect(successCount).toBe(1);
    expect(conflictCount).toBe(4);

    // Verify database state: inspect InventorySlot count for this slot
    const slots = await InventorySlot.find({
      roomId,
      slotTime: { $gte: start, $lt: end }
    });

    // 60 min duration / 15 min interval = 4 slots (plus 1 buffer slot = 5 slots total)
    // No duplicate slots should exist for the same room and time!
    const uniqueSlotTimes = new Set(slots.map((s) => s.slotTime.getTime()));
    expect(slots.length).toBe(uniqueSlotTimes.size);
  });
});
