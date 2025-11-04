// Formatting utilities

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return `$${amount.toFixed(2)}`;
};

export const formatDate = (date: Date, style: 'short' | 'long' = 'short'): string => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  const options: Intl.DateTimeFormatOptions =
    style === 'long'
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'short', day: 'numeric' };

  return new Intl.DateTimeFormat('en-US', options).format(date);
};

export const formatDateTime = (date: Date): string => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatNumber = (num: number, decimals = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const truncate = (text: string, length = 50): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};