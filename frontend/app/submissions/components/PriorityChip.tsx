import { Chip } from '@mui/material';

import { PRIORITY_COLORS } from '@/lib/constants';
import type { SubmissionPriority } from '@/lib/types';
import { capitalize } from '@/lib/utils';

interface PriorityChipProps {
  priority: SubmissionPriority;
}

export function PriorityChip({ priority }: PriorityChipProps) {
  return (
    <Chip
      label={capitalize(priority)}
      color={PRIORITY_COLORS[priority]}
      size="small"
      variant="filled"
      sx={{ fontWeight: 500 }}
    />
  );
}
