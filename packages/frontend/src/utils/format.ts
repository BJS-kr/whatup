/**
 * Simple formatting utilities
 */

// Date formatting
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString();
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString();
};

export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(date);
};

// Text formatting
export const truncateText = (text: string, length: number = 100): string => {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
};

export const capitalizeFirst = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const pluralize = (
  count: number,
  singular: string,
  plural?: string,
): string => {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + 's'}`;
};

// Number formatting
export const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Content status formatting
export const formatContentStatus = (
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED',
): string => {
  switch (status) {
    case 'PENDING':
      return 'Pending Review';
    case 'ACCEPTED':
      return 'Accepted';
    case 'REJECTED':
      return 'Rejected';
    default:
      return status;
  }
};

// Thread settings formatting
export const formatThreadSettings = (thread: {
  autoAccept: boolean;
  allowConsecutiveContribution: boolean;
  maxLength: number;
}): string => {
  const settings = [];

  if (thread.autoAccept) settings.push('Auto-accept');
  if (thread.allowConsecutiveContribution)
    settings.push('Consecutive posts allowed');
  if (thread.maxLength > 0) settings.push(`Max ${thread.maxLength} chars`);

  return settings.length > 0 ? settings.join(' • ') : 'Default settings';
};
