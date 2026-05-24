export type BusinessType =
  | 'Restaurant'
  | 'Gym'
  | 'Salon'
  | 'Clinic'
  | 'Coaching'
  | 'Turf'
  | 'Gaming Zone'
  | 'Spa'
  | 'Other';

export type OfferStatus = 'Draft' | 'Active' | 'Paused' | 'Expired' | 'Cancelled';

export type SlotStatus = 'Available' | 'Full' | 'Closed' | 'Expired' | 'Cancelled';

export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'No Show';

export type PaymentStatus = 'Paid' | 'Pending' | 'Refunded';

export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface Business {
  id: string;
  userId: string;
  name: string;
  type: BusinessType;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  logoUrl?: string;
  openingTime: string; // "HH:mm"
  closingTime: string; // "HH:mm"
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: string;
  businessId: string;
  title: string;
  description: string;
  category: string;
  originalPrice: number;
  offerPrice: number;
  discountPercentage: number; // computed
  startDate: string; // ISO date
  endDate: string; // ISO date
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  totalCapacity: number;
  maxBookingPerCustomer: number;
  termsAndConditions: string;
  bannerImageUrl?: string;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OfferSlot {
  id: string;
  offerId: string;
  slotDate: string; // ISO date
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  capacity: number;
  bookedCount: number;
  availableCount: number; // computed
  status: SlotStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  slotId: string;
  referenceNumber: string;
  customerName: string;
  phoneNumber: string;
  email?: string;
  peopleCount: number;
  specialNote?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  couponCode?: string;
  joinedWaitlist: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Flattened details for easier UI consumption in admin
  offerTitle?: string;
  slotTimeLabel?: string;
  slotDateLabel?: string;
}

export interface WaitlistEntry {
  id: string;
  slotId: string;
  customerName: string;
  phoneNumber: string;
  email?: string;
  peopleCount: number;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'Percentage' | 'FixedAmount';
  value: number;
  minBookingValue?: number;
  isActive: boolean;
}

export interface DashboardSummary {
  totalOffers: number;
  activeOffers: number;
  totalBookings: number;
  todaysBookings: number;
  totalCapacity: number;
  bookedSeats: number;
  availableSeats: number;
  conversionRate: number; // percentage
  revenue: number;
  bookingTrends: { date: string; bookings: number }[];
  revenueTrends: { date: string; revenue: number }[];
  capacityUtilization: { name: string; value: number }[]; // for pie chart
  offerPerformance: { title: string; bookings: number; revenue: number }[];
}

export interface NotificationLog {
  id: string;
  bookingId: string;
  customerName: string;
  type: 'Email' | 'SMS' | 'WhatsApp';
  destination: string;
  message: string;
  status: 'Sent' | 'Failed';
  timestamp: string;
}
