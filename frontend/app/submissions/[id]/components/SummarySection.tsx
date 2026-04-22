import { Box, Card, CardContent, Divider, Grid, Link as MuiLink, Typography } from '@mui/material';

import type { SubmissionDetail } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface SummarySectionProps {
  submission: SubmissionDetail;
}

export function SummarySection({ submission }: SummarySectionProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Company
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {submission.company.legalName}
            </Typography>
            {submission.company.industry && (
              <Typography variant="caption" color="text.secondary">
                {submission.company.industry}
              </Typography>
            )}
            {submission.company.headquartersCity && (
              <Typography variant="caption" display="block" color="text.secondary">
                {submission.company.headquartersCity}
              </Typography>
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Broker
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {submission.broker.name}
            </Typography>
            {submission.broker.primaryContactEmail && (
              <MuiLink
                href={`mailto:${submission.broker.primaryContactEmail}`}
                variant="caption"
                underline="hover"
              >
                {submission.broker.primaryContactEmail}
              </MuiLink>
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Owner
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {submission.owner.fullName}
            </Typography>
            <MuiLink
              href={`mailto:${submission.owner.email}`}
              variant="caption"
              underline="hover"
            >
              {submission.owner.email}
            </MuiLink>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Dates
            </Typography>
            <Typography variant="body2">Created: {formatDate(submission.createdAt)}</Typography>
            <Typography variant="body2">Updated: {formatDate(submission.updatedAt)}</Typography>
          </Grid>
        </Grid>

        {submission.summary && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
              {submission.summary}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
