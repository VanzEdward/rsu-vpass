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

/**
 * Format gate log and audit timestamps accurately based on actual date and time.
 * If today: "Today • 04:42 AM"
 * If yesterday: "Yesterday • 04:42 AM"
 * If another date: "Oct 29, 2026 • 04:42 AM"
 * Never resets to "Just now", never freezes static "Today" on past dates.
 */
export const formatLogTimestamp = (timestamp, fallbackDate, fallbackTime) => {
  let dateObj = null;

  if (timestamp) {
    const d = new Date(timestamp);
    if (!isNaN(d.getTime())) {
      dateObj = d;
    }
  }

  if (!dateObj && fallbackDate) {
    const cleanedDate = String(fallbackDate).replace(/Today|Yesterday/gi, '').trim();
    const cleanedTime = String(fallbackTime || '').replace(/Today|Yesterday/gi, '').trim();
    const combined = cleanedDate && cleanedTime ? `${cleanedDate} ${cleanedTime}` : cleanedDate;
    const d = new Date(combined);
    if (!isNaN(d.getTime())) {
      dateObj = d;
    }
  }

  if (!dateObj) {
    if (fallbackTime) {
      const cleanTime = String(fallbackTime).replace(/\s*Today\s*/gi, '').trim();
      return fallbackDate ? `${fallbackDate} • ${cleanTime}` : cleanTime;
    }
    return fallbackDate || 'N/A';
  }

  const now = new Date();
  const timeStr = dateObj.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const isToday =
    dateObj.getDate() === now.getDate() &&
    dateObj.getMonth() === now.getMonth() &&
    dateObj.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Today • ${timeStr}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Yesterday • ${timeStr}`;
  }

  const isCurrentYear = dateObj.getFullYear() === now.getFullYear();
  const dateStr = dateObj.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: isCurrentYear ? undefined : 'numeric',
  });

  return `${dateStr} • ${timeStr}`;
};

/**
 * Returns full exact ISO/human date-time for tooltip inspection.
 */
export const formatExactDateTime = (timestamp, fallbackDate, fallbackTime) => {
  let dateObj = null;

  if (timestamp) {
    const d = new Date(timestamp);
    if (!isNaN(d.getTime())) {
      dateObj = d;
    }
  }

  if (!dateObj && fallbackDate) {
    const cleanedDate = String(fallbackDate).replace(/Today|Yesterday/gi, '').trim();
    const cleanedTime = String(fallbackTime || '').replace(/Today|Yesterday/gi, '').trim();
    const combined = cleanedDate && cleanedTime ? `${cleanedDate} ${cleanedTime}` : cleanedDate;
    const d = new Date(combined);
    if (!isNaN(d.getTime())) {
      dateObj = d;
    }
  }

  if (!dateObj) {
    return fallbackDate && fallbackTime ? `${fallbackDate} ${fallbackTime}` : (fallbackDate || fallbackTime || '');
  }

  return dateObj.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};
