
export function normalizeToSlot(date: Date, intervalMinutes = 15): Date {
  const ms = 1000 * 60 * intervalMinutes;
  return new Date(Math.floor(date.getTime() / ms) * ms);
}

export function generateSlotTimes(
  startTime: Date,
  endTime: Date,
  intervalMinutes = 15,
  bufferMinutes = 0
): Date[] {
  const slots: Date[] = [];
  const startMs = normalizeToSlot(startTime, intervalMinutes).getTime();
  const effectiveEndMs = endTime.getTime() + bufferMinutes * 60 * 1000;
  const slotMs = intervalMinutes * 60 * 1000;

  for (let current = startMs; current < effectiveEndMs; current += slotMs) {
    slots.push(new Date(current));
  }

  return slots;
}

export function doIntervalsOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
}

export function getBillingPeriod(date: Date = new Date(), startDay = 1) {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth(); 

  const start = new Date(Date.UTC(year, month, Math.min(startDay, 28), 0, 0, 0, 0));
  
  const end = new Date(Date.UTC(year, month + 1, Math.min(startDay, 28), 0, 0, 0, 0));

  return {
    year,
    month: month + 1, 
    start,
    end
  };
}

export function durationInHours(startTime: Date, endTime: Date): number {
  const diffMs = endTime.getTime() - startTime.getTime();
  return Number((diffMs / (1000 * 60 * 60)).toFixed(2));
}
