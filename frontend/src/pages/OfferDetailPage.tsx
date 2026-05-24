import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Tag, MapPin, Percent, Calendar, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { Offer, OfferSlot, Coupon } from '../types';
import { GlassCard } from '../components/GlassCard';
import { Modal } from '../components/Modal';
import { useCountdown } from '../hooks/useCountdown';
import { useForm } from 'react-hook-form';

interface BookingFormData {
  customerName: string;
  phoneNumber: string;
  email: string;
  peopleCount: number;
  specialNote: string;
}

export const OfferDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [offer, setOffer] = useState<Offer | null>(null);
  const [slots, setSlots] = useState<OfferSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<OfferSlot | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<BookingFormData>({
    defaultValues: {
      peopleCount: 1,
    }
  });

  const peopleCountWatch = watch('peopleCount', 1);

  // Fetch Offer details and Slots
  useEffect(() => {
    const loadDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const offerData = await apiClient.offers.getById(id);
        setOffer(offerData);
        
        const slotsData = await apiClient.slots.getByOfferId(id);
        setSlots(slotsData);
        
        // Auto-select first available slot if any
        const firstAvail = slotsData.find(s => s.status === 'Available');
        if (firstAvail) setSelectedSlot(firstAvail);
        else if (slotsData.length > 0) setSelectedSlot(slotsData[0]);
      } catch (err: any) {
        setError(err.message || 'Failed to load offer details.');
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id]);

  // Handle countdown (Offer End Date)
  const countdown = useCountdown(offer?.endDate || '', offer?.endTime);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !offer) return;
    setCouponLoading(true);
    setCouponError('');
    setAppliedCoupon(null);
    try {
      const subtotal = offer.offerPrice * peopleCountWatch;
      const coupon = await apiClient.coupons.validate(couponCode, subtotal);
      if (coupon) {
        setAppliedCoupon(coupon);
      } else {
        setCouponError('Invalid coupon code or minimum purchase amount not met.');
      }
    } catch (err: any) {
      setCouponError(err.message || 'Error validating coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Pricing calculation
  const originalSubtotal = offer ? offer.originalPrice * peopleCountWatch : 0;
  const offerSubtotal = offer ? offer.offerPrice * peopleCountWatch : 0;
  
  let discountAmount = 0;
  if (appliedCoupon && offer) {
    if (appliedCoupon.discountType === 'Percentage') {
      discountAmount = (offerSubtotal * appliedCoupon.value) / 100;
    } else {
      discountAmount = appliedCoupon.value;
    }
  }
  
  const finalTotal = Math.max(0, offerSubtotal - discountAmount);

  // Group slots by date
  const groupedSlots = slots.reduce((acc, slot) => {
    const date = slot.slotDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, OfferSlot[]>);

  const onSubmitBooking = async (data: BookingFormData) => {
    if (!selectedSlot) return;
    setBookingLoading(true);
    try {
      const payload = {
        slotId: selectedSlot.id,
        customerName: data.customerName,
        phoneNumber: data.phoneNumber,
        email: data.email || undefined,
        peopleCount: Number(data.peopleCount),
        specialNote: data.specialNote || undefined,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      };

      const result = await apiClient.bookings.create(payload);
      setBookingModalOpen(false);
      navigate(`/confirmation/${result.booking.id}`);
    } catch (err: any) {
      alert(err.message || 'Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="text-center py-16 space-y-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold">Offer Not Found</h2>
        <p className="text-slate-500 max-w-md mx-auto">{error || 'The offer you are looking for does not exist or has been removed.'}</p>
        <button onClick={() => navigate('/')} className="bg-gradient-primary px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 mx-auto">
          <ArrowLeft className="w-4 h-4" /> Back to Offers
        </button>
      </div>
    );
  }

  const isWaitlisted = selectedSlot && (selectedSlot.availableCount < peopleCountWatch || selectedSlot.status === 'Full');

  return (
    <div className="space-y-8">
      {/* Header Back Link */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-550 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 font-semibold transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" /> Back to active offers
      </button>

      {/* Banner */}
      <div className="relative h-64 md:h-96 w-full rounded-3xl overflow-hidden shadow-xl bg-slate-900">
        {offer.bannerImageUrl ? (
          <img
            src={offer.bannerImageUrl}
            alt={offer.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            <Tag className="w-20 h-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2 text-white">
            <span className="bg-indigo-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-md">
              {offer.category}
            </span>
            <h1 className="text-2xl md:text-4xl font-black">{offer.title}</h1>
          </div>
          <div className="bg-rose-600 text-white font-black text-sm px-4 py-2 rounded-xl flex items-center gap-1 shadow-lg max-w-fit">
            <Percent className="w-4 h-4" />
            {Math.round(offer.discountPercentage)}% SAVINGS
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side details */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-3">About this offer</h2>
              <p className="text-slate-650 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">{offer.description}</p>
            </div>

            <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-6">
              <h2 className="text-xl font-bold mb-3">Terms and Conditions</h2>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-650 dark:text-slate-400">
                {offer.termsAndConditions.split('. ').map((term, i) => (
                  term.trim() && <li key={i}>{term.trim()}</li>
                ))}
                <li>Valid for selected reservation time slots only.</li>
                <li>Ensure booking details match official identification.</li>
              </ul>
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
            <h2 className="text-xl font-bold">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-650 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-indigo-500 shrink-0" />
                <span>Apex Fitness & Spa, Metropolis</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-indigo-500 shrink-0" />
                <span>Open: {offer.startTime} - {offer.endTime}</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Side - booking panel */}
        <div className="space-y-6">
          {/* Urgency countdown indicator */}
          {!countdown.isExpired && (
            <div className="bg-gradient-to-r from-amber-600/10 to-orange-600/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
                <Clock className="w-5 h-5 animate-pulse-slow" />
                <span className="text-sm font-semibold">Limited time left</span>
              </div>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                {countdown.formatted}
              </span>
            </div>
          )}

          <GlassCard className="space-y-6">
            <h3 className="text-lg font-bold">1. Select Reservation Slot</h3>
            
            {Object.keys(groupedSlots).length === 0 ? (
              <p className="text-sm text-slate-400">No active slots available for this offer.</p>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {Object.entries(groupedSlots).map(([date, slotList]) => {
                  const displayDate = new Date(date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  });
                  return (
                    <div key={date} className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">{displayDate}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {slotList.map((slot) => {
                          const isFull = slot.status === 'Full' || slot.availableCount === 0;
                          const isSelected = selectedSlot?.id === slot.id;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`px-3 py-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                  : isFull
                                  ? 'bg-rose-500/5 border-rose-500/10 text-rose-500 hover:bg-rose-500/10'
                                  : 'bg-slate-200/50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800/80 text-slate-700 dark:text-slate-350 hover:border-indigo-500/40'
                              }`}
                            >
                              <span className="font-bold">{slot.startTime}</span>
                              <span className={`text-[10px] mt-0.5 opacity-80 ${isSelected ? 'text-white' : isFull ? 'text-rose-400' : 'text-slate-500'}`}>
                                {isFull ? 'Waitlist' : `${slot.availableCount} left`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedSlot && (
              <div className="space-y-4 border-t border-slate-200/40 dark:border-slate-800/40 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">2. Booking Summary</h3>
                  <div className="text-xs text-slate-500">
                    Max bookings: {offer.maxBookingPerCustomer}
                  </div>
                </div>

                {/* People Count input */}
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Number of People</label>
                  <input
                    type="number"
                    min="1"
                    max={offer.maxBookingPerCustomer}
                    value={peopleCountWatch}
                    onChange={(e) => {
                      const val = Math.min(offer.maxBookingPerCustomer, Math.max(1, Number(e.target.value)));
                      setValue('peopleCount', val);
                      // Clear coupon code to re-apply logic based on new total
                      setAppliedCoupon(null);
                    }}
                    className="glass-input text-center font-bold text-lg"
                  />
                </div>

                {/* Pricing Calculation breakdown */}
                <div className="space-y-2 text-sm text-slate-650 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Original Price ({peopleCountWatch} pax)</span>
                    <span className="line-through">${originalSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-emerald-500 font-semibold">
                    <span>Offer Subtotal</span>
                    <span>${offerSubtotal}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-indigo-500 font-semibold">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white border-t border-slate-200/20 dark:border-slate-800/40 pt-2">
                    <span>Estimated Total</span>
                    <span className="text-xl text-emerald-500">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Coupon Panel */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 block">Promo Code</label>
                  {appliedCoupon ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 flex items-center justify-between">
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Applied: {appliedCoupon.code}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-xs text-slate-400 hover:text-rose-500 font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. WELCOME10"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="glass-input flex-1 px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white text-xs font-semibold px-4 rounded-xl cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-xs text-rose-500 font-semibold">{couponError}</p>}
                </div>

                {/* Waitlist Warning Alert */}
                {isWaitlisted && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex gap-3 text-rose-600 dark:text-rose-400">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold">Waitlist Booking Required</h4>
                      <p className="text-xs mt-0.5">
                        This slot has insufficient capacity for your party. Confirming this booking will place you in the queue. You will be notified immediately if space becomes available.
                      </p>
                    </div>
                  </div>
                )}

                {/* Primary CTA */}
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(true)}
                  className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                    isWaitlisted
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 shadow-rose-500/20'
                      : 'bg-gradient-primary shadow-indigo-500/25'
                  }`}
                >
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  {isWaitlisted ? 'Join Booking Waitlist' : 'Reserve Offer Slot'}
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Booking Form Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={isWaitlisted ? 'Waitlist Reservation Details' : 'Reservation Details'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmitBooking)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-bold block">Your Full Name</label>
            <input
              type="text"
              placeholder="Sarah Jenkins"
              className="glass-input"
              {...register('customerName', { required: 'Full name is required' })}
            />
            {errors.customerName && <p className="text-xs text-rose-500 font-semibold">{errors.customerName.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-bold block">Mobile Phone Number</label>
            <input
              type="tel"
              placeholder="+1 (555) 987-6543"
              className="glass-input"
              {...register('phoneNumber', { required: 'Phone number is required' })}
            />
            {errors.phoneNumber && <p className="text-xs text-rose-500 font-semibold">{errors.phoneNumber.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-bold block">Email Address (Optional)</label>
            <input
              type="email"
              placeholder="sarah@example.com"
              className="glass-input"
              {...register('email')}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-bold block">Special Instructions / Dietary Requests</label>
            <textarea
              rows={2}
              placeholder="Add details, e.g. couples room preference"
              className="glass-input"
              {...register('specialNote')}
            />
          </div>

          <button
            type="submit"
            disabled={bookingLoading}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
              isWaitlisted ? 'bg-gradient-to-r from-rose-600 to-pink-650' : 'bg-gradient-primary'
            }`}
          >
            {bookingLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : isWaitlisted ? (
              'Confirm Waitlist Join'
            ) : (
              'Complete Free Booking'
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
};
