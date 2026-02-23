import { create } from 'zustand';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Provider {
  id: string;
  name: string;
  avatar: string;
  services: string[];
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  distance: number;
  isAvailable: boolean;
  isVerified: boolean;
  badges: string[];
  location: Location;
  phone: string;
  completedJobs: number;
  responseTime: string;
  memberSince: string;
  about: string;
}

export interface Booking {
  id: string;
  providerId: string;
  serviceId: string;
  status: 'pending' | 'confirmed' | 'accepted' | 'enRoute' | 'inProgress' | 'completed' | 'cancelled';
  scheduledTime: Date;
  location: Location;
  estimatedCost: number;
  isEmergency: boolean;
  isGroupBooking: boolean;
  groupMembers?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'provider' | 'admin';
  avatar?: string;
  profilePicture?: string;
  location?: Location;
}

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // Location state
  userLocation: Location | null;
  setUserLocation: (location: Location | null) => void;
  isDetectingLocation: boolean;
  setIsDetectingLocation: (detecting: boolean) => void;

  // Providers state
  providers: Provider[];
  setProviders: (providers: Provider[]) => void;
  selectedProvider: Provider | null;
  setSelectedProvider: (provider: Provider | null) => void;

  // Booking state
  currentBooking: Booking | null;
  setCurrentBooking: (booking: Booking | null) => void;
  bookings: Booking[];
  setBookings: (bookings: Booking[]) => void;

  // UI state
  selectedService: string | null;
  setSelectedService: (service: string | null) => void;
  isEmergencyMode: boolean;
  setIsEmergencyMode: (emergency: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchRadius: number;
  setSearchRadius: (radius: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // User state
  user: null,
  setUser: (user) => set({ user }),

  // Location state
  userLocation: null,
  setUserLocation: (userLocation) => set({ userLocation }),
  isDetectingLocation: false,
  setIsDetectingLocation: (isDetectingLocation) => set({ isDetectingLocation }),

  // Providers state
  providers: [],
  setProviders: (providers) => set({ providers }),
  selectedProvider: null,
  setSelectedProvider: (selectedProvider) => set({ selectedProvider }),

  // Booking state
  currentBooking: null,
  setCurrentBooking: (currentBooking) => set({ currentBooking }),
  bookings: [],
  setBookings: (bookings) => set({ bookings }),

  // UI state
  selectedService: null,
  setSelectedService: (selectedService) => set({ selectedService }),
  isEmergencyMode: false,
  setIsEmergencyMode: (isEmergencyMode) => set({ isEmergencyMode }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  searchRadius: 10,
  setSearchRadius: (searchRadius) => set({ searchRadius }),
}));
