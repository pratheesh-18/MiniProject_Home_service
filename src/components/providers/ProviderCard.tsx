import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Star, MapPin, CheckCircle, Clock, Phone, MessageSquare, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Provider } from '@/store/useAppStore';

interface ProviderCardProps {
  provider: Provider;
  onSelect: (provider: Provider) => void;
  onBook: (provider: Provider) => void;
  isSelected?: boolean;
}

export function ProviderCard({ provider, onSelect, onBook, isSelected }: ProviderCardProps) {
  const { t } = useTranslation();

  const getBadgeVariant = (badge: string) => {
    switch (badge) {
      case 'topRated':
      case 'superProvider':
        return 'default' as const;
      case 'verified':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`bg-card rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
        isSelected ? 'border-accent shadow-glow' : 'border-transparent hover:border-border shadow-md hover:shadow-lg'
      }`}
      onClick={() => onSelect(provider)}
    >
      <div className="p-5">
        {/* Header */}
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
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground truncate pr-2">
                  {provider.name}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 fill-warning text-warning" />
                  <span className="font-medium text-sm">{provider.rating}</span>
                  <span className="text-muted-foreground text-sm">
                    ({provider.reviewCount} {t('providers.reviews')})
                  </span>
                </div>
              </div>
              <Badge 
                variant={provider.isAvailable ? 'default' : 'secondary'}
                className={provider.isAvailable ? 'bg-success text-success-foreground' : ''}
              >
                {provider.isAvailable ? t('providers.available') : t('providers.busy')}
              </Badge>
            </div>

            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {provider.distance} {t('providers.distance')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {provider.responseTime}
              </span>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {provider.services.map((service) => (
            <Badge key={service} variant="outline" className="text-xs capitalize">
              {t(`services.${service}`)}
            </Badge>
          ))}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {provider.badges.slice(0, 3).map((badge) => (
            <Badge key={badge} variant={getBadgeVariant(badge)} className="text-xs">
              {t(`badges.${badge}`)}
            </Badge>
          ))}
        </div>

        {/* Stats & Price */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{provider.completedJobs}</span> jobs completed
          </div>
          <div className="text-lg font-bold text-accent">
            ₹{provider.hourlyRate}<span className="text-sm font-normal text-muted-foreground">{t('providers.perHour')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`tel:${provider.phone}`, '_self');
            }}
          >
            <Phone className="w-4 h-4 mr-1" />
            {t('providers.callNow')}
          </Button>
          <Button
            size="sm"
            className="flex-1 accent-gradient text-accent-foreground hover:opacity-90"
            onClick={(e) => {
              e.stopPropagation();
              onBook(provider);
            }}
            disabled={!provider.isAvailable}
          >
            <Calendar className="w-4 h-4 mr-1" />
            {t('common.book')}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
