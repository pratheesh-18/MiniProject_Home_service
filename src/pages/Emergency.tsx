import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AlertTriangle, MapPin, Loader2, CheckCircle, Phone, Navigation } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { mockProviders } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ProviderMap } from '@/components/map/ProviderMap';

type EmergencyStep = 'confirm' | 'finding' | 'assigned' | 'tracking';

export default function EmergencyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userLocation, setUserLocation, setIsEmergencyMode } = useAppStore();
  const [step, setStep] = useState<EmergencyStep>('confirm');
  const [assignedProvider, setAssignedProvider] = useState<typeof mockProviders[0] | null>(null);
  const [eta, setEta] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    // Auto-detect location on mount if not available
    if (!userLocation) {
      detectLocation();
    }
  }, []);

  const detectLocation = () => {
    setIsDetecting(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Current Location'
          });
          setIsDetecting(false);
        },
        () => {
          setIsDetecting(false);
          toast({
            title: 'Location required',
            description: 'Please enable location to use emergency services.',
            variant: 'destructive'
          });
        }
      );
    }
  };

  const handleConfirmEmergency = async () => {
    if (!userLocation) {
      toast({
        title: 'Location required',
        description: 'Please enable location to use emergency services.',
        variant: 'destructive'
      });
      return;
    }

    setStep('finding');

    // Simulate finding provider
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Find nearest available provider
    const nearestProvider = mockProviders
      .filter(p => p.isAvailable && p.isVerified)
      .sort((a, b) => a.distance - b.distance)[0];

    if (nearestProvider) {
      setAssignedProvider(nearestProvider);
      setEta(Math.ceil(nearestProvider.distance * 3)); // ~3 min per km
      setStep('assigned');

      // Transition to tracking after a delay
      setTimeout(() => setStep('tracking'), 2000);
    } else {
      toast({
        title: 'No providers available',
        description: 'Sorry, no providers are available right now. Please try again later.',
        variant: 'destructive'
      });
      setStep('confirm');
    }
  };

  const handleCancel = () => {
    setIsEmergencyMode(false);
    navigate('/');
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-background">
        {step === 'confirm' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container mx-auto px-4 py-12"
          >
            <div className="max-w-lg mx-auto text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 mx-auto rounded-full emergency-gradient flex items-center justify-center mb-8 shadow-emergency animate-pulse-soft"
              >
                <AlertTriangle className="w-12 h-12 text-destructive-foreground" />
              </motion.div>

              <h1 className="text-3xl font-display font-bold mb-4">
                {t('emergency.title')}
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                {t('emergency.description')}
              </p>

              {/* Location Status */}
              <div className="p-4 rounded-xl bg-muted mb-8">
                <div className="flex items-center justify-center gap-2">
                  {isDetecting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-accent" />
                      <span>Detecting your location...</span>
                    </>
                  ) : userLocation ? (
                    <>
                      <MapPin className="w-5 h-5 text-success" />
                      <span className="text-success">Location detected</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5 text-destructive" />
                      <span className="text-destructive">Location not available</span>
                    </>
                  )}
                </div>
                {!userLocation && !isDetecting && (
                  <Button
                    variant="link"
                    onClick={detectLocation}
                    className="mt-2"
                  >
                    Enable Location
                  </Button>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="emergency-gradient text-destructive-foreground shadow-emergency hover:opacity-90 h-14 text-lg"
                  onClick={handleConfirmEmergency}
                  disabled={!userLocation || isDetecting}
                >
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  {t('emergency.confirm')}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleCancel}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'finding' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container mx-auto px-4 py-12"
          >
            <div className="max-w-lg mx-auto text-center">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-accent animate-ping opacity-30" />
                <div className="absolute inset-4 rounded-full border-4 border-accent animate-ping opacity-50 animation-delay-150" />
                <div className="absolute inset-8 rounded-full emergency-gradient flex items-center justify-center">
                  <Navigation className="w-8 h-8 text-destructive-foreground animate-pulse" />
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">Finding Nearest Provider</h2>
              <p className="text-muted-foreground">
                Please wait while we locate the nearest available provider...
              </p>
            </div>
          </motion.div>
        )}

        {(step === 'assigned' || step === 'tracking') && assignedProvider && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-[calc(100vh-4rem)]"
          >
            {/* Provider Info Bar */}
            <motion.div
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              className="absolute top-20 left-4 right-4 z-30 max-w-lg mx-auto"
            >
              <div className="bg-card rounded-xl shadow-xl p-4">
                <div className="flex items-center gap-2 text-success mb-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">{t('emergency.onTheWay')}</span>
                </div>

                <div className="flex items-center gap-4">
                  <img
                    src={assignedProvider.avatar}
                    alt={assignedProvider.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{assignedProvider.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {assignedProvider.services.map(s => t(`services.${s}`)).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-accent">{eta}</div>
                    <div className="text-xs text-muted-foreground">{t('emergency.minutes')}</div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(`tel:${assignedProvider.phone}`, '_self')}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    {t('providers.callNow')}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setStep('confirm');
                      setAssignedProvider(null);
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Map */}
            <ProviderMap
              providers={[assignedProvider]}
              className="h-full"
            />
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
