import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, MapPin, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function HeroSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState('');
  const { 
    setUserLocation, 
    isDetectingLocation, 
    setIsDetectingLocation,
    setSearchQuery,
    setIsEmergencyMode 
  } = useAppStore();

  const detectLocation = () => {
    setIsDetectingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Current Location'
          });
          setIsDetectingLocation(false);
          toast({
            title: 'Location detected!',
            description: 'Showing providers near you.',
          });
        },
        (error) => {
          setIsDetectingLocation(false);
          toast({
            title: 'Location access denied',
            description: 'Please enter your address manually.',
            variant: 'destructive',
          });
        }
      );
    } else {
      setIsDetectingLocation(false);
      toast({
        title: 'Geolocation not supported',
        description: 'Please enter your address manually.',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    navigate('/search');
  };

  const handleEmergency = () => {
    setIsEmergencyMode(true);
    navigate('/emergency');
  };

  return (
    <section className="relative min-h-[90vh] hero-gradient overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-accent blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-secondary blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-primary-foreground/10" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground mb-6 leading-tight"
          >
            {t('hero.title')}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl max-w-2xl mx-auto"
          >
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('hero.searchPlaceholder')}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-12 h-14 text-lg bg-muted border-0 rounded-xl"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 gap-2"
                  onClick={detectLocation}
                  disabled={isDetectingLocation}
                >
                  {isDetectingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  {t('hero.detectLocation')}
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-12 accent-gradient text-accent-foreground hover:opacity-90"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {t('common.search')}
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Emergency Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8"
          >
            <Button
              onClick={handleEmergency}
              size="lg"
              className="emergency-gradient text-destructive-foreground shadow-emergency hover:opacity-90 animate-pulse-soft gap-2 px-8"
            >
              <AlertTriangle className="w-5 h-5" />
              {t('hero.emergency')}
            </Button>
            <p className="text-primary-foreground/60 text-sm mt-2">
              {t('hero.emergencyDesc')}
            </p>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16"
        >
          {[
            { value: '10,000+', label: 'Happy Customers' },
            { value: '500+', label: 'Verified Providers' },
            { value: '50,000+', label: 'Services Completed' },
            { value: '4.8', label: 'Average Rating' },
          ].map((stat, index) => (
            <div 
              key={index} 
              className="text-center p-4 rounded-xl bg-primary-foreground/5 backdrop-blur-sm"
            >
              <div className="text-2xl md:text-3xl font-bold text-primary-foreground">
                {stat.value}
              </div>
              <div className="text-sm text-primary-foreground/60">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full">
          <path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" 
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
}
