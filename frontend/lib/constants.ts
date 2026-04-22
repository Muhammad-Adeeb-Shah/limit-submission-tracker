import type { SubmissionPriority, SubmissionStatus } from '@/lib/types';

export const STATUS_COLORS: Record<SubmissionStatus, 'info' | 'warning' | 'success' | 'error'> = {
  new: 'info',
  in_review: 'warning',
  closed: 'success',
  lost: 'error',
};

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  new: 'New',
  in_review: 'In Review',
  closed: 'Closed',
  lost: 'Lost',
};

export const STATUS_OPTIONS: { label: string; value: SubmissionStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'New', value: 'new' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Closed', value: 'closed' },
  { label: 'Lost', value: 'lost' },
];

export const PRIORITY_COLORS: Record<SubmissionPriority, 'error' | 'warning' | 'success'> = {
  high: 'error',
  medium: 'warning',
  low: 'success',
};

export const PAGE_SIZE = 10;
