'use client';

import {
  Alert,
  Box,
  Container,
  IconButton,
  Link as MuiLink,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { useSubmissionDetail } from '@/lib/hooks/useSubmissions';

import { StatusChip } from '../components/StatusChip';
import { PriorityChip } from '../components/PriorityChip';
import { ContactsSection } from './components/ContactsSection';
import { DocumentsSection } from './components/DocumentsSection';
import { NotesSection } from './components/NotesSection';
import { SummarySection } from './components/SummarySection';

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const submissionId = params?.id ?? '';
  const detailQuery = useSubmissionDetail(submissionId);

  if (detailQuery.isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="rounded" height={200} />
          <Skeleton variant="rounded" height={150} />
          <Skeleton variant="rounded" height={150} />
        </Stack>
      </Container>
    );
  }

  if (detailQuery.isError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <IconButton color="inherit" size="small" onClick={() => detailQuery.refetch()}>
              ↻
            </IconButton>
          }
        >
          Failed to load submission details. Click retry to try again.
        </Alert>
        <Box sx={{ mt: 2 }}>
          <MuiLink component={Link} href="/submissions" underline="hover">
            ← Back to list
          </MuiLink>
        </Box>
      </Container>
    );
  }

  const submission = detailQuery.data;
  if (!submission) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <MuiLink component={Link} href="/submissions" underline="hover" variant="body2">
              ← Back to list
            </MuiLink>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
              {submission.company.legalName}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <StatusChip status={submission.status} />
              <PriorityChip priority={submission.priority} />
            </Stack>
          </Box>
        </Box>

        <SummarySection submission={submission} />
        <ContactsSection contacts={submission.contacts} />
        <DocumentsSection documents={submission.documents} />
        <NotesSection notes={submission.notes} />
      </Stack>
    </Container>
  );
}
