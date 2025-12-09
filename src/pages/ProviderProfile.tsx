import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Star, MapPin, CheckCircle, Clock, Phone, MessageSquare, 
  Calendar, ArrowLeft, Shield, Award, Briefcase, Share2 
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockProviders } from '@/data/mockData';
import { useState } from 'react';
import { BookingModal } from '@/components/booking/BookingModal';

export default function ProviderProfilePage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const provider = mockProviders.find(p => p.id === id);

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

  const reviews = [
    { name: 'Priya S.', rating: 5, comment: 'Excellent service! Very professional and timely.', date: '2 days ago' },
    { name: 'Rahul M.', rating: 4, comment: 'Good work, would recommend.', date: '1 week ago' },
    { name: 'Anitha K.', rating: 5, comment: 'Best plumber in the area. Fixed my issue quickly.', date: '2 weeks ago' },
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
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-primary-foreground/20"
                />
                {provider.isAvailable && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-full border-4 border-primary flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-success-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-primary-foreground">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{provider.name}</h1>
                  {provider.isVerified && (
                    <Badge className="bg-primary-foreground/20 text-primary-foreground">
                      <Shield className="w-3 h-3 mr-1" />
                      {t('providers.verified')}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-warning text-warning" />
                    <span className="font-semibold text-lg">{provider.rating}</span>
                    <span className="text-primary-foreground/70">
                      ({provider.reviewCount} {t('providers.reviews')})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-primary-foreground/70">
                    <MapPin className="w-4 h-4" />
                    <span>{provider.distance} {t('providers.distance')}</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {provider.badges.map((badge) => (
                    <Badge key={badge} variant="secondary" className="bg-primary-foreground/10 text-primary-foreground">
                      <Award className="w-3 h-3 mr-1" />
                      {t(`badges.${badge}`)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <div className="text-right mb-2">
                  <div className="text-3xl font-bold text-primary-foreground">
                    ₹{provider.hourlyRate}
                  </div>
                  <div className="text-primary-foreground/70">{t('providers.perHour')}</div>
                </div>
                <Button
                  size="lg"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  onClick={() => setIsBookingOpen(true)}
                  disabled={!provider.isAvailable}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('common.book')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => window.open(`tel:${provider.phone}`, '_self')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {t('providers.callNow')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="container mx-auto px-4 -mt-6">
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl p-4 shadow-md text-center"
              >
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-accent" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="w-full justify-start mb-6">
              <TabsTrigger value="about">{t('profile.about')}</TabsTrigger>
              <TabsTrigger value="services">{t('profile.services')}</TabsTrigger>
              <TabsTrigger value="reviews">{t('profile.reviews')}</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6">
              <div className="bg-card rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-3">{t('profile.about')}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {provider.about}
                </p>
              </div>

              <div className="bg-card rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-3">{t('profile.availability')}</h3>
                <div className="grid grid-cols-7 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                    <div
                      key={day}
                      className={`text-center py-3 rounded-lg ${
                        i < 6 ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <div className="text-xs">{day}</div>
                      <div className="text-sm font-medium mt-1">
                        {i < 6 ? '9AM-6PM' : 'Off'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              {provider.services.map((service) => (
                <div key={service} className="bg-card rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg capitalize">
                        {t(`services.${service}`)}
                      </h4>
                      <p className="text-muted-foreground mt-1">
                        {t(`services.${service}Desc`)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-accent">₹{provider.hourlyRate}</div>
                      <div className="text-sm text-muted-foreground">{t('providers.perHour')}</div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              {/* Rating Summary */}
              <div className="bg-card rounded-xl p-6">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-foreground">{provider.rating}</div>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(provider.rating)
                              ? 'fill-warning text-warning'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {provider.reviewCount} reviews
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="w-3 text-sm text-muted-foreground">{rating}</span>
                        <Progress
                          value={rating === 5 ? 70 : rating === 4 ? 20 : 10}
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              {reviews.map((review, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium">{review.name}</div>
                      <div className="text-sm text-muted-foreground">{review.date}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'fill-warning text-warning'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <BookingModal
        provider={provider}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </Layout>
  );
}
