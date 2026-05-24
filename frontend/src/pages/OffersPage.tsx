import React, { useEffect, useState } from 'react';
import { 
  Tag, Calendar, Plus, Edit2, Trash2, Sparkles, DollarSign, 
  Clock, AlertTriangle, Eye, ShieldAlert, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { aiService } from '../services/aiService';
import { Offer, OfferSlot, Business, OfferStatus } from '../types';
import { GlassCard } from '../components/GlassCard';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { useForm } from 'react-hook-form';

interface OfferFormData {
  title: string;
  description: string;
  category: string;
  originalPrice: number;
  offerPrice: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  totalCapacity: number;
  maxBookingPerCustomer: number;
  termsAndConditions: string;
  bannerImageUrl: string;
  status: OfferStatus;
}

interface SlotFormData {
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
}

export const OffersPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Offer modal states
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [offerSaving, setOfferSaving] = useState(false);
  const [validationError, setValidationError] = useState('');

  // AI Description states
  const [aiDescLoading, setAiDescLoading] = useState(false);

  // AI Smart Pricing states
  const [pricingPanelOpen, setPricingPanelOpen] = useState(false);
  const [pricingSuggestions, setPricingSuggestions] = useState<any>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Slots management states
  const [slotsModalOpen, setSlotsModalOpen] = useState(false);
  const [selectedOfferForSlots, setSelectedOfferForSlots] = useState<Offer | null>(null);
  const [slots, setSlots] = useState<OfferSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotSaving, setSlotSaving] = useState(false);

  const { register, handleSubmit, setValue, getValues, watch, reset } = useForm<OfferFormData>();
  const { register: registerSlot, handleSubmit: handleSubmitSlot, reset: resetSlot } = useForm<SlotFormData>();

  const originalPriceWatch = watch('originalPrice');
  const titleWatch = watch('title');
  const categoryWatch = watch('category');

  useEffect(() => {
    loadOffersAndBusiness();
  }, []);

  const loadOffersAndBusiness = async () => {
    setLoading(true);
    try {
      const biz = await apiClient.business.get();
      setBusiness(biz);
      const data = await apiClient.offers.getAll();
      setOffers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingOffer(null);
    setValidationError('');
    setPricingSuggestions(null);
    setPricingPanelOpen(false);
    reset({
      title: '',
      description: '',
      category: 'Wellness',
      originalPrice: 100,
      offerPrice: 59,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '18:00',
      totalCapacity: 20,
      maxBookingPerCustomer: 2,
      termsAndConditions: '24-hour cancellation notice required. Non-refundable.',
      bannerImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80',
      status: 'Draft'
    });
    setOfferModalOpen(true);
  };

  const handleOpenEditModal = (offer: Offer) => {
    setEditingOffer(offer);
    setValidationError('');
    setPricingSuggestions(null);
    setPricingPanelOpen(false);
    reset({
      title: offer.title,
      description: offer.description,
      category: offer.category,
      originalPrice: offer.originalPrice,
      offerPrice: offer.offerPrice,
      startDate: offer.startDate,
      endDate: offer.endDate,
      startTime: offer.startTime,
      endTime: offer.endTime,
      totalCapacity: offer.totalCapacity,
      maxBookingPerCustomer: offer.maxBookingPerCustomer,
      termsAndConditions: offer.termsAndConditions,
      bannerImageUrl: offer.bannerImageUrl || '',
      status: offer.status
    });
    setOfferModalOpen(true);
  };

  const handleSaveOffer = async (data: OfferFormData) => {
    setValidationError('');
    
    // Business rules validation
    if (Number(data.offerPrice) >= Number(data.originalPrice)) {
      setValidationError('Offer price must be strictly less than the original price.');
      return;
    }

    setOfferSaving(true);
    try {
      if (editingOffer) {
        await apiClient.offers.update(editingOffer.id, {
          ...data,
          originalPrice: Number(data.originalPrice),
          offerPrice: Number(data.offerPrice),
          totalCapacity: Number(data.totalCapacity),
          maxBookingPerCustomer: Number(data.maxBookingPerCustomer)
        });
      } else {
        await apiClient.offers.create({
          ...data,
          businessId: business?.id || 'biz-slotify-uuid',
          originalPrice: Number(data.originalPrice),
          offerPrice: Number(data.offerPrice),
          totalCapacity: Number(data.totalCapacity),
          maxBookingPerCustomer: Number(data.maxBookingPerCustomer)
        });
      }
      setOfferModalOpen(false);
      loadOffersAndBusiness();
    } catch (err: any) {
      setValidationError(err.message || 'Error saving offer.');
    } finally {
      setOfferSaving(false);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this offer? All slots and bookings will be removed.')) return;
    try {
      await apiClient.offers.delete(id);
      loadOffersAndBusiness();
    } catch (err: any) {
      alert('Failed to delete offer: ' + err.message);
    }
  };

  // AI Description Generator trigger
  const handleGenerateDescription = async () => {
    const title = titleWatch || 'Special Experience';
    const category = categoryWatch || 'Wellness';
    const type = business?.type || 'Gym';

    setAiDescLoading(true);
    try {
      const generated = await aiService.generateOfferDescription(title, category, type);
      setValue('description', generated);
    } catch (err) {
      console.error(err);
    } finally {
      setAiDescLoading(false);
    }
  };

  // AI Pricing Suggestion trigger
  const handleFetchPricingSuggestions = async () => {
    const orig = Number(originalPriceWatch);
    if (!orig || orig <= 0) return;
    setPricingLoading(true);
    setPricingPanelOpen(true);
    try {
      const suggestions = await aiService.getSmartPricingSuggestions(orig, business?.type || 'Gym');
      setPricingSuggestions(suggestions);
    } catch (err) {
      console.error(err);
    } finally {
      setPricingLoading(false);
    }
  };

  const applyPricingTier = (price: number) => {
    setValue('offerPrice', price);
    setPricingPanelOpen(false);
  };

  // Slots Management triggers
  const handleManageSlots = async (offer: Offer) => {
    setSelectedOfferForSlots(offer);
    setSlotsModalOpen(true);
    loadSlots(offer.id);
    resetSlot({
      slotDate: new Date().toISOString().split('T')[0],
      startTime: offer.startTime,
      endTime: offer.endTime,
      capacity: Math.floor(offer.totalCapacity / 4) || 5
    });
  };

  const loadSlots = async (offerId: string) => {
    setSlotsLoading(true);
    try {
      const data = await apiClient.slots.getByOfferId(offerId);
      setSlots(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleCreateSlot = async (data: SlotFormData) => {
    if (!selectedOfferForSlots) return;
    setSlotSaving(true);
    try {
      await apiClient.slots.create({
        offerId: selectedOfferForSlots.id,
        slotDate: data.slotDate,
        startTime: data.startTime,
        endTime: data.endTime,
        capacity: Number(data.capacity),
        status: 'Available'
      });
      loadSlots(selectedOfferForSlots.id);
    } catch (err: any) {
      alert(err.message || 'Error creating slot.');
    } finally {
      setSlotSaving(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!window.confirm('Delete this slot? This will cancel bookings.')) return;
    try {
      await apiClient.slots.delete(slotId);
      if (selectedOfferForSlots) {
        loadSlots(selectedOfferForSlots.id);
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting slot.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40 pb-5">
        <div>
          <span className="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider">Campaign Settings</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Offers & Slots</h1>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-gradient-primary px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20 text-white"
        >
          <Plus className="w-5 h-5" />
          Create Offer
        </button>
      </div>

      {/* Offers List */}
      {offers.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/10 border border-slate-800 rounded-3xl p-6">
          <p className="text-slate-400">No campaigns launched yet. Click "Create Offer" to start.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((offer) => (
            <GlassCard key={offer.id} className="flex flex-col justify-between gap-6 p-6 rounded-3xl">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{offer.title}</h3>
                    <span className="text-xs text-slate-500">{offer.category}</span>
                  </div>
                  <StatusBadge status={offer.status} />
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{offer.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-655 dark:text-slate-400 border-t border-slate-200/40 dark:border-slate-800/40 pt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span>{offer.startDate} to {offer.endDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>{offer.startTime} - {offer.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <span>Offer Price: ${offer.offerPrice} (<s>${offer.originalPrice}</s>)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-500" />
                    <span>Capacity: {offer.totalCapacity} seats</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 border-t border-slate-200/40 dark:border-slate-800/40 pt-4">
                <button
                  onClick={() => handleManageSlots(offer)}
                  className="flex-1 bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-500 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  Manage Slots
                </button>
                <button
                  onClick={() => handleOpenEditModal(offer)}
                  className="p-2 bg-slate-200/50 hover:bg-slate-250 dark:bg-slate-900/60 dark:hover:bg-slate-800 border border-slate-250 dark:border-slate-800 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  title="Edit Offer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteOffer(offer.id)}
                  className="p-2 bg-rose-500/10 hover:bg-rose-550/20 rounded-xl text-rose-500 cursor-pointer"
                  title="Delete Offer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* CREATE/EDIT OFFER MODAL */}
      <Modal 
        isOpen={offerModalOpen} 
        onClose={() => setOfferModalOpen(false)} 
        title={editingOffer ? 'Edit Offer Campaign' : 'Create Offer Campaign'}
        size="lg"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Form */}
          <form onSubmit={handleSubmit(handleSaveOffer)} className="lg:col-span-2 space-y-4">
            {validationError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold p-3.5 rounded-2xl flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold block">Offer Title</label>
                <input type="text" placeholder="e.g. VIP Wellness Massage" className="glass-input" {...register('title', { required: true })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold block">Category</label>
                <select className="glass-input" {...register('category', { required: true })}>
                  <option value="Wellness">Wellness</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Dining">Dining</option>
                  <option value="Medical">Medical</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 relative">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-slate-500 font-bold block">Campaign Description</label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={aiDescLoading || !titleWatch}
                  className="text-xs text-indigo-500 dark:text-indigo-400 font-bold flex items-center gap-1 hover:underline disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  {aiDescLoading ? 'Writing Description...' : 'Generate with AI'}
                </button>
              </div>
              <textarea rows={4} placeholder="Write copy detailing features, inclusions, and experience..." className="glass-input text-xs" {...register('description', { required: true })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold block">Original Price ($)</label>
                <input 
                  type="number" 
                  className="glass-input" 
                  {...register('originalPrice', { required: true })} 
                  onBlur={handleFetchPricingSuggestions}
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-500 font-bold block">Offer Price ($)</label>
                  {originalPriceWatch > 0 && (
                    <button
                      type="button"
                      onClick={handleFetchPricingSuggestions}
                      className="text-[10px] text-indigo-500 font-bold hover:underline cursor-pointer"
                    >
                      AI Advice
                    </button>
                  )}
                </div>
                <input type="number" className="glass-input" {...register('offerPrice', { required: true })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold block">Start Date</label>
                <input type="date" className="glass-input" {...register('startDate', { required: true })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold block">End Date</label>
                <input type="date" className="glass-input" {...register('endDate', { required: true })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold block">Start Time</label>
                <input type="text" placeholder="HH:mm" className="glass-input" {...register('startTime', { required: true })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold block">End Time</label>
                <input type="text" placeholder="HH:mm" className="glass-input" {...register('endTime', { required: true })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold block">Max Capacity (Per Slot)</label>
                <input type="number" className="glass-input" {...register('totalCapacity', { required: true })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold block">Max Booking/Customer</label>
                <input type="number" className="glass-input" {...register('maxBookingPerCustomer', { required: true })} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold block">Terms and Conditions</label>
              <input type="text" placeholder="Cancellation policy, entry rules..." className="glass-input" {...register('termsAndConditions')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold block">Banner Image URL</label>
                <input type="text" className="glass-input" {...register('bannerImageUrl')} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold block">Campaign Status</label>
                <select className="glass-input" {...register('status', { required: true })}>
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={offerSaving}
              className="w-full py-3 bg-gradient-primary rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md text-white"
            >
              {offerSaving ? 'Saving Campaign...' : editingOffer ? 'Update Campaign' : 'Publish Offer'}
            </button>
          </form>

          {/* AI Smart Pricing Panel */}
          <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-slate-200/40 dark:border-slate-800/40 pt-6 lg:pt-0 lg:pl-6 space-y-4">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              AI Smart Pricing
            </h4>
            
            {pricingPanelOpen ? (
              pricingLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
                  <span className="text-xs text-slate-500">Evaluating demand indexes...</span>
                </div>
              ) : pricingSuggestions ? (
                <div className="space-y-4 text-xs">
                  <div className="bg-indigo-550/10 border border-indigo-500/20 rounded-xl p-3.5">
                    <span className="font-bold text-indigo-650 dark:text-indigo-400 block mb-1">Market Insight</span>
                    <p className="text-[11px] text-slate-655 dark:text-slate-400 leading-normal">{pricingSuggestions.marketInsight}</p>
                  </div>
                  <div className="space-y-2">
                    {pricingSuggestions.suggestions.map((sug: any, idx: number) => (
                      <div 
                        key={idx}
                        onClick={() => applyPricingTier(sug.price)}
                        className="border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/50 p-3 rounded-2xl cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/40 transition-colors space-y-1.5"
                      >
                        <div className="flex justify-between font-bold">
                          <span className="text-slate-800 dark:text-slate-350">{sug.tier}</span>
                          <span className="text-emerald-500">${sug.price}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">{sug.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            ) : (
              <p className="text-xs text-slate-400 leading-normal">
                Enter an **Original Price** to generate optimal booking rates based on business capacity patterns and market categories.
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* SLOTS SUBGRID MANAGEMENT MODAL */}
      <Modal
        isOpen={slotsModalOpen}
        onClose={() => setSlotsModalOpen(false)}
        title={selectedOfferForSlots ? `Slots for: ${selectedOfferForSlots.title}` : 'Manage Time Slots'}
        size="lg"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Slot Form */}
          <form onSubmit={handleSubmitSlot(handleCreateSlot)} className="lg:col-span-1 space-y-4">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">Create New Slot</h4>
            
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold block">Slot Date</label>
              <input type="date" className="glass-input" required {...registerSlot('slotDate')} />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold block">Start Time</label>
              <input type="text" placeholder="HH:mm" className="glass-input" required {...registerSlot('startTime')} />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold block">End Time</label>
              <input type="text" placeholder="HH:mm" className="glass-input" required {...registerSlot('endTime')} />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold block">Capacity (seats)</label>
              <input type="number" className="glass-input" required {...registerSlot('capacity')} />
            </div>

            <button
              type="submit"
              disabled={slotSaving}
              className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md text-xs"
            >
              {slotSaving ? 'Adding...' : 'Add Slot'}
            </button>
          </form>

          {/* Active Slots list */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">Active Slots</h4>
            
            {slotsLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
              </div>
            ) : slots.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">No slots created for this campaign yet. Use the form to configure slots.</p>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {slots.map((slot) => (
                  <div 
                    key={slot.id} 
                    className="flex items-center justify-between p-3 bg-slate-200/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-xs"
                  >
                    <div className="space-y-1">
                      <span className="font-bold block text-slate-900 dark:text-slate-100">
                        {new Date(slot.slotDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {slot.startTime} - {slot.endTime}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Booked: {slot.bookedCount} / {slot.capacity} seats ({slot.availableCount} remaining)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={slot.status} />
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 p-1.5 rounded-lg cursor-pointer"
                        title="Delete Slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
