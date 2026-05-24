import axios from 'axios';
import { mockDb } from '../services/mockDb';
import { 
  User, Business, Offer, OfferSlot, Booking, 
  Coupon, DashboardSummary, NotificationLog, BookingStatus, PaymentStatus 
} from '../types';

// Determine if we should connect to the real .NET API or run in Mock state
const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create Axios Instance for Real Backend
export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT Auth Token to Requests
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('slotify_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Simulated delay helper for Mock API (makes skeletons/loaders visible)
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const apiClient = {
  auth: {
    login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
      if (USE_REAL_API) {
        const res = await http.post('/auth/login', { email, password });
        localStorage.setItem('slotify_token', res.data.token);
        localStorage.setItem('slotify_user', JSON.stringify(res.data.user));
        return res.data;
      } else {
        await delay(600);
        const result = mockDb.login(email, password);
        if (!result) throw new Error('Invalid email or password. Hint: Use Admin123!');
        localStorage.setItem('slotify_token', result.token);
        localStorage.setItem('slotify_user', JSON.stringify(result.user));
        return result;
      }
    },
    logout: async (): Promise<void> => {
      localStorage.removeItem('slotify_token');
      localStorage.removeItem('slotify_user');
      if (USE_REAL_API) {
        // Option to call blacklist API if wanted
      }
      await delay(200);
    },
    getCurrentUser: (): User | null => {
      const userStr = localStorage.getItem('slotify_user');
      return userStr ? JSON.parse(userStr) : null;
    },
    isAuthenticated: (): boolean => {
      return !!localStorage.getItem('slotify_token');
    }
  },

  business: {
    get: async (): Promise<Business> => {
      if (USE_REAL_API) {
        const res = await http.get('/business');
        return res.data;
      } else {
        await delay(300);
        return mockDb.getBusiness();
      }
    },
    update: async (id: string, data: Partial<Business>): Promise<Business> => {
      if (USE_REAL_API) {
        const res = await http.put(`/business/${id}`, data);
        return res.data;
      } else {
        await delay(500);
        const current = mockDb.getBusiness();
        const updated = mockDb.saveBusiness({ ...current, ...data } as Business);
        return updated;
      }
    }
  },

  offers: {
    getAll: async (filters?: { category?: string; type?: string; status?: string; search?: string }): Promise<Offer[]> => {
      if (USE_REAL_API) {
        const res = await http.get('/offers', { params: filters });
        return res.data;
      } else {
        await delay(400);
        let list = mockDb.getOffers();
        
        if (filters) {
          if (filters.status) {
            list = list.filter(o => o.status === filters.status);
          }
          if (filters.category) {
            list = list.filter(o => o.category.toLowerCase() === filters.category!.toLowerCase());
          }
          if (filters.search) {
            const query = filters.search.toLowerCase();
            list = list.filter(o => o.title.toLowerCase().includes(query) || o.description.toLowerCase().includes(query));
          }
        }
        return list;
      }
    },
    getById: async (id: string): Promise<Offer> => {
      if (USE_REAL_API) {
        const res = await http.get(`/offers/${id}`);
        return res.data;
      } else {
        await delay(300);
        const offer = mockDb.getOffer(id);
        if (!offer) throw new Error('Offer not found');
        return offer;
      }
    },
    create: async (data: Omit<Offer, 'id' | 'discountPercentage' | 'createdAt' | 'updatedAt'>): Promise<Offer> => {
      if (USE_REAL_API) {
        const res = await http.post('/offers', data);
        return res.data;
      } else {
        await delay(500);
        const newOffer: Offer = {
          ...data,
          id: `offer-${Date.now()}`,
          discountPercentage: 0, // calculated in saveOffer
          createdAt: '',
          updatedAt: ''
        };
        return mockDb.saveOffer(newOffer);
      }
    },
    update: async (id: string, data: Partial<Offer>): Promise<Offer> => {
      if (USE_REAL_API) {
        const res = await http.put(`/offers/${id}`, data);
        return res.data;
      } else {
        await delay(500);
        const current = mockDb.getOffer(id);
        if (!current) throw new Error('Offer not found');
        const updated = mockDb.saveOffer({ ...current, ...data } as Offer);
        return updated;
      }
    },
    delete: async (id: string): Promise<void> => {
      if (USE_REAL_API) {
        await http.delete(`/offers/${id}`);
      } else {
        await delay(400);
        mockDb.deleteOffer(id);
      }
    }
  },

  slots: {
    getAll: async (): Promise<OfferSlot[]> => {
      if (USE_REAL_API) {
        const res = await http.get('/slots');
        return res.data;
      } else {
        await delay(300);
        return mockDb.getSlots();
      }
    },
    getByOfferId: async (offerId: string): Promise<OfferSlot[]> => {
      if (USE_REAL_API) {
        const res = await http.get(`/offers/${offerId}/slots`);
        return res.data;
      } else {
        await delay(300);
        return mockDb.getSlotsForOffer(offerId);
      }
    },
    getById: async (id: string): Promise<OfferSlot> => {
      if (USE_REAL_API) {
        const res = await http.get(`/slots/${id}`);
        return res.data;
      } else {
        await delay(200);
        const slot = mockDb.getSlot(id);
        if (!slot) throw new Error('Slot not found');
        return slot;
      }
    },
    create: async (data: Omit<OfferSlot, 'id' | 'bookedCount' | 'availableCount' | 'createdAt' | 'updatedAt'>): Promise<OfferSlot> => {
      if (USE_REAL_API) {
        const res = await http.post('/slots', data);
        return res.data;
      } else {
        await delay(400);
        const newSlot: OfferSlot = {
          ...data,
          id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          bookedCount: 0,
          availableCount: data.capacity,
          createdAt: '',
          updatedAt: ''
        };
        return mockDb.saveSlot(newSlot);
      }
    },
    update: async (id: string, data: Partial<OfferSlot>): Promise<OfferSlot> => {
      if (USE_REAL_API) {
        const res = await http.put(`/slots/${id}`, data);
        return res.data;
      } else {
        await delay(400);
        const current = mockDb.getSlot(id);
        if (!current) throw new Error('Slot not found');
        return mockDb.saveSlot({ ...current, ...data } as OfferSlot);
      }
    },
    delete: async (id: string): Promise<void> => {
      if (USE_REAL_API) {
        await http.delete(`/slots/${id}`);
      } else {
        await delay(300);
        mockDb.deleteSlot(id);
      }
    }
  },

  bookings: {
    getAll: async (): Promise<Booking[]> => {
      if (USE_REAL_API) {
        const res = await http.get('/bookings');
        return res.data;
      } else {
        await delay(400);
        return mockDb.getBookings();
      }
    },
    getById: async (id: string): Promise<Booking> => {
      if (USE_REAL_API) {
        const res = await http.get(`/bookings/${id}`);
        return res.data;
      } else {
        await delay(250);
        const b = mockDb.getBooking(id);
        if (!b) throw new Error('Booking not found');
        return b;
      }
    },
    getByReference: async (ref: string): Promise<Booking> => {
      if (USE_REAL_API) {
        const res = await http.get(`/bookings/ref/${ref}`);
        return res.data;
      } else {
        await delay(300);
        const b = mockDb.getBookingByReference(ref);
        if (!b) throw new Error('Booking reference not found');
        return b;
      }
    },
    create: async (data: Omit<Booking, 'id' | 'referenceNumber' | 'status' | 'joinedWaitlist' | 'createdAt' | 'updatedAt' | 'paymentStatus'>): Promise<{ booking: Booking; waitlisted: boolean }> => {
      if (USE_REAL_API) {
        const res = await http.post('/bookings', data);
        return res.data;
      } else {
        await delay(600);
        const newBooking: Booking = {
          ...data,
          id: `booking-${Date.now()}`,
          referenceNumber: mockDb.getSlots().find(s => s.id === data.slotId)?.status === 'Full' 
            ? `WLT-${Math.floor(10000 + Math.random() * 90000)}` 
            : `SLT-${Math.floor(10000 + Math.random() * 90000)}`,
          status: 'Pending',
          paymentStatus: 'Pending',
          joinedWaitlist: false,
          createdAt: '',
          updatedAt: ''
        };
        return mockDb.saveBooking(newBooking);
      }
    },
    updateStatus: async (id: string, status: BookingStatus): Promise<Booking> => {
      if (USE_REAL_API) {
        const res = await http.put(`/bookings/${id}/status`, { status });
        return res.data;
      } else {
        await delay(400);
        return mockDb.updateBookingStatus(id, status);
      }
    },
    updatePaymentStatus: async (id: string, paymentStatus: PaymentStatus): Promise<Booking> => {
      if (USE_REAL_API) {
        const res = await http.put(`/bookings/${id}/payment`, { paymentStatus });
        return res.data;
      } else {
        await delay(300);
        return mockDb.updatePaymentStatus(id, paymentStatus);
      }
    }
  },

  dashboard: {
    getSummary: async (): Promise<DashboardSummary> => {
      if (USE_REAL_API) {
        const res = await http.get('/dashboard/summary');
        return res.data;
      } else {
        await delay(500);
        return mockDb.getDashboardSummary();
      }
    }
  },

  coupons: {
    validate: async (code: string, amount: number): Promise<Coupon | null> => {
      if (USE_REAL_API) {
        const res = await http.get(`/coupons/validate/${code}`, { params: { amount } });
        return res.data;
      } else {
        await delay(250);
        return mockDb.validateCoupon(code, amount);
      }
    }
  },

  notifications: {
    getAll: async (): Promise<NotificationLog[]> => {
      if (USE_REAL_API) {
        const res = await http.get('/notifications');
        return res.data;
      } else {
        await delay(200);
        return mockDb.getNotifications();
      }
    }
  }
};
