import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Tag, Calendar, Percent, Clock, Filter, SlidersHorizontal, 
  Trash2, MapPin, Sparkles, AlertCircle, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../api/apiClient';
import { useCountdown } from '../hooks/useCountdown';
import { Offer, OfferSlot, Business } from '../types';
import { GlassCard } from '../components/GlassCard';

// Simulated business details helper based on offer category
const getSimulatedBusiness = (category: string, defaultBusiness: Business | null) => {
  const bizName = defaultBusiness?.name || 'Apex Services';
  const bizType = defaultBusiness?.type || 'Other';
  
  switch (category.toLowerCase()) {
    case 'fitness':
      return { name: 'Apex Fitness Gym', type: 'Gym' };
    case 'wellness':
      return { name: 'Apex Spa & Treatment', type: 'Spa' };
    case 'dining':
      return { name: 'Apex Nourish Bistro', type: 'Restaurant' };
    case 'medical':
      return { name: 'Apex Health Clinic', type: 'Clinic' };
    case 'coaching':
      return { name: 'Apex Coaching Academy', type: 'Coaching' };
    case 'turf':
      return { name: 'Apex Sports Turf', type: 'Turf' };
    default:
      return { name: bizName, type: bizType };
  }
};

interface OfferCardProps {
  offer: Offer;
  slots: OfferSlot[];
  business: Business | null;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer, slots, business }) => {
  const countdown = useCountdown(offer.endDate, offer.endTime);
  const simBiz = getSimulatedBusiness(offer.category, business);

  // Compute capacity from slots
  const offerSlots = slots.filter(s => s.offerId === offer.id);
  const totalAvailableSeats = offerSlots.reduce((sum, s) => sum + s.availableCount, 0);
  const activeSlotsCount = offerSlots.filter(s => s.status === 'Available' && s.availableCount > 0).length;

  if (countdown.isExpired) {
    return null; // Filter out expired offers
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className="flex flex-col h-full overflow-hidden p-0 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 hover:border-indigo-500/40 hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 transition-all duration-300 group flex-1">
        {/* Banner image with overlays */}
        <div className="relative h-48 overflow-hidden bg-slate-200 dark:bg-slate-800">
          {offer.bannerImageUrl ? (
            <img
              src={offer.bannerImageUrl}
              alt={offer.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <Tag className="w-12 h-12" />
            </div>
          )}
          
          {/* Top Left: Category Badge */}
          <div className="absolute top-4 left-4 flex gap-1.5">
            <span className="bg-slate-900/80 backdrop-blur-md text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm border border-slate-700/30">
              {offer.category}
            </span>
          </div>

          {/* Top Right: Discount Badge */}
          <div className="absolute top-4 right-4 bg-rose-600 text-white font-extrabold text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-0.5 shadow-lg shadow-rose-500/20">
            <Percent className="w-3.5 h-3.5" />
            {Math.round(offer.discountPercentage)}% OFF
          </div>

          {/* Expiry Countdown Overlaid at the Bottom */}
          <div className="absolute bottom-3 left-4 right-4 bg-slate-950/80 backdrop-blur-md border border-slate-800/40 px-3 py-1.5 rounded-xl flex items-center justify-between text-xs text-amber-400 font-bold shadow-md">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>Time Left:</span>
            </div>
            <span className="font-mono tracking-wider">{countdown.formatted}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 flex flex-col justify-between flex-1 gap-5">
          <div className="space-y-3">
            {/* Business info */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              <span>{simBiz.name}</span>
              <span className="w-1 h-1 bg-slate-400 rounded-full" />
              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md font-bold text-slate-655 dark:text-slate-350">
                {simBiz.type}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
              {offer.title}
            </h3>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {offer.description}
            </p>
          </div>

          <div className="space-y-4 pt-3 border-t border-slate-200/40 dark:border-slate-800/40">
            {/* Slot details & capacity */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 dark:text-slate-500 font-semibold">Availability:</span>
              {totalAvailableSeats > 0 ? (
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg font-extrabold">
                  {activeSlotsCount} slots ({totalAvailableSeats} seats left)
                </span>
              ) : (
                <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-lg font-extrabold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Waitlist Open
                </span>
              )}
            </div>

            {/* Prices */}
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider">Original</span>
                <span className="text-sm text-slate-400 line-through font-semibold">${offer.originalPrice}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider">Flash Deal</span>
                <span className="text-2xl font-black text-emerald-500">${offer.offerPrice}</span>
              </div>
            </div>

            {/* Book Now Button */}
            <Link
              to={`/offer/${offer.id}`}
              className="w-full text-center py-3 rounded-xl bg-gradient-primary text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-indigo-500/30"
            >
              <Calendar className="w-4 h-4" />
              Book Now
            </Link>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export const LandingPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [slots, setSlots] = useState<OfferSlot[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedBizType, setSelectedBizType] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [availableOnly, setAvailableOnly] = useState(false);

  // Filter Option Lists
  const businessTypes = ['All', 'Gym', 'Spa', 'Restaurant', 'Clinic', 'Coaching', 'Turf', 'Salon', 'Other'];
  const categories = ['All', 'Fitness', 'Wellness', 'Dining', 'Medical', 'Other'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Load business details
      const bizData = await apiClient.business.get();
      setBusiness(bizData);

      // Load offers and slots
      const offersData = await apiClient.offers.getAll({ status: 'Active' });
      setOffers(offersData);

      const slotsData = await apiClient.slots.getAll();
      setSlots(slotsData);

      // Find the absolute maximum price to set slider upper bound
      if (offersData.length > 0) {
        const prices = offersData.map(o => o.offerPrice);
        setMaxPrice(Math.ceil(Math.max(...prices)));
      }
    } catch (err) {
      console.error('Failed to load landing page data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedBizType('All');
    setSelectedCategory('All');
    setSelectedDate('');
    setAvailableOnly(false);
    if (offers.length > 0) {
      const prices = offers.map(o => o.offerPrice);
      setMaxPrice(Math.ceil(Math.max(...prices)));
    } else {
      setMaxPrice(300);
    }
  };

  // Filtered List
  const filteredOffers = offers.filter(offer => {
    // 1. Expiry Check
    const targetTime = new Date(`${offer.endDate.split('T')[0]}T${offer.endTime}`).getTime();
    if (targetTime <= Date.now()) return false;

    // 2. Search query matching
    const matchesSearch = offer.title.toLowerCase().includes(search.toLowerCase()) ||
                          offer.description.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    // 3. Business Type matching (simulated)
    const simBiz = getSimulatedBusiness(offer.category, business);
    const matchesBizType = selectedBizType === 'All' || simBiz.type.toLowerCase() === selectedBizType.toLowerCase();
    if (!matchesBizType) return false;

    // 4. Category matching
    const matchesCategory = selectedCategory === 'All' || offer.category.toLowerCase() === selectedCategory.toLowerCase();
    if (!matchesCategory) return false;

    // 5. Date matching
    const offerSlots = slots.filter(s => s.offerId === offer.id);
    const matchesDate = !selectedDate || offerSlots.some(s => s.slotDate.startsWith(selectedDate));
    if (!matchesDate) return false;

    // 6. Max Price matching
    const matchesPrice = offer.offerPrice <= maxPrice;
    if (!matchesPrice) return false;

    // 7. Available Only matching
    const totalAvailableSeats = offerSlots.reduce((sum, s) => sum + s.availableCount, 0);
    const matchesAvailable = !availableOnly || totalAvailableSeats > 0;
    if (!matchesAvailable) return false;

    return true;
  });

  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <section className="text-center py-16 relative overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" />
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 font-sans text-slate-900 dark:text-slate-100">
          Smart Offer <span className="gradient-text font-black">Slot Booking</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-sans leading-relaxed">
          Book limited-time flash deals and reserve real-time discount slots from premium service-based businesses in your city.
        </p>
      </section>

      {/* Main Layout: Filters Panel + Offer Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Advanced Filters Sidebar */}
        <aside className="lg:col-span-1">
          <GlassCard className="p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/50 sticky top-24 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
              <h2 className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <SlidersHorizontal className="w-5 h-5 text-indigo-500" />
                Refine Deals
              </h2>
              <button 
                onClick={handleResetFilters}
                className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                title="Reset all filters"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>

            {/* Filter: Search Input */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold block">Keywords</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. massage, pass"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="glass-input pl-10 text-xs py-2.5"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Filter: Business Type */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold block">Business Type</label>
              <select
                value={selectedBizType}
                onChange={(e) => setSelectedBizType(e.target.value)}
                className="glass-input text-xs py-2.5 cursor-pointer"
              >
                {businessTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Filter: Category */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="glass-input text-xs py-2.5 cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Filter: Date Selector */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold block flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Availability Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="glass-input text-xs py-2.5 cursor-pointer"
              />
            </div>

            {/* Filter: Price Range */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold block">Max Price</label>
                <span className="font-bold text-emerald-500">${maxPrice}</span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>$0</span>
                <span>$300</span>
              </div>
            </div>

            {/* Filter: Available Only */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="availableOnly"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 rounded-md border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500/50 cursor-pointer"
              />
              <label htmlFor="availableOnly" className="text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer select-none">
                Show Available Only
              </label>
            </div>
          </GlassCard>
        </aside>

        {/* Right Side: Offers Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header count details */}
          <div className="flex justify-between items-center pb-2">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Showing {filteredOffers.length} of {offers.length} active campaigns
            </p>
            <button 
              onClick={fetchData}
              className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-900 rounded-xl text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer"
              title="Refresh deals feed"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="glass-card h-[380px] animate-pulse bg-slate-200/20 dark:bg-slate-900/20 rounded-3xl" />
              ))}
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="text-center py-24 bg-slate-900/10 border border-slate-200/20 dark:border-slate-800/50 rounded-3xl p-6">
              <AlertCircle className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">No Offers Found</h3>
              <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                No active deals match your filter adjustments. Try resetting your filters to browse all options.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-indigo-500/10 text-indigo-550 rounded-xl text-xs font-bold hover:bg-indigo-500/25 transition-all cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <motion.div 
              layout 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredOffers.map((offer) => (
                  <OfferCard 
                    key={offer.id} 
                    offer={offer} 
                    slots={slots} 
                    business={business} 
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
