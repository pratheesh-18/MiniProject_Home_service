import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, SlidersHorizontal, List, Map, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProviderMap } from '@/components/map/ProviderMap';
import { ProviderCard } from '@/components/providers/ProviderCard';
import { BookingModal } from '@/components/booking/BookingModal';
import { useAppStore } from '@/store/useAppStore';
import { providersAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface BackendProvider {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  services: string[];
  hourlyRate: number;
  rating: number;
  totalRatings: number;
  isAvailable: boolean;
  isVerified: boolean;
  badges: string[];
  currentLocation?: {
    coordinates: [number, number]; // [longitude, latitude]
  };
  bio?: string;
  experience?: number;
}

// Transform backend provider to frontend Provider format
const transformProvider = (backendProvider: BackendProvider, userLocation?: { lat: number; lng: number }): any => {
  const [longitude, latitude] = backendProvider.currentLocation?.coordinates || [0, 0];
  
  // Calculate distance if user location is available
  let distance = 0;
  if (userLocation && latitude && longitude) {
    const R = 6371; // Earth's radius in km
    const dLat = ((latitude - userLocation.lat) * Math.PI) / 180;
    const dLon = ((longitude - userLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLocation.lat * Math.PI) / 180) *
        Math.cos((latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distance = R * c;
  }

  return {
    id: backendProvider._id,
    name: backendProvider.user.name,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(backendProvider.user.name)}&background=0d9488&color=fff`,
    services: backendProvider.services || [],
    hourlyRate: backendProvider.hourlyRate || 0,
    rating: backendProvider.rating || 0,
    reviewCount: backendProvider.totalRatings || 0,
    distance: parseFloat(distance.toFixed(2)),
    isAvailable: backendProvider.isAvailable,
    isVerified: backendProvider.isVerified,
    badges: backendProvider.badges || [],
    location: { lat: latitude, lng: longitude },
    phone: backendProvider.user.phone,
    completedJobs: backendProvider.totalRatings || 0,
    responseTime: '15 min', // Default value
    memberSince: '2024', // Default value
    about: backendProvider.bio || '',
  };
};

export default function SearchPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { selectedService, setSelectedService, searchQuery, searchRadius, setSearchRadius, userLocation } = useAppStore();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price'>('distance');
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [providerToBook, setProviderToBook] = useState<any | null>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const data = await providersAPI.getAll();
      const transformed = data.map((p: BackendProvider) => transformProvider(p, userLocation || undefined));
      setProviders(transformed);
    } catch (error: any) {
      toast({
        title: 'Error loading providers',
        description: error.message || 'Failed to load providers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter providers for list view (includes radius filter)
  const filteredProviders = useMemo(() => {
    let result = [...providers];

    // Filter by service
    if (selectedService) {
      result = result.filter(p => p.services.some((s: string) => s.toLowerCase().includes(selectedService.toLowerCase())));
    }

    // Filter by search query
    if (searchInput) {
      const query = searchInput.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.services.some((s: string) => s.toLowerCase().includes(query))
      );
    }

    // Filter by radius (if user location available) - only for list view
    if (userLocation) {
      result = result.filter(p => p.distance <= searchRadius);
    }

    // Sort
    switch (sortBy) {
      case 'distance':
        result.sort((a, b) => a.distance - b.distance);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        result.sort((a, b) => a.hourlyRate - b.hourlyRate);
        break;
    }

    return result;
  }, [providers, selectedService, searchInput, searchRadius, sortBy, userLocation]);

  // Filter providers for map view (excludes radius filter to show all locations)
  const mapProviders = useMemo(() => {
    let result = [...providers];

    // Filter by service
    if (selectedService) {
      result = result.filter(p => p.services.some((s: string) => s.toLowerCase().includes(selectedService.toLowerCase())));
    }

    // Filter by search query
    if (searchInput) {
      const query = searchInput.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.services.some((s: string) => s.toLowerCase().includes(query))
      );
    }

    // Filter out providers without valid location data
    result = result.filter(p => p.location && p.location.lat !== 0 && p.location.lng !== 0);

    return result;
  }, [providers, selectedService, searchInput]);

  const handleBook = (provider: any) => {
    setProviderToBook(provider);
    setIsBookingOpen(true);
  };

  if (loading) {
    return (
      <Layout showFooter={false}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border sticky top-16 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('hero.searchPlaceholder')}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className="w-[140px] h-12">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                  </SelectContent>
                </Select>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-12 w-12">
                      <SlidersHorizontal className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      {/* Radius */}
                      {userLocation && (
                        <div>
                          <label className="text-sm font-medium mb-3 block">
                            Radius: {searchRadius} km
                          </label>
                          <Slider
                            value={[searchRadius]}
                            onValueChange={(value) => setSearchRadius(value[0])}
                            max={50}
                            min={1}
                            step={1}
                          />
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>

                {/* View Toggle */}
                <div className="flex border rounded-lg overflow-hidden">
                  <Button
                    variant={view === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-12 w-12 rounded-none"
                    onClick={() => setView('list')}
                  >
                    <List className="w-5 h-5" />
                  </Button>
                  <Button
                    variant={view === 'map' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-12 w-12 rounded-none"
                    onClick={() => setView('map')}
                  >
                    <Map className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">
                {view === 'map' ? mapProviders.length : filteredProviders.length}
              </span> providers found
              {view === 'map' && filteredProviders.length !== mapProviders.length && (
                <span className="text-xs ml-2">
                  ({filteredProviders.length} within {searchRadius}km radius)
                </span>
              )}
            </p>
          </div>

          {view === 'list' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProviders.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onSelect={setSelectedProvider}
                  onBook={handleBook}
                  isSelected={selectedProvider?.id === provider.id}
                />
              ))}
            </div>
          ) : (
            <div className="h-[calc(100vh-280px)]">
              <ProviderMap
                providers={mapProviders}
                onProviderSelect={setSelectedProvider}
                className="h-full"
              />
            </div>
          )}

          {filteredProviders.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No providers found</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {providerToBook && (
        <BookingModal
          provider={providerToBook}
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setProviderToBook(null);
          }}
        />
      )}
    </Layout>
  );
}
