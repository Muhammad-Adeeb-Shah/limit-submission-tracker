'use client';

import {
  Box,
  Card,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';

import { PAGE_SIZE } from '@/lib/constants';
import type { SubmissionListItem } from '@/lib/types';
import { formatShortDate } from '@/lib/utils';

import { PriorityChip } from './PriorityChip';
import { StatusChip } from './StatusChip';

const COLUMN_COUNT = 9;

interface SubmissionTableProps {
  submissions: SubmissionListItem[];
  totalCount: number;
  page: number;
  isLoading: boolean;
  isError: boolean;
  onPageChange: (newPage: number) => void;
}

export function SubmissionTable({
  submissions,
  totalCount,
  page,
  isLoading,
  isError,
  onPageChange,
}: SubmissionTableProps) {
  return (
    <Card variant="outlined">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Broker</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Docs
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Notes
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Latest Note</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Loading: show skeleton rows while the API call is in flight */}
            {isLoading && <SkeletonRows />}

            {/* Data: render one row per submission */}
            {!isLoading &&
              submissions.map((submission) => (
                <SubmissionRow key={submission.id} submission={submission} />
              ))}

            {/* Empty state: shown when filters produce zero results */}
            {!isLoading && submissions.length === 0 && !isError && <EmptyState />}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination — DRF uses 1-based pages, MUI uses 0-based, so we convert */}
      {totalCount > 0 && (
        <TablePagination
          component="div"
          count={totalCount}
          page={page - 1}
          rowsPerPage={PAGE_SIZE}
          rowsPerPageOptions={[PAGE_SIZE]}
          onPageChange={(_, zeroBasedPage) => onPageChange(zeroBasedPage + 1)}
        />
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Sub-components — kept in the same file since they're tightly coupled to
// the table and not reused elsewhere.
// ---------------------------------------------------------------------------

/** Single clickable row in the submissions table. */
function SubmissionRow({ submission }: { submission: SubmissionListItem }) {
  const router = useRouter();

  return (
    <TableRow
      hover
      onClick={() => router.push(`/submissions/${submission.id}`)}
      sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 0 } }}
    >
      {/* Company — primary identifier, shown bold with industry subtitle */}
      <TableCell>
        <Typography variant="body2" fontWeight={600}>
          {submission.company.legalName}
        </Typography>
        {submission.company.industry && (
          <Typography variant="caption" color="text.secondary">
            {submission.company.industry}
          </Typography>
        )}
      </TableCell>

      <TableCell>
        <Typography variant="body2">{submission.broker.name}</Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">{submission.owner.fullName}</Typography>
      </TableCell>

      {/* Status & Priority — color-coded chips for quick visual scanning */}
      <TableCell>
        <StatusChip status={submission.status} />
      </TableCell>
      <TableCell>
        <PriorityChip priority={submission.priority} />
      </TableCell>

      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {formatShortDate(submission.createdAt)}
        </Typography>
      </TableCell>

      {/* Doc/note counts — centered for visual clarity in the table */}
      <TableCell align="center">
        <Typography variant="body2">{submission.documentCount}</Typography>
      </TableCell>
      <TableCell align="center">
        <Typography variant="body2">{submission.noteCount}</Typography>
      </TableCell>

      {/* Latest note preview — truncated with tooltip for full text */}
      <TableCell sx={{ maxWidth: 220 }}>
        {submission.latestNote ? (
          <Tooltip title={submission.latestNote.bodyPreview} arrow>
            <Box>
              <Typography variant="caption" fontWeight={600}>
                {submission.latestNote.authorName}
              </Typography>
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {submission.latestNote.bodyPreview}
              </Typography>
            </Box>
          </Tooltip>
        ) : (
          <Typography variant="caption" color="text.disabled">
            —
          </Typography>
        )}
      </TableCell>
    </TableRow>
  );
}

/** Skeleton loading state — 5 rows to approximate a full page of data. */
function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={`skeleton-${i}`}>
          {Array.from({ length: COLUMN_COUNT }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton variant="text" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

/** Empty state — shown when the current filters return no results. */
function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={COLUMN_COUNT} sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No submissions found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your filters or clearing the search to see results.
        </Typography>
      </TableCell>
    </TableRow>
  );
}
