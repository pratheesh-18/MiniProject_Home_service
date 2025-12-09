import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Star, MapPin, CheckCircle, Clock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockProviders } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

export function FeaturedProviders() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setSelectedProvider } = useAppStore();

  const featuredProviders = mockProviders
    .filter(p => p.isAvailable && p.rating >= 4.5)
    .slice(0, 4);

  const handleViewProfile = (provider: typeof mockProviders[0]) => {
    setSelectedProvider(provider);
    navigate(`/provider/${provider.id}`);
  };

  const getBadgeVariant = (badge: string) => {
    switch (badge) {
      case 'topRated':
        return 'default';
      case 'verified':
        return 'secondary';
      case 'superProvider':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              {t('providers.title')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              {t('providers.subtitle')}
            </p>
          </div>
          <Button 
            variant="outline" 
            className="mt-4 md:mt-0"
            onClick={() => navigate('/search')}
          >
            {t('common.viewAll')}
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProviders.map((provider, index) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group"
            >
              {/* Provider Header */}
              <div className="relative p-6 pb-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={provider.avatar}
                      alt={provider.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    {provider.isAvailable && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-card flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-success-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {provider.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 fill-warning text-warning" />
                      <span className="font-medium text-sm">{provider.rating}</span>
                      <span className="text-muted-foreground text-sm">
                        ({provider.reviewCount} {t('providers.reviews')})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{provider.distance} {t('providers.distance')}</span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {provider.badges.slice(0, 3).map((badge) => (
                    <Badge key={badge} variant={getBadgeVariant(badge)} className="text-xs">
                      {t(`badges.${badge}`)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="px-6 py-3 bg-muted/50 flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{provider.responseTime}</span>
                </div>
                <div className="font-semibold text-accent">
                  ₹{provider.hourlyRate}{t('providers.perHour')}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleViewProfile(provider)}
                >
                  {t('providers.viewProfile')}
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 accent-gradient text-accent-foreground hover:opacity-90"
                >
                  {t('common.book')}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
