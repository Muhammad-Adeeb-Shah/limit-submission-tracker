import {
  Card,
  CardContent,
  Chip,
  Divider,
  Link as MuiLink,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import type { Document } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface DocumentsSectionProps {
  documents: Document[];
}

export function DocumentsSection({ documents }: DocumentsSectionProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Documents ({documents.length})
        </Typography>
        <Divider sx={{ mb: 1 }} />

        {documents.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            No documents uploaded for this submission.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Uploaded</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Link</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.title}</TableCell>
                    <TableCell>
                      <Chip label={doc.docType} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(doc.uploadedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {doc.fileUrl ? (
                        <MuiLink
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          variant="body2"
                        >
                          View
                        </MuiLink>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          —
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}
