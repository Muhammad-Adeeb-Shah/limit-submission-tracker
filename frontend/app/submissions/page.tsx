'use client';

import { Alert, Box, Container, IconButton, Stack, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useSubmissionsList } from '@/lib/hooks/useSubmissions';
import type { SubmissionStatus } from '@/lib/types';

import { SubmissionFilters } from './components/SubmissionFilters';
import { SubmissionTable } from './components/SubmissionTable';

export default function SubmissionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = (searchParams.get('status') as SubmissionStatus | null) ?? '';
  const brokerId = searchParams.get('broker_id') ?? '';
  const companyQuery = searchParams.get('company_search') ?? '';
  const page = parseInt(searchParams.get('page') ?? '1', 10);

  const debouncedCompanyQuery = useDebounce(companyQuery, 300);

  const filters = useMemo(
    () => ({
      status: status || undefined,
      brokerId: brokerId || undefined,
      companySearch: debouncedCompanyQuery || undefined,
      page,
    }),
    [status, brokerId, debouncedCompanyQuery, page],
  );

  const submissionsQuery = useSubmissionsList(filters);
  const brokerQuery = useBrokerOptions();

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      if (!('page' in updates)) {
        params.delete('page');
      }
      router.replace(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  const submissions = submissionsQuery.data?.results ?? [];
  const totalCount = submissionsQuery.data?.count ?? 0;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Submissions
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {totalCount > 0
              ? `${totalCount} submission${totalCount !== 1 ? 's' : ''} found`
              : 'Browse and filter broker submissions'}
          </Typography>
        </Box>

        <SubmissionFilters
          status={status}
          brokerId={brokerId}
          companyQuery={companyQuery}
          brokers={brokerQuery.data ?? []}
          onStatusChange={(v) => updateParams({ status: v })}
          onBrokerChange={(v) => updateParams({ broker_id: v })}
          onCompanyChange={(v) => updateParams({ company_search: v })}
        />

        {submissionsQuery.isError && (
          <Alert
            severity="error"
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => submissionsQuery.refetch()}
                aria-label="Retry"
              >
                ↻
              </IconButton>
            }
          >
            Failed to load submissions. Click retry or adjust your filters.
          </Alert>
        )}

        <SubmissionTable
          submissions={submissions}
          totalCount={totalCount}
          page={page}
          isLoading={submissionsQuery.isLoading}
          isError={submissionsQuery.isError}
          onPageChange={(newPage) => updateParams({ page: String(newPage) })}
        />
      </Stack>
    </Container>
  );
}
