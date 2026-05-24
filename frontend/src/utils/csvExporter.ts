import { Booking } from '../types';

export const csvExporter = {
  exportBookings: (bookings: Booking[]): void => {
    if (bookings.length === 0) {
      alert('No bookings available to export.');
      return;
    }

    const headers = [
      'Reference Number',
      'Customer Name',
      'Phone Number',
      'Email',
      'Offer',
      'Date',
      'Time Slot',
      'Party Size',
      'Status',
      'Payment Status',
      'Waitlist Joined',
      'Created At',
    ];

    const rows = bookings.map((b) => [
      b.referenceNumber,
      b.customerName,
      b.phoneNumber,
      b.email || '',
      b.offerTitle || '',
      b.slotDateLabel || '',
      b.slotTimeLabel || '',
      b.peopleCount,
      b.status,
      b.paymentStatus,
      b.joinedWaitlist ? 'Yes' : 'No',
      new Date(b.createdAt).toLocaleString(),
    ]);

    // Construct CSV content string with quotes and escaped inner quotes
    const csvRows = [headers.join(',')];
    rows.forEach(row => {
      const escapedRow = row.map(val => {
        const text = String(val);
        // Replace inner quotes with double quotes
        return `"${text.replace(/"/g, '""')}"`;
      });
      csvRows.push(escapedRow.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `slotify_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
