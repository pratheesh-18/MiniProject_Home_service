import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Star, MapPin, CheckCircle, Clock, Phone, MessageSquare,
  Calendar, ArrowLeft, Shield, Award, Briefcase, Share2, Loader2
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { providersAPI, ratingsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useState as useBookingState } from 'react';
import { BookingModal } from '@/components/booking/BookingModal';

interface ProviderData {
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
  bio?: string;
  experience?: number;
}

const transformProvider = (backendProvider: ProviderData) => {
  const [longitude, latitude] = backendProvider.currentLocation?.coordinates || [0, 0];
  const generatedAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(backendProvider.user.name)}&background=0d9488&color=fff`;

  return {
    id: backendProvider._id,
    name: backendProvider.user.name,
    avatar: backendProvider.user.profilePicture || generatedAvatar,
    services: backendProvider.services || [],
    hourlyRate: backendProvider.hourlyRate || 0,
    rating: backendProvider.rating || 0,
    reviewCount: backendProvider.totalRatings || 0,
    distance: 0,
    isAvailable: backendProvider.isAvailable,
    isVerified: backendProvider.isVerified,
    badges: backendProvider.badges || [],
    location: { lat: latitude, lng: longitude },
    phone: backendProvider.user.phone,
    completedJobs: backendProvider.totalRatings || 0,
    responseTime: '15 min',
    memberSince: '2024',
    about: backendProvider.bio || '',
  };
};

export default function ProviderProfilePage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadProvider();
    }
  }, [id]);

  const loadProvider = async () => {
    setLoading(true);
    try {
      const data = await providersAPI.getById(id!);
      const transformed = transformProvider(data);
      setProvider(transformed);

      // Load ratings
      try {
        const ratingsData = await ratingsAPI.getByProvider(id!);
        setRatings(ratingsData);
      } catch (error) {
        console.error('Error loading ratings:', error);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Provider not found',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!provider) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Provider not found</h1>
          <Button onClick={() => navigate('/search')}>Back to Search</Button>
        </div>
      </Layout>
    );
  }

  const stats = [
    { label: t('profile.completedJobs'), value: provider.completedJobs, icon: Briefcase },
    { label: t('profile.responseTime'), value: provider.responseTime, icon: Clock },
    { label: t('profile.memberSince'), value: provider.memberSince, icon: Calendar },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="hero-gradient py-8">
          <div className="container mx-auto px-4">
            <Button
              variant="ghost"
              className="text-primary-foreground mb-4"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={provider.avatar}
                  alt={provider.name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-primary-foreground/20"
                />
                {provider.isAvailable && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-full border-4 border-card flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-success-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-primary-foreground">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{provider.name}</h1>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-warning text-warning" />
                        <span className="text-xl font-bold">{provider.rating.toFixed(1)}</span>
                        <span className="text-primary-foreground/80">
                          ({provider.reviewCount} {t('providers.reviews')})
                        </span>
                      </div>
                      {provider.isVerified && (
                        <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
                          <Shield className="w-3 h-3 mr-1" />
                          {t('providers.verified')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {provider.services.map((service: string) => (
                    <Badge
                      key={service}
                      variant="secondary"
                      className="bg-primary-foreground/20 text-primary-foreground"
                    >
                      {service}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <stat.icon className="w-5 h-5 mx-auto mb-2 text-primary-foreground/80" />
                      <p className="text-sm text-primary-foreground/80">{stat.label}</p>
                      <p className="text-lg font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <Button
                  size="lg"
                  className="w-full md:w-auto accent-gradient text-accent-foreground"
                  onClick={() => setIsBookingOpen(true)}
                  disabled={!provider.isAvailable}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  {t('common.book')}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full md:w-auto bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20"
                  onClick={() => window.open(`tel:${provider.phone}`, '_self')}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  {t('providers.callNow')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="about" className="space-y-6">
            <TabsList>
              <TabsTrigger value="about">{t('profile.about')}</TabsTrigger>
              <TabsTrigger value="reviews">
                {t('profile.reviews')} ({ratings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6">
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-xl font-bold mb-4">{t('profile.AboutProvider')}</h3>
                <p className="text-muted-foreground">
                  {provider.about || 'No description available.'}
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-xl font-bold mb-4">Pricing</h3>
                <div className="text-3xl font-bold text-accent">
                  ₹{provider.hourlyRate}
                  <span className="text-lg font-normal text-muted-foreground">/hour</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              {ratings.length > 0 ? (
                ratings.map((rating: any) => (
                  <div key={rating._id} className="bg-card rounded-xl p-6 border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{rating.customer?.name || 'Customer'}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < rating.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {rating.review && (
                      <p className="text-muted-foreground mt-2">{rating.review}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No reviews yet
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Booking Modal */}
      {provider && (
        <BookingModal
          provider={provider}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
        />
      )}
    </Layout>
  );
}
