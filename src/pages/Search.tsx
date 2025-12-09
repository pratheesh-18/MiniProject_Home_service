import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, SlidersHorizontal, List, Map } from 'lucide-react';
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
import { mockProviders, serviceCategories } from '@/data/mockData';
import { Provider, useAppStore } from '@/store/useAppStore';

export default function SearchPage() {
  const { t } = useTranslation();
  const { selectedService, setSelectedService, searchQuery, searchRadius, setSearchRadius } = useAppStore();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price'>('distance');
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [providerToBook, setProviderToBook] = useState<Provider | null>(null);

  // Filter and sort providers
  const filteredProviders = useMemo(() => {
    let result = [...mockProviders];

    // Filter by service
    if (selectedService) {
      result = result.filter(p => p.services.includes(selectedService));
    }

    // Filter by search query
    if (searchInput) {
      const query = searchInput.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.services.some(s => s.toLowerCase().includes(query))
      );
    }

    // Filter by radius
    result = result.filter(p => p.distance <= searchRadius);

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
  }, [selectedService, searchInput, searchRadius, sortBy]);

  const handleBook = (provider: Provider) => {
    setProviderToBook(provider);
    setIsBookingOpen(true);
  };

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
                      <div>
                        <label className="text-sm font-medium mb-3 block">
                          Search Radius: {searchRadius} km
                        </label>
                        <Slider
                          value={[searchRadius]}
                          onValueChange={([v]) => setSearchRadius(v)}
                          min={1}
                          max={20}
                          step={1}
                        />
                      </div>

                      {/* Services */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">Service</label>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={!selectedService ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => setSelectedService(null)}
                          >
                            All
                          </Badge>
                          {serviceCategories.map((service) => (
                            <Badge
                              key={service.id}
                              variant={selectedService === service.id ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => setSelectedService(service.id)}
                            >
                              {service.icon} {t(`services.${service.id}`)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* View Toggle */}
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <Button
                    variant={view === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    className="rounded-none h-12 w-12"
                    onClick={() => setView('list')}
                  >
                    <List className="w-5 h-5" />
                  </Button>
                  <Button
                    variant={view === 'map' ? 'default' : 'ghost'}
                    size="icon"
                    className="rounded-none h-12 w-12"
                    onClick={() => setView('map')}
                  >
                    <Map className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Service Chips */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              <Badge
                variant={!selectedService ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedService(null)}
              >
                All Services
              </Badge>
              {serviceCategories.map((service) => (
                <Badge
                  key={service.id}
                  variant={selectedService === service.id ? 'default' : 'outline'}
                  className={`cursor-pointer whitespace-nowrap ${
                    selectedService === service.id ? 'accent-gradient text-accent-foreground' : ''
                  }`}
                  onClick={() => setSelectedService(service.id)}
                >
                  {service.icon} {t(`services.${service.id}`)}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">{filteredProviders.length}</span> providers found
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
                providers={filteredProviders}
                onProviderSelect={setSelectedProvider}
                className="h-full"
              />
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
