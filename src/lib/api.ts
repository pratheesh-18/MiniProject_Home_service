const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Set auth token in localStorage
const setToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Remove auth token from localStorage
const removeToken = (): void => {
  localStorage.removeItem('authToken');
};

// API request helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data.data || data;
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiRequest<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.token) {
      setToken(response.token);
    }

    return response;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: 'customer' | 'provider' | 'admin';
    location?: { coordinates: [number, number] };
  }) => {
    const response = await apiRequest<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.token) {
      setToken(response.token);
    }

    return response;
  },

  getCurrentUser: async () => {
    return apiRequest<any>('/auth/me');
  },

  updateProfile: async (profileData: {
    role?: 'customer' | 'provider' | 'admin';
    name?: string;
    phone?: string;
    profilePicture?: string;
  }) => {
    return apiRequest<any>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },

  uploadProfilePicture: async (base64Image: string) => {
    return apiRequest<any>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ profilePicture: base64Image }),
    });
  },

  logout: () => {
    removeToken();
  },
};

// Providers API
export const providersAPI = {
  search: async (params: {
    latitude: number;
    longitude: number;
    maxDistance?: number;
    service?: string;
    minRating?: number;
    maxHourlyRate?: number;
    isVerified?: boolean;
    isAvailable?: boolean;
    sortBy?: 'distance' | 'rating' | 'hourlyRate';
    limit?: number;
    skip?: number;
  }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    return apiRequest<any[]>(`/providers/search?${queryParams.toString()}`);
  },

  getById: async (id: string) => {
    return apiRequest<any>(`/providers/${id}`);
  },

  updateLocation: async (id: string, longitude: number, latitude: number) => {
    return apiRequest<any>(`/providers/${id}/location`, {
      method: 'PATCH',
      body: JSON.stringify({ longitude, latitude }),
    });
  },

  updateAvailability: async (id: string, isAvailable: boolean) => {
    return apiRequest<any>(`/providers/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable }),
    });
  },

  getAll: async () => {
    return apiRequest<any[]>('/providers');
  },

  getMyProfile: async () => {
    return apiRequest<any>('/providers/me');
  },

  updateProfile: async (profileData: {
    services?: string[];
    hourlyRate?: number;
    experience?: number;
    bio?: string;
    availability?: any;
  }) => {
    return apiRequest<any>('/providers/me', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },
};

// Bookings API
export const bookingsAPI = {
  create: async (bookingData: {
    providerId: string;
    service: string;
    location: { coordinates: [number, number]; address: string };
    estimatedDuration: number;
    scheduledAt?: string;
    notes?: string;
    emergency?: boolean;
  }) => {
    return apiRequest<any>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  createEmergency: async (bookingData: {
    service: string;
    location: { coordinates: [number, number]; address: string };
    estimatedDuration: number;
    notes?: string;
  }) => {
    return apiRequest<any>('/bookings/emergency', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  getMyBookings: async (params?: {
    status?: string;
    limit?: number;
    skip?: number;
    role?: 'customer' | 'provider';
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    return apiRequest<any[]>(`/bookings${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest<any>(`/bookings/${id}`);
  },

  accept: async (id: string) => {
    return apiRequest<any>(`/bookings/${id}/accept`, {
      method: 'PATCH',
    });
  },

  start: async (id: string) => {
    return apiRequest<any>(`/bookings/${id}/start`, {
      method: 'PATCH',
    });
  },

  complete: async (id: string, actualDuration?: number) => {
    return apiRequest<any>(`/bookings/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ actualDuration }),
    });
  },

  cancel: async (id: string) => {
    return apiRequest<any>(`/bookings/${id}/cancel`, {
      method: 'PATCH',
    });
  },
};

// Ratings API
export const ratingsAPI = {
  create: async (ratingData: {
    bookingId: string;
    rating: number;
    review?: string;
  }) => {
    return apiRequest<any>('/ratings', {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  },

  getByProvider: async (providerId: string, params?: {
    limit?: number;
    skip?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    return apiRequest<any[]>(`/ratings/provider/${providerId}${queryString ? `?${queryString}` : ''}`);
  },
};

// Admin API
export const adminAPI = {
  verifyProvider: async (providerId: string, verified: boolean) => {
    return apiRequest<any>(`/admin/providers/${providerId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ verified }),
    });
  },

  getBookingStatistics: async (params?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });
    }

    const queryString = queryParams.toString();
    return apiRequest<any>(`/admin/statistics/bookings${queryString ? `?${queryString}` : ''}`);
  },

  getProviderStatistics: async () => {
    return apiRequest<any>('/admin/statistics/providers');
  },

  resolveDispute: async (bookingId: string, resolution: string, refundAmount?: number) => {
    return apiRequest<any>(`/admin/disputes/${bookingId}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ resolution, refundAmount }),
    });
  },

  getUsers: async (params?: {
    role?: string;
    limit?: number;
    skip?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    return apiRequest<any[]>(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },
};

// Export token management functions
export { getToken, setToken, removeToken };

