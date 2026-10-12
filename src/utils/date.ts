/** Return "Today", "Yesterday", or a formatted date. */
export function relativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

/** Return time ago string for notifications etc. */
export function timeAgo(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return relativeDate(iso);
}

/** Format due date: "Due 15 Jan 2026" or "Due today" */
export function formatDueDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) return 'Due today';
  return `Due ${d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

/** Return recurring day label: "Every 5th", "Every 22nd", etc. */
export function formatRecurringDay(iso: string): string {
  const day = new Date(iso).getDate();
  const suffix =
    day >= 11 && day <= 13 ? 'th'
    : day % 10 === 1 ? 'st'
    : day % 10 === 2 ? 'nd'
    : day % 10 === 3 ? 'rd'
    : 'th';
  return `Every ${day}${suffix}`;
}

/** Return month/year label: "October 2026" */
export function monthYearLabel(period: string): string {
  const [year, month] = period.split('-');
  const d = new Date(parseInt(year), parseInt(month) - 1, 1);
  return d.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });
}

/** Return full date and time: "11 Oct 2026, 2:00 PM" */
export function formatFullDateTime(iso: string): string {
  const d = new Date(iso);
  const dateStr = d.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${dateStr}, ${timeStr}`;
}
