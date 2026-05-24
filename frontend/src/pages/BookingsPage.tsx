import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, CheckCircle, XCircle, UserX, CreditCard, 
  Clock, AlertTriangle, MessageSquare, QrCode, ClipboardList 
} from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { Booking, BookingStatus, PaymentStatus } from '../types';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

export const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // URL check-in parameter (e.g. ?checkin=SLT-9812A)
  const [searchParams, setSearchParams] = useSearchParams();
  const checkinRef = searchParams.get('checkin');

  // Scanner Simulator Modal
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [checkinInputRef, setCheckinInputRef] = useState('');
  const [scannedBooking, setScannedBooking] = useState<Booking | null>(null);
  const [checkinError, setCheckinError] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  // Process URL check-in ref on load
  useEffect(() => {
    if (checkinRef) {
      handleSearchByRef(checkinRef);
    }
  }, [checkinRef, bookings]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await apiClient.bookings.getAll();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByRef = async (ref: string) => {
    setCheckinError('');
    setScannedBooking(null);
    try {
      const result = await apiClient.bookings.getByReference(ref);
      setScannedBooking(result);
      setCheckinModalOpen(true);
      // Clean query params so it doesn't trigger again on reload
      setSearchParams({});
    } catch (err: any) {
      setCheckinError(err.message || 'Reference code not found.');
      setCheckinModalOpen(true);
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await apiClient.bookings.updateStatus(bookingId, newStatus);
      // If we checked in, also mark as Paid automatically
      if (newStatus === 'Completed') {
        await apiClient.bookings.updatePaymentStatus(bookingId, 'Paid');
      }
      setCheckinModalOpen(false);
      setScannedBooking(null);
      loadBookings();
    } catch (err: any) {
      alert(err.message || 'Error updating status.');
    }
  };

  const handleUpdatePayment = async (bookingId: string, paymentStatus: PaymentStatus) => {
    try {
      await apiClient.bookings.updatePaymentStatus(bookingId, paymentStatus);
      loadBookings();
      if (scannedBooking && scannedBooking.id === bookingId) {
        setScannedBooking(prev => prev ? { ...prev, paymentStatus } : null);
      }
    } catch (err: any) {
      alert(err.message || 'Error updating payment.');
    }
  };

  const filteredBookings = bookings.filter(b => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      b.referenceNumber.toLowerCase().includes(query) ||
      b.customerName.toLowerCase().includes(query) ||
      b.phoneNumber.includes(query) ||
      (b.email && b.email.toLowerCase().includes(query)) ||
      (b.offerTitle && b.offerTitle.toLowerCase().includes(query));

    const matchesStatus = 
      statusFilter === 'All' ||
      (statusFilter === 'Waitlist' && b.joinedWaitlist) ||
      (statusFilter === 'Confirmed' && !b.joinedWaitlist && b.status === 'Confirmed') ||
      (statusFilter === 'Completed' && b.status === 'Completed') ||
      (statusFilter === 'Cancelled' && b.status === 'Cancelled');

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-5">
        <div>
          <span className="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider">Guest Reservations</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Bookings & Waitlists</h1>
        </div>

        {/* Scan Simulator CTA */}
        <button
          onClick={() => {
            setScannedBooking(null);
            setCheckinError('');
            setCheckinInputRef('');
            setCheckinModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
        >
          <QrCode className="w-5 h-5" />
          Simulate QR Check-in
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {['All', 'Confirmed', 'Waitlist', 'Completed', 'Cancelled'].map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === filter
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-250/50 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800 dark:text-slate-350 text-slate-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search guest or reference code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input pl-10 py-2 text-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        </div>
      </div>

      {/* Bookings Grid */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/10 border border-slate-805 rounded-3xl">
          <ClipboardList className="w-12 h-12 text-slate-650 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No reservations match the filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((b) => (
            <GlassCard key={b.id} className="flex flex-col justify-between gap-4 p-5 rounded-2xl relative">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">{b.referenceNumber}</span>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 mt-0.5">{b.customerName}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={b.joinedWaitlist ? 'Waitlist' : b.status} />
                    <StatusBadge status={b.paymentStatus} />
                  </div>
                </div>

                <div className="text-xs space-y-1.5 text-slate-650 dark:text-slate-400 border-t border-slate-200/40 dark:border-slate-800/40 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Offer:</span>
                    <span className="font-semibold text-right">{b.offerTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Date/Time:</span>
                    <span className="font-semibold text-right">{b.slotDateLabel} | {b.slotTimeLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Party Size:</span>
                    <span className="font-semibold">{b.peopleCount} pax</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Contact:</span>
                    <span>{b.phoneNumber}</span>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex gap-2 border-t border-slate-200/40 dark:border-slate-800/40 pt-3 text-xs">
                {b.status === 'Pending' || b.status === 'Confirmed' ? (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'Completed')}
                      className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Check-in
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'Cancelled')}
                      className="flex-1 bg-rose-500/10 hover:bg-rose-500/25 text-rose-550 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                    {b.status === 'Confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'No Show')}
                        className="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                        title="Mark No Show"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-center w-full text-[10px] text-slate-500">Booking finalized.</span>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* CHECK-IN SIMULATOR MODAL */}
      <Modal
        isOpen={checkinModalOpen}
        onClose={() => {
          setCheckinModalOpen(false);
          setScannedBooking(null);
          setCheckinError('');
        }}
        title="Simulated QR Scanner Console"
        size="sm"
      >
        {!scannedBooking ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-normal">
              Enter a Reservation Reference code (e.g. SLT-A8B92) to simulate scanning a guest ticket at the front desk.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. SLT-A8B92"
                value={checkinInputRef}
                onChange={(e) => setCheckinInputRef(e.target.value.toUpperCase())}
                className="glass-input pl-4 text-sm font-bold uppercase tracking-wider"
              />
              <button
                type="button"
                onClick={() => handleSearchByRef(checkinInputRef)}
                className="bg-indigo-650 hover:bg-indigo-500 text-white font-bold px-4 rounded-xl text-xs cursor-pointer"
              >
                Scan
              </button>
            </div>
            {checkinError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold p-3.5 rounded-2xl flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{checkinError}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-200/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-xs space-y-2">
              <div className="flex justify-between font-bold border-b border-slate-200/40 dark:border-slate-850 pb-2">
                <span>Reference: {scannedBooking.referenceNumber}</span>
                <StatusBadge status={scannedBooking.joinedWaitlist ? 'Waitlist' : scannedBooking.status} />
              </div>
              <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{scannedBooking.customerName}</p>
              <p className="text-[11px] text-slate-500">Phone: {scannedBooking.phoneNumber}</p>
              <p className="font-bold mt-2">Offer Slot: {scannedBooking.offerTitle}</p>
              <p className="text-[11px] text-slate-500">{scannedBooking.slotDateLabel} | {scannedBooking.slotTimeLabel}</p>
              <p className="font-bold">Party Size: {scannedBooking.peopleCount} pax</p>
              <div className="flex justify-between items-center border-t border-slate-200/40 dark:border-slate-850 pt-2 mt-2">
                <span>Payment:</span>
                <span className="font-bold text-emerald-500 uppercase">{scannedBooking.paymentStatus}</span>
              </div>
            </div>

            {/* Action buttons inside checkin */}
            <div className="flex gap-3">
              {scannedBooking.status === 'Confirmed' || scannedBooking.status === 'Pending' ? (
                <>
                  <button
                    onClick={() => handleUpdateStatus(scannedBooking.id, 'Completed')}
                    className="flex-1 py-3 bg-gradient-primary rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-md cursor-pointer text-white"
                  >
                    <CheckCircle className="w-4 h-4" /> Check-in Guest
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(scannedBooking.id, 'Cancelled')}
                    className="flex-1 py-3 bg-rose-500/10 hover:bg-rose-500/25 text-rose-500 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" /> Reject/Cancel
                  </button>
                </>
              ) : (
                <div className="text-center w-full text-xs text-slate-500 font-semibold">
                  This booking has already been processed: <StatusBadge status={scannedBooking.status} />
                </div>
              )}
            </div>

            {/* Payment toggles */}
            {scannedBooking.paymentStatus === 'Pending' && (
              <button
                onClick={() => handleUpdatePayment(scannedBooking.id, 'Paid')}
                className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer border border-emerald-500/20"
              >
                <CreditCard className="w-4 h-4" /> Mark Payment as PAID
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
