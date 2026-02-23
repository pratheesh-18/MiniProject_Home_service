import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Star, MapPin, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { providersAPI } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';

interface BackendProvider {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    profilePicture?: string;
  };
  services: string[];
  hourlyRate: number;
  rating: number;
  totalRatings: number;
  isAvailable: boolean;
  isVerified: boolean;
  badges: string[];
  currentLocation?: {
    coordinates: [number, number];
  };
}

const transformProvider = (backendProvider: BackendProvider) => {
  const [longitude, latitude] = backendProvider.currentLocation?.coordinates || [0, 0];

  return {
    id: backendProvider._id,
    name: backendProvider.user.name,
    avatar: backendProvider.user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(backendProvider.user.name)}&background=0d9488&color=fff`,
    services: backendProvider.services || [],
    hourlyRate: backendProvider.hourlyRate || 0,
    rating: backendProvider.rating || 0,
    reviewCount: backendProvider.totalRatings || 0,
    distance: 0, // Will be calculated if user location available
    isAvailable: backendProvider.isAvailable,
    isVerified: backendProvider.isVerified,
    badges: backendProvider.badges || [],
    location: { lat: latitude, lng: longitude },
    phone: backendProvider.user.phone,
  };
};

export function FeaturedProviders() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userLocation } = useAppStore();
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const data = await providersAPI.getAll();
      // Get top 6 providers by rating
      const sorted = data
        .map((p: BackendProvider) => transformProvider(p))
        .sort((a: any, b: any) => b.rating - a.rating)
        .slice(0, 6);
      setProviders(sorted);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (provider: any) => {
    navigate(`/provider/${provider.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (providers.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">{t('home.featuredProviders')}</h2>
            <p className="text-muted-foreground">{t('home.featuredProvidersDesc')}</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/search')}>
            {t('common.viewAll')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider, index) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all cursor-pointer"
              onClick={() => handleViewProfile(provider)}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={provider.avatar}
                      alt={provider.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    {provider.isAvailable && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground truncate">
                          {provider.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-sm">{provider.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground text-sm">
                            ({provider.reviewCount})
                          </span>
                        </div>
                      </div>
                      {provider.isVerified && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {provider.services.slice(0, 3).map((service: string) => (
                    <Badge key={service} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                  {provider.services.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{provider.services.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {provider.distance > 0 ? `${provider.distance} km` : 'Available'}
                  </div>
                  <div className="text-lg font-bold text-accent">
                    ₹{provider.hourlyRate}
                    <span className="text-sm font-normal text-muted-foreground">/hr</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
