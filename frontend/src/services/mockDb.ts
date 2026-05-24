import type { 
  User, Business, Offer, OfferSlot, Booking, 
  Coupon, NotificationLog, DashboardSummary, 
  BookingStatus, PaymentStatus 
} from '../types';

// Helper to generate unique short reference codes (e.g. SLT-XYZ12)
export const generateReferenceNumber = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'SLT-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Seed Data
const DEFAULT_USER: User = {
  id: 'user-admin-uuid',
  email: 'admin@slotify.ai',
  fullName: 'Alex Carter',
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
};

const DEFAULT_BUSINESS: Business = {
  id: 'biz-slotify-uuid',
  userId: 'user-admin-uuid',
  name: 'Apex Fitness & Spa',
  type: 'Gym',
  ownerName: 'Alex Carter',
  phone: '+1 (555) 234-5678',
  email: 'hello@apexfitness.com',
  address: '742 Evergreens Blvd, Suite 100',
  city: 'Metropolis',
  logoUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=120&auto=format&fit=crop&q=80',
  openingTime: '06:00',
  closingTime: '22:00',
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString()
};

const SEED_OFFERS: Offer[] = [
  {
    id: 'offer-1',
    businessId: 'biz-slotify-uuid',
    title: 'VIP Spa & Massage Package',
    description: 'Indulge in a premium 90-minute therapeutic massage session. Includes access to our heated pool, steam sauna, and complimentary organic green tea. Perfect for stress relief and deep muscle recovery.',
    category: 'Wellness',
    originalPrice: 150,
    offerPrice: 89,
    discountPercentage: 40.67,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '18:00',
    totalCapacity: 24,
    maxBookingPerCustomer: 2,
    termsAndConditions: 'Arrive 15 mins early. 24h cancellation policy. Coupon codes cannot be stacked.',
    bannerImageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
    status: 'Active',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'offer-2',
    businessId: 'biz-slotify-uuid',
    title: 'Unlimited Week Pass + Personal Trainer',
    description: 'Get full access to Apex Gym for 7 consecutive days, plus a 1-on-1 assessment session with our certified senior trainers to tailor your workout regime.',
    category: 'Fitness',
    originalPrice: 90,
    offerPrice: 39,
    discountPercentage: 56.67,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '06:00',
    endTime: '21:00',
    totalCapacity: 40,
    maxBookingPerCustomer: 1,
    termsAndConditions: 'First-time visitors only. Gym shoes mandatory. Trainer sessions must be pre-scheduled.',
    bannerImageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    status: 'Active',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'offer-3',
    businessId: 'biz-slotify-uuid',
    title: 'Gourmet Healthy Dinner for Two',
    description: 'Enjoy a healthy 3-course dinner curated by our head nutritionist and prepared by organic chefs. Includes appetizer, main dish, low-calorie dessert, and cold-press juice.',
    category: 'Dining',
    originalPrice: 120,
    offerPrice: 65,
    discountPercentage: 45.83,
    startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '17:00',
    endTime: '22:00',
    totalCapacity: 15,
    maxBookingPerCustomer: 3,
    termsAndConditions: 'Dine-in only. Valid only during dinner hours. Reservation slots are strictly binding.',
    bannerImageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80',
    status: 'Active',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'offer-4',
    businessId: 'biz-slotify-uuid',
    title: 'Sunset Rooftop Yoga Session',
    description: 'Re-center your mind and body with a guided Vinyasa yoga session on our premium rooftop garden as the sun sets. Mat and hydration bottles provided.',
    category: 'Fitness',
    originalPrice: 40,
    offerPrice: 19,
    discountPercentage: 52.5,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '19:30',
    totalCapacity: 30,
    maxBookingPerCustomer: 4,
    termsAndConditions: 'Weather permitting. Full refund or waitlist reschedule in case of rain. Mats sterilized.',
    bannerImageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper to generate slots for seeded offers
const generateSeededSlots = (): OfferSlot[] => {
  const slots: OfferSlot[] = [];
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Offer 1: Spa (VIP Spa Package)
  slots.push(
    {
      id: 'slot-1-1',
      offerId: 'offer-1',
      slotDate: today,
      startTime: '09:00',
      endTime: '10:30',
      capacity: 4,
      bookedCount: 3,
      availableCount: 1,
      status: 'Available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'slot-1-2',
      offerId: 'offer-1',
      slotDate: today,
      startTime: '11:00',
      endTime: '12:30',
      capacity: 4,
      bookedCount: 4,
      availableCount: 0,
      status: 'Full',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'slot-1-3',
      offerId: 'offer-1',
      slotDate: tomorrow,
      startTime: '14:00',
      endTime: '15:30',
      capacity: 6,
      bookedCount: 2,
      availableCount: 4,
      status: 'Available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'slot-1-4',
      offerId: 'offer-1',
      slotDate: tomorrow,
      startTime: '16:00',
      endTime: '17:30',
      capacity: 6,
      bookedCount: 0,
      availableCount: 6,
      status: 'Available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'slot-1-5',
      offerId: 'offer-1',
      slotDate: dayAfter,
      startTime: '10:00',
      endTime: '11:30',
      capacity: 4,
      bookedCount: 0,
      availableCount: 4,
      status: 'Available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );

  // Offer 2: Gym Pass
  slots.push(
    {
      id: 'slot-2-1',
      offerId: 'offer-2',
      slotDate: today,
      startTime: '07:00',
      endTime: '09:00',
      capacity: 10,
      bookedCount: 8,
      availableCount: 2,
      status: 'Available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'slot-2-2',
      offerId: 'offer-2',
      slotDate: tomorrow,
      startTime: '09:00',
      endTime: '11:00',
      capacity: 15,
      bookedCount: 15,
      availableCount: 0,
      status: 'Full',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'slot-2-3',
      offerId: 'offer-2',
      slotDate: tomorrow,
      startTime: '17:00',
      endTime: '19:00',
      capacity: 15,
      bookedCount: 5,
      availableCount: 10,
      status: 'Available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );

  // Offer 3: Dining (Gourmet Dinner)
  slots.push(
    {
      id: 'slot-3-1',
      offerId: 'offer-3',
      slotDate: today,
      startTime: '18:00',
      endTime: '20:00',
      capacity: 5,
      bookedCount: 4,
      availableCount: 1,
      status: 'Available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'slot-3-2',
      offerId: 'offer-3',
      slotDate: tomorrow,
      startTime: '20:00',
      endTime: '22:00',
      capacity: 5,
      bookedCount: 2,
      availableCount: 3,
      status: 'Available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'slot-3-3',
      offerId: 'offer-3',
      slotDate: dayAfter,
      startTime: '19:00',
      endTime: '21:00',
      capacity: 5,
      bookedCount: 0,
      availableCount: 5,
      status: 'Available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );

  // Offer 4: Sunset Yoga
  slots.push(
    {
      id: 'slot-4-1',
      offerId: 'offer-4',
      slotDate: today,
      startTime: '18:00',
      endTime: '19:30',
      capacity: 15,
      bookedCount: 15,
      availableCount: 0,
      status: 'Full',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'slot-4-2',
      offerId: 'offer-4',
      slotDate: tomorrow,
      startTime: '18:00',
      endTime: '19:30',
      capacity: 15,
      bookedCount: 6,
      availableCount: 9,
      status: 'Available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );

  return slots;
};

const SEED_BOOKINGS: Booking[] = [
  {
    id: 'booking-1',
    slotId: 'slot-1-1',
    referenceNumber: 'SLT-A8B92',
    customerName: 'Sarah Jenkins',
    phoneNumber: '+1 (555) 987-6543',
    email: 'sarah.j@example.com',
    peopleCount: 1,
    specialNote: 'Prefers deep tissue focus. Need extra towels.',
    status: 'Confirmed',
    paymentStatus: 'Paid',
    joinedWaitlist: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'booking-2',
    slotId: 'slot-1-1',
    referenceNumber: 'SLT-F238A',
    customerName: 'David Miller',
    phoneNumber: '+1 (555) 456-7890',
    email: 'davidm@example.com',
    peopleCount: 2,
    specialNote: 'Couples massage session, celebrating anniversary.',
    status: 'Confirmed',
    paymentStatus: 'Paid',
    couponCode: 'SAVE10',
    joinedWaitlist: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'booking-3',
    slotId: 'slot-2-1',
    referenceNumber: 'SLT-H91K4',
    customerName: 'Emma Stone',
    phoneNumber: '+1 (555) 789-0123',
    email: 'emma.stone@example.com',
    peopleCount: 1,
    status: 'Confirmed',
    paymentStatus: 'Pending',
    joinedWaitlist: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'booking-4',
    slotId: 'slot-1-2', // Full slot
    referenceNumber: 'SLT-W981A',
    customerName: 'James Wilson',
    phoneNumber: '+1 (555) 321-6549',
    email: 'jwilson@example.com',
    peopleCount: 1,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    joinedWaitlist: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'booking-5',
    slotId: 'slot-1-2', // Waitlisted booking (simulated)
    referenceNumber: 'SLT-WAIT1',
    customerName: 'Clara Oswald',
    phoneNumber: '+1 (555) 852-9630',
    email: 'clara@example.com',
    peopleCount: 1,
    status: 'Pending',
    paymentStatus: 'Pending',
    joinedWaitlist: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_COUPONS: Coupon[] = [
  { code: 'WELCOME10', discountType: 'Percentage', value: 10, isActive: true },
  { code: 'SAVE15', discountType: 'Percentage', value: 15, isActive: true },
  { code: 'FLAT20', discountType: 'FixedAmount', value: 20, isActive: true, minBookingValue: 80 }
];

// Initialize Storage if empty
export const initMockDb = () => {
  if (!localStorage.getItem('slotify_users')) {
    localStorage.setItem('slotify_users', JSON.stringify([DEFAULT_USER]));
  }
  if (!localStorage.getItem('slotify_business')) {
    localStorage.setItem('slotify_business', JSON.stringify(DEFAULT_BUSINESS));
  }
  if (!localStorage.getItem('slotify_offers')) {
    localStorage.setItem('slotify_offers', JSON.stringify(SEED_OFFERS));
  }
  if (!localStorage.getItem('slotify_slots')) {
    localStorage.setItem('slotify_slots', JSON.stringify(generateSeededSlots()));
  }
  if (!localStorage.getItem('slotify_bookings')) {
    localStorage.setItem('slotify_bookings', JSON.stringify(SEED_BOOKINGS));
  }
  if (!localStorage.getItem('slotify_coupons')) {
    localStorage.setItem('slotify_coupons', JSON.stringify(SEED_COUPONS));
  }
  if (!localStorage.getItem('slotify_notifications')) {
    localStorage.setItem('slotify_notifications', JSON.stringify([]));
  }
};

// Generic LocalStorage Accessors
const getCollection = <T>(key: string): T[] => {
  initMockDb();
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveCollection = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Database APIs
export const mockDb = {
  // Authentication
  login: (email: string, password: string): { token: string; user: User } | null => {
    const users = getCollection<User>('slotify_users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // Simulating match (in mock, password matching is Admin123!)
    if (user && password === 'Admin123!') {
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(user))}.signature`;
      return { token: mockToken, user };
    }
    return null;
  },

  // Business Profile
  getBusiness: (): Business => {
    initMockDb();
    return JSON.parse(localStorage.getItem('slotify_business') || '{}');
  },
  saveBusiness: (business: Business): Business => {
    business.updatedAt = new Date().toISOString();
    localStorage.setItem('slotify_business', JSON.stringify(business));
    return business;
  },

  // Offers
  getOffers: (): Offer[] => {
    return getCollection<Offer>('slotify_offers');
  },
  getOffer: (id: string): Offer | undefined => {
    return getCollection<Offer>('slotify_offers').find(o => o.id === id);
  },
  saveOffer: (offer: Offer): Offer => {
    const offers = getCollection<Offer>('slotify_offers');
    const existingIdx = offers.findIndex(o => o.id === offer.id);
    
    // Auto-calculate discount
    offer.discountPercentage = parseFloat(
      (((offer.originalPrice - offer.offerPrice) / offer.originalPrice) * 100).toFixed(2)
    );
    offer.updatedAt = new Date().toISOString();

    if (existingIdx > -1) {
      offers[existingIdx] = offer;
    } else {
      offer.createdAt = new Date().toISOString();
      offers.unshift(offer); // Newest first
    }
    saveCollection('slotify_offers', offers);
    return offer;
  },
  deleteOffer: (id: string): boolean => {
    const offers = getCollection<Offer>('slotify_offers');
    const filtered = offers.filter(o => o.id !== id);
    if (filtered.length === offers.length) return false;
    
    saveCollection('slotify_offers', filtered);
    
    // Cascade delete slots and cancel bookings
    const slots = getCollection<OfferSlot>('slotify_slots');
    const slotsToKeep = slots.filter(s => s.offerId !== id);
    saveCollection('slotify_slots', slotsToKeep);
    
    return true;
  },

  // Slots
  getSlots: (): OfferSlot[] => {
    return getCollection<OfferSlot>('slotify_slots');
  },
  getSlotsForOffer: (offerId: string): OfferSlot[] => {
    return getCollection<OfferSlot>('slotify_slots')
      .filter(s => s.offerId === offerId)
      .sort((a, b) => {
        // Sort by Date, then by Time
        const dateCompare = a.slotDate.localeCompare(b.slotDate);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });
  },
  getSlot: (id: string): OfferSlot | undefined => {
    return getCollection<OfferSlot>('slotify_slots').find(s => s.id === id);
  },
  saveSlot: (slot: OfferSlot): OfferSlot => {
    const slots = getCollection<OfferSlot>('slotify_slots');
    const existingIdx = slots.findIndex(s => s.id === slot.id);
    
    // Auto calculate Available Count
    slot.availableCount = Math.max(0, slot.capacity - slot.bookedCount);
    if (slot.availableCount === 0 && slot.capacity > 0) {
      slot.status = 'Full';
    } else if (slot.status === 'Full' && slot.availableCount > 0) {
      slot.status = 'Available';
    }
    slot.updatedAt = new Date().toISOString();

    if (existingIdx > -1) {
      slots[existingIdx] = slot;
    } else {
      slot.createdAt = new Date().toISOString();
      slots.push(slot);
    }
    saveCollection('slotify_slots', slots);
    return slot;
  },
  deleteSlot: (id: string): boolean => {
    const slots = getCollection<OfferSlot>('slotify_slots');
    const filtered = slots.filter(s => s.id !== id);
    if (filtered.length === slots.length) return false;
    saveCollection('slotify_slots', filtered);
    return true;
  },

  // Bookings
  getBookings: (): Booking[] => {
    const bookings = getCollection<Booking>('slotify_bookings');
    const offers = getCollection<Offer>('slotify_offers');
    const slots = getCollection<OfferSlot>('slotify_slots');

    // Enrich booking data for admin grids
    return bookings.map(b => {
      const slot = slots.find(s => s.id === b.slotId);
      const offer = slot ? offers.find(o => o.id === slot.offerId) : undefined;
      return {
        ...b,
        offerTitle: offer ? offer.title : 'Deleted Offer',
        slotDateLabel: slot ? slot.slotDate : 'N/A',
        slotTimeLabel: slot ? `${slot.startTime} - ${slot.endTime}` : 'N/A'
      };
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  getBooking: (id: string): Booking | undefined => {
    return getCollection<Booking>('slotify_bookings').find(b => b.id === id);
  },
  getBookingByReference: (ref: string): Booking | undefined => {
    return getCollection<Booking>('slotify_bookings').find(
      b => b.referenceNumber.toUpperCase() === ref.toUpperCase()
    );
  },
  saveBooking: (booking: Booking): { booking: Booking; waitlisted: boolean } => {
    const bookings = getCollection<Booking>('slotify_bookings');
    const slots = getCollection<OfferSlot>('slotify_slots');
    const slotIdx = slots.findIndex(s => s.id === booking.slotId);
    
    if (slotIdx === -1) {
      throw new Error('Slot does not exist');
    }

    const slot = slots[slotIdx];
    let waitlisted = false;

    // Check if slot has capacity
    if (slot.availableCount < booking.peopleCount || slot.status === 'Full' || slot.status === 'Closed') {
      // Slot is full: automatically place on waitlist
      booking.joinedWaitlist = true;
      booking.status = 'Pending'; // Pending confirmation from waitlist
      booking.paymentStatus = 'Pending';
      waitlisted = true;
    } else {
      // Book seats
      booking.joinedWaitlist = false;
      booking.status = 'Confirmed';
      slot.bookedCount += booking.peopleCount;
      slot.availableCount = slot.capacity - slot.bookedCount;
      if (slot.availableCount <= 0) {
        slot.status = 'Full';
      }
      slots[slotIdx] = slot;
      saveCollection('slotify_slots', slots);
    }

    booking.createdAt = new Date().toISOString();
    booking.updatedAt = new Date().toISOString();
    bookings.push(booking);
    saveCollection('slotify_bookings', bookings);

    // Mock sending notification log
    const biz = mockDb.getBusiness();
    const offer = mockDb.getOffers().find(o => o.id === slot.offerId);
    const timeLabel = `${slot.startTime} - ${slot.endTime}`;
    
    const notificationMsg = waitlisted
      ? `Hi ${booking.customerName}, you have successfully joined the Waitlist for '${offer?.title}' at ${biz.name} for ${booking.slotDateLabel} at ${timeLabel}. Reference: ${booking.referenceNumber}.`
      : `Hi ${booking.customerName}, your booking is CONFIRMED for '${offer?.title}' at ${biz.name} on ${slot.slotDate} at ${timeLabel}. People: ${booking.peopleCount}. Reference: ${booking.referenceNumber}.`;
    
    mockDb.logNotification(booking.id, 'SMS', booking.phoneNumber, notificationMsg);
    if (booking.email) {
      mockDb.logNotification(booking.id, 'Email', booking.email, notificationMsg);
    }

    return { booking, waitlisted };
  },
  
  updateBookingStatus: (id: string, status: BookingStatus): Booking => {
    const bookings = getCollection<Booking>('slotify_bookings');
    const bookingIdx = bookings.findIndex(b => b.id === id);
    if (bookingIdx === -1) throw new Error('Booking not found');

    const booking = bookings[bookingIdx];
    const prevStatus = booking.status;
    booking.status = status;
    booking.updatedAt = new Date().toISOString();

    const slots = getCollection<OfferSlot>('slotify_slots');
    const slotIdx = slots.findIndex(s => s.id === booking.slotId);

    if (slotIdx > -1) {
      const slot = slots[slotIdx];
      // If booking was confirmed/pending but is now cancelled/no-show, release capacity
      const wasHoldingSeat = (prevStatus === 'Confirmed' || (prevStatus === 'Pending' && !booking.joinedWaitlist));
      const nowHoldingSeat = (status === 'Confirmed' || (status === 'Pending' && !booking.joinedWaitlist));

      if (wasHoldingSeat && !nowHoldingSeat) {
        // Release seats
        slot.bookedCount = Math.max(0, slot.bookedCount - booking.peopleCount);
        slot.availableCount = slot.capacity - slot.bookedCount;
        if (slot.availableCount > 0 && slot.status === 'Full') {
          slot.status = 'Available';
        }
        slots[slotIdx] = slot;
        saveCollection('slotify_slots', slots);

        // Process Waitlist: see if anyone on the waitlist can take this slot now!
        const waitlistedBookings = bookings
          .filter(b => b.slotId === slot.id && b.joinedWaitlist && b.status === 'Pending')
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

        for (const wlBooking of waitlistedBookings) {
          if (slot.availableCount >= wlBooking.peopleCount) {
            // Promote waitlist to active booking!
            wlBooking.joinedWaitlist = false;
            wlBooking.status = 'Confirmed';
            wlBooking.paymentStatus = 'Pending';
            
            slot.bookedCount += wlBooking.peopleCount;
            slot.availableCount = slot.capacity - slot.bookedCount;
            if (slot.availableCount <= 0) {
              slot.status = 'Full';
            }
            
            // Notify promoted customer
            const biz = mockDb.getBusiness();
            const offer = mockDb.getOffers().find(o => o.id === slot.offerId);
            const promoMsg = `Good news ${wlBooking.customerName}! A slot opened up. Your booking for '${offer?.title}' at ${biz.name} has been promoted from the Waitlist and is now CONFIRMED. Reference: ${wlBooking.referenceNumber}.`;
            mockDb.logNotification(wlBooking.id, 'SMS', wlBooking.phoneNumber, promoMsg);
          }
        }
      } else if (!wasHoldingSeat && nowHoldingSeat) {
        // Book seats
        slot.bookedCount += booking.peopleCount;
        slot.availableCount = slot.capacity - slot.bookedCount;
        if (slot.availableCount <= 0) {
          slot.status = 'Full';
        }
        slots[slotIdx] = slot;
        saveCollection('slotify_slots', slots);
      }
    }

    bookings[bookingIdx] = booking;
    saveCollection('slotify_bookings', bookings);
    return booking;
  },

  updatePaymentStatus: (id: string, paymentStatus: PaymentStatus): Booking => {
    const bookings = getCollection<Booking>('slotify_bookings');
    const bookingIdx = bookings.findIndex(b => b.id === id);
    if (bookingIdx === -1) throw new Error('Booking not found');
    
    bookings[bookingIdx].paymentStatus = paymentStatus;
    bookings[bookingIdx].updatedAt = new Date().toISOString();
    saveCollection('slotify_bookings', bookings);
    return bookings[bookingIdx];
  },

  // Coupons
  getCoupons: (): Coupon[] => {
    return getCollection<Coupon>('slotify_coupons');
  },
  validateCoupon: (code: string, cartTotal: number): Coupon | null => {
    const coupon = getCollection<Coupon>('slotify_coupons').find(
      c => c.code.toUpperCase() === code.toUpperCase() && c.isActive
    );
    if (!coupon) return null;
    if (coupon.minBookingValue && cartTotal < coupon.minBookingValue) return null;
    return coupon;
  },

  // Notifications
  getNotifications: (): NotificationLog[] => {
    return getCollection<NotificationLog>('slotify_notifications');
  },
  logNotification: (bookingId: string, type: 'Email' | 'SMS' | 'WhatsApp', destination: string, message: string) => {
    const logs = getCollection<NotificationLog>('slotify_notifications');
    const newLog: NotificationLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      bookingId,
      customerName: mockDb.getBooking(bookingId)?.customerName || 'Customer',
      type,
      destination,
      message,
      status: 'Sent',
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    saveCollection('slotify_notifications', logs);
  },

  // Dashboard Summary & Analytics
  getDashboardSummary: (): DashboardSummary => {
    const offers = getCollection<Offer>('slotify_offers');
    const slots = getCollection<OfferSlot>('slotify_slots');
    const bookings = getCollection<Booking>('slotify_bookings').filter(b => !b.joinedWaitlist); // count active bookings
    const allBookings = getCollection<Booking>('slotify_bookings');

    const totalOffers = offers.length;
    const activeOffers = offers.filter(o => o.status === 'Active').length;
    const totalBookings = allBookings.length;
    
    // Bookings created today (local time comparison)
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysBookings = allBookings.filter(b => b.createdAt.startsWith(todayStr)).length;

    let totalCapacity = 0;
    let bookedSeats = 0;
    slots.forEach(s => {
      totalCapacity += s.capacity;
      bookedSeats += s.bookedCount;
    });
    const availableSeats = Math.max(0, totalCapacity - bookedSeats);

    // Dynamic conversion rate: Confirmed bookings / total booking attempts
    const confirmedCount = allBookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed').length;
    const conversionRate = totalBookings > 0 ? Math.round((confirmedCount / totalBookings) * 100) : 0;

    // Calculate revenue based on booking seat counts and offer pricing
    let totalRevenue = 0;
    bookings.forEach(b => {
      if (b.status !== 'Cancelled') {
        const slot = slots.find(s => s.id === b.slotId);
        const offer = slot ? offers.find(o => o.id === slot.offerId) : undefined;
        if (offer) {
          let price = offer.offerPrice;
          if (b.couponCode) {
            const coupon = getCollection<Coupon>('slotify_coupons').find(c => c.code === b.couponCode);
            if (coupon) {
              if (coupon.discountType === 'Percentage') {
                price = price * (1 - coupon.value / 100);
              } else {
                price = Math.max(0, price - coupon.value / b.peopleCount);
              }
            }
          }
          totalRevenue += price * b.peopleCount;
        }
      }
    });

    // Generate Trends (last 7 days)
    const bookingTrends: { date: string; bookings: number }[] = [];
    const revenueTrends: { date: string; revenue: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Daily bookings count
      const dailyCount = allBookings.filter(b => b.createdAt.startsWith(dateStr)).length;
      bookingTrends.push({ date: displayStr, bookings: dailyCount });

      // Daily revenue count
      let dailyRevenue = 0;
      allBookings.forEach(b => {
        if (b.createdAt.startsWith(dateStr) && b.status !== 'Cancelled' && !b.joinedWaitlist) {
          const slot = slots.find(s => s.id === b.slotId);
          const offer = slot ? offers.find(o => o.id === slot.offerId) : undefined;
          if (offer) {
            let price = offer.offerPrice;
            if (b.couponCode) {
              const coupon = getCollection<Coupon>('slotify_coupons').find(c => c.code === b.couponCode);
              if (coupon) {
                if (coupon.discountType === 'Percentage') {
                  price = price * (1 - coupon.value / 100);
                } else {
                  price = Math.max(0, price - coupon.value / b.peopleCount);
                }
              }
            }
            dailyRevenue += price * b.peopleCount;
          }
        }
      });
      revenueTrends.push({ date: displayStr, revenue: Math.round(dailyRevenue) });
    }

    // Capacity Utilization (Booked vs Available)
    const capacityUtilization = [
      { name: 'Booked Seats', value: bookedSeats },
      { name: 'Available Seats', value: availableSeats }
    ];

    // Offer Performance (Top offers based on bookings & revenue)
    const offerPerformance = offers.map(o => {
      const offerSlots = slots.filter(s => s.offerId === o.id);
      const slotIds = offerSlots.map(s => s.id);
      const offerBookings = allBookings.filter(b => slotIds.includes(b.slotId) && b.status !== 'Cancelled' && !b.joinedWaitlist);
      
      let bookingsCount = 0;
      let revenue = 0;
      offerBookings.forEach(ob => {
        bookingsCount += ob.peopleCount;
        let price = o.offerPrice;
        if (ob.couponCode) {
          const coupon = getCollection<Coupon>('slotify_coupons').find(c => c.code === ob.couponCode);
          if (coupon) {
            if (coupon.discountType === 'Percentage') {
              price = price * (1 - coupon.value / 100);
            } else {
              price = Math.max(0, price - coupon.value / ob.peopleCount);
            }
          }
        }
        revenue += price * ob.peopleCount;
      });

      return {
        title: o.title,
        bookings: bookingsCount,
        revenue: Math.round(revenue)
      };
    }).sort((a, b) => b.bookings - a.bookings).slice(0, 5);

    return {
      totalOffers,
      activeOffers,
      totalBookings,
      todaysBookings,
      totalCapacity,
      bookedSeats,
      availableSeats,
      conversionRate,
      revenue: Math.round(totalRevenue),
      bookingTrends,
      revenueTrends,
      capacityUtilization,
      offerPerformance
    };
  }
};
