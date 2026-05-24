import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, AlertTriangle, ArrowLeft, Mail, Phone, Calendar, Clock, Ticket, MessageSquare } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { Booking, Offer, OfferSlot, NotificationLog } from '../types';
import { GlassCard } from '../components/GlassCard';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';

export const BookingConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [slot, setSlot] = useState<OfferSlot | null>(null);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBookingData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const b = await apiClient.bookings.getById(id);
        setBooking(b);

        const s = await apiClient.slots.getById(b.slotId);
        setSlot(s);

        const o = await apiClient.offers.getById(s.offerId);
        setOffer(o);

        // Fetch notifications logs
        const allLogs = await apiClient.notifications.getAll();
        setLogs(allLogs.filter(l => l.bookingId === id));

        // Generate QR code for check-in
        const checkinUrl = `${window.location.origin}/admin/bookings?checkin=${b.referenceNumber}`;
        const url = await QRCode.toDataURL(checkinUrl, {
          margin: 1,
          width: 200,
          color: {
            dark: '#1e1b4b', // Deep indigo
            light: '#ffffff'
          }
        });
        setQrCodeUrl(url);

        // Trigger confetti on successful confirmed booking
        if (!b.joinedWaitlist) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load confirmation details.');
      } finally {
        setLoading(false);
      }
    };
    loadBookingData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !booking || !offer || !slot) {
    return (
      <div className="text-center py-16 space-y-4">
        <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold">Booking Not Found</h2>
        <p className="text-slate-500">{error || 'Could not retrieve reservation details.'}</p>
        <button onClick={() => navigate('/')} className="bg-gradient-primary px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 mx-auto">
          <ArrowLeft className="w-4 h-4" /> Go Back Home
        </button>
      </div>
    );
  }

  const waitlisted = booking.joinedWaitlist;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Success banner */}
      <div className="text-center space-y-3">
        {waitlisted ? (
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 border border-amber-500/25 rounded-full flex items-center justify-center mx-auto shadow-md">
            <AlertTriangle className="w-8 h-8" />
          </div>
        ) : (
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle className="w-8 h-8" />
          </div>
        )}
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {waitlisted ? 'Waitlist Reservation Joined!' : 'Reservation Confirmed!'}
        </h2>
        <p className="text-sm text-slate-550 dark:text-slate-400">
          {waitlisted 
            ? 'Your slot request is on the waitlist. We will notify you immediately if a vacancy occurs.' 
            : 'Your slot is secured. Show the ticket below during check-in.'}
        </p>
      </div>

      {/* Ticket Details */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/20 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-xl">
        {/* Decorative ticket notch punches */}
        <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200/20 dark:border-slate-850 z-10" />
        <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200/20 dark:border-slate-850 z-10" />

        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">
              {offer.category}
            </span>
            <span className="font-mono font-bold text-sm">
              Ref: {booking.referenceNumber}
            </span>
          </div>
          <h3 className="text-lg font-bold mt-2">{offer.title}</h3>
        </div>

        {/* Ticket Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Metadata */}
          <div className="md:col-span-2 space-y-4 text-sm text-slate-700 dark:text-slate-350">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Date</span>
                  <span className="font-bold">{slot.slotDate}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Time Slot</span>
                  <span className="font-bold">{slot.startTime} - {slot.endTime}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/40 pt-4">
              <div>
                <span className="text-[10px] text-slate-500 block">Guest Details</span>
                <span className="font-bold block">{booking.customerName}</span>
                <span className="text-xs text-slate-500">{booking.phoneNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Party Size</span>
                <span className="font-bold block">{booking.peopleCount} {booking.peopleCount === 1 ? 'Person' : 'People'}</span>
                <span className="text-xs font-bold text-emerald-500">
                  {waitlisted ? 'Waitlist' : 'Confirmed'}
                </span>
              </div>
            </div>

            {booking.specialNote && (
              <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 text-xs">
                <span className="text-slate-550 block font-bold mb-0.5">Special Instructions:</span>
                <p className="italic text-slate-500">{booking.specialNote}</p>
              </div>
            )}
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800/40 pt-6 md:pt-0 md:pl-6 gap-2">
            {qrCodeUrl ? (
              <div className="p-2 bg-white rounded-2xl shadow-inner border border-slate-200">
                <img src={qrCodeUrl} alt="Booking Checkin QR" className="w-32 h-32 md:w-36 md:h-36" />
              </div>
            ) : (
              <div className="w-32 h-32 bg-slate-200 animate-pulse rounded-2xl" />
            )}
            <span className="text-[10px] text-slate-500 text-center flex items-center gap-1">
              <Ticket className="w-3 h-3 text-indigo-500" />
              Scan for Check-in
            </span>
          </div>
        </div>
      </div>

      {/* Mock Notification Tray Logs */}
      {logs.length > 0 && (
        <GlassCard className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-650 dark:text-indigo-400 font-bold border-b border-slate-200/40 dark:border-slate-800/40 pb-3">
            <MessageSquare className="w-5 h-5" />
            <h3>Notification Dispatch Logs (Simulated)</h3>
          </div>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="text-xs bg-slate-200/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-xl p-3 space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-indigo-600 dark:text-indigo-400">{log.type} Delivery ({log.destination})</span>
                  <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-650 dark:text-slate-350 italic">{log.message}</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold mt-1">
                  <CheckCircle className="w-3 h-3" /> Dispatched
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* CTAs */}
      <div className="flex gap-4">
        <Link
          to="/"
          className="flex-1 py-3 text-center rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-850 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Book another offer
        </Link>
      </div>
    </div>
  );
};
