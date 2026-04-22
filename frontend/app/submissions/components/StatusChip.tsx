import { Chip } from '@mui/material';

import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants';
import type { SubmissionStatus } from '@/lib/types';

interface StatusChipProps {
  status: SubmissionStatus;
}

export function StatusChip({ status }: StatusChipProps) {
  return (
    <Chip
      label={STATUS_LABELS[status]}
      color={STATUS_COLORS[status]}
      size="small"
      variant="outlined"
    />
  );
}
