/**
 * Accurate day calculation avoiding timezone drift.
 */
export function calculateDaysAgoNumber(dateString: string): number {
  if (!dateString || dateString === 'NA') return 0;
  const parts = dateString.split('-');
  if (parts.length !== 3) return 0;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return 0;

  const target = new Date(year, month, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = today.getTime() - target.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function formatDaysAgo(dateString: string): string {
  if (!dateString || dateString === 'NA') return '';
  const days = calculateDaysAgoNumber(dateString);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days > 1) return `${days} days ago`;
  if (days === -1) return 'Tomorrow';
  if (days < -1) return `In ${Math.abs(days)} days`;
  return 'Today';
}

export const US_STATES = [
  { code: 'GA', name: 'Georgia' },
  { code: 'AL', name: 'Alabama' },
  { code: 'FL', name: 'Florida' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'CA', name: 'California' },
  { code: 'NY', name: 'New York' },
  { code: 'IL', name: 'Illinois' },
  { code: 'OH', name: 'Ohio' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'CO', name: 'Colorado' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'Other', name: 'Other State / National' },
];
