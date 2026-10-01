/**
 * Centralized formatting helpers enforcing Indian Standard Time (IST - Asia/Kolkata)
 * and Indian Rupee (INR - ₹) formatting across all portals.
 */

export const IST_TIMEZONE = 'Asia/Kolkata';

export function formatDateIST(
  dateInput: string | number | Date | null | undefined,
  includeWeekday = false
): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
      timeZone: IST_TIMEZONE,
      weekday: includeWeekday ? 'short' : undefined,
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '—';
  }
}

export function formatTimeIST(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    const timeStr = d.toLocaleTimeString('en-IN', {
      timeZone: IST_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return `${timeStr} IST`;
  } catch {
    return '—';
  }
}

export function formatDateTimeIST(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    const datePart = d.toLocaleDateString('en-IN', {
      timeZone: IST_TIMEZONE,
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timePart = d.toLocaleTimeString('en-IN', {
      timeZone: IST_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return `${datePart}, ${timePart} IST`;
  } catch {
    return '—';
  }
}

export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'INR'
): string {
  const val = Number(amount || 0);
  if (currency === 'INR') {
    return `₹${val.toLocaleString('en-IN', {
      minimumFractionDigits: Number.isInteger(val) ? 0 : 2,
      maximumFractionDigits: 2
    })}`;
  }
  const symbolMap: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£'
  };
  const sym = symbolMap[currency] || `${currency} `;
  return `${sym}${val.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function getTodayDateStringIST(): string {
  const now = new Date();
  // Get date string in IST format YYYY-MM-DD
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(now);
}
