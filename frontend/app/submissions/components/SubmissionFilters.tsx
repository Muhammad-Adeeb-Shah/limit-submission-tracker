import { Card, CardContent, MenuItem, Stack, TextField } from '@mui/material';

import { STATUS_OPTIONS } from '@/lib/constants';
import type { Broker, SubmissionStatus } from '@/lib/types';

interface SubmissionFiltersProps {
  status: SubmissionStatus | '';
  brokerId: string;
  companyQuery: string;
  brokers: Broker[];
  onStatusChange: (value: string) => void;
  onBrokerChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
}

export function SubmissionFilters({
  status,
  brokerId,
  companyQuery,
  brokers,
  onStatusChange,
  onBrokerChange,
  onCompanyChange,
}: SubmissionFiltersProps) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            select
            label="Status"
            size="small"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value || 'all'} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Broker"
            size="small"
            value={brokerId}
            onChange={(e) => onBrokerChange(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All brokers</MenuItem>
            {brokers.map((broker) => (
              <MenuItem key={broker.id} value={String(broker.id)}>
                {broker.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Search company"
            size="small"
            placeholder="Type to search..."
            value={companyQuery}
            onChange={(e) => onCompanyChange(e.target.value)}
            sx={{ minWidth: 220 }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
