import {
  Card,
  CardContent,
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

import type { Contact } from '@/lib/types';

interface ContactsSectionProps {
  contacts: Contact[];
}

export function ContactsSection({ contacts }: ContactsSectionProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Contacts ({contacts.length})
        </Typography>
        <Divider sx={{ mb: 1 }} />

        {contacts.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            No contacts on file for this submission.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {contact.role || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {contact.email ? (
                        <MuiLink href={`mailto:${contact.email}`} underline="hover" variant="body2">
                          {contact.email}
                        </MuiLink>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.phone ? (
                        <MuiLink href={`tel:${contact.phone}`} underline="hover" variant="body2">
                          {contact.phone}
                        </MuiLink>
                      ) : (
                        '—'
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
