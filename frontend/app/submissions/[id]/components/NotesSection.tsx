import { Box, Card, CardContent, Divider, Stack, Typography } from '@mui/material';

import type { NoteDetail } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface NotesSectionProps {
  notes: NoteDetail[];
}

export function NotesSection({ notes }: NotesSectionProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Notes ({notes.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {notes.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            No notes have been added to this submission.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {notes.map((note, index) => (
              <Box key={note.id}>
                <Box display="flex" justifyContent="space-between" alignItems="baseline">
                  <Typography variant="body2" fontWeight={600}>
                    {note.authorName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(note.createdAt)}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                  {note.body}
                </Typography>

                {index < notes.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
