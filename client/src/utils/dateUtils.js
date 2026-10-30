export const formatNotificationTime = (dateInput, fallbackTime) => {
  if (!dateInput) {
    if (fallbackTime && fallbackTime !== 'Just now') return fallbackTime;
    return 'Recently';
  }

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    if (fallbackTime && fallbackTime !== 'Just now') return fallbackTime;
    return 'Recently';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);

  // If created within the last 60 seconds (or slight clock drift)
  if (diffSec < 60 && diffSec > -120) {
    return 'Just now';
  }

  // Under 60 minutes
  if (diffMin < 60 && diffMin >= 1) {
    return `${diffMin}m ago`;
  }

  const timeStr = date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Check if calendar day is today
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Today • ${timeStr}`;
  }

  // Check if calendar day is yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Yesterday • ${timeStr}`;
  }

  // If within the same calendar year
  const isSameYear = date.getFullYear() === now.getFullYear();
  const monthDay = date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });

  if (isSameYear) {
    return `${monthDay} • ${timeStr}`;
  }

  // Older / Different year
  const fullDate = date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${fullDate} • ${timeStr}`;
};

export const getFullNotificationTimestamp = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  try {
    return date.toLocaleString([], {
      dateStyle: 'full',
      timeStyle: 'medium',
    });
  } catch (e) {
    return date.toLocaleString();
  }
};

