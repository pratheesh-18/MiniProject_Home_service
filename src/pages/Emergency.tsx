import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  MapPin,
  Loader2,
  CheckCircle,
  Phone,
  Navigation,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { bookingsAPI, providersAPI } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ProviderMap } from '@/components/map/ProviderMap';

type EmergencyStep = 'confirm' | 'finding' | 'assigned' | 'tracking';

export default function EmergencyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    userLocation,
    setUserLocation,
    setIsEmergencyMode,
  } = useAppStore();

  const [step, setStep] = useState<EmergencyStep>('confirm');
  const [assignedProvider, setAssignedProvider] = useState<any | null>(null);
  const [eta, setEta] = useState<number>(0);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [emergencyBooking, setEmergencyBooking] = useState<any>(null);

  /* ------------------ Auto detect location ------------------ */
  useEffect(() => {
    if (!userLocation) detectLocation();
  }, []);

  const detectLocation = () => {
    setIsDetecting(true);

    if (!('geolocation' in navigator)) {
      setIsDetecting(false);
      toast({
        title: 'Location not supported',
        description: 'Your browser does not support location services.',
        variant: 'destructive',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: 'Current Location',
        });
        setIsDetecting(false);
      },
      () => {
        setIsDetecting(false);
        toast({
          title: 'Location required',
          description: 'Please enable location to use emergency services.',
          variant: 'destructive',
        });
      }
    );
  };

  /* ------------------ Emergency booking ------------------ */
  const handleConfirmEmergency = async () => {
    if (!userLocation) {
      toast({
        title: 'Location required',
        description: 'Please enable location to use emergency services.',
        variant: 'destructive',
      });
      return;
    }

    setStep('finding');

    try {
      const booking = await bookingsAPI.createEmergency({
        service: 'Emergency Service',
        location: {
          coordinates: [userLocation.lng, userLocation.lat],
          address: userLocation.address || 'Current Location',
        },
        estimatedDuration: 60,
        notes: 'Emergency service request',
      });

      setEmergencyBooking(booking);

      /* -------- NO PROVIDER FOUND -------- */
      if (!booking?.provider) {
        toast({
          title: 'No providers available',
          description:
            'Sorry, no providers are available right now. Please try again later.',
          variant: 'destructive',
        });
        setStep('confirm');
        return;
      }

      const providerData = await providersAPI.getById(
        booking.provider._id || booking.provider
      );

      const [lng, lat] =
        providerData?.currentLocation?.coordinates || [0, 0];

      /* -------- Distance calculation -------- */
      const R = 6371;
      const dLat = ((lat - userLocation.lat) * Math.PI) / 180;
      const dLon = ((lng - userLocation.lng) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((userLocation.lat * Math.PI) / 180) *
          Math.cos((lat * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      const transformedProvider = {
        id: providerData._id,
        name: providerData.user?.name || 'Provider',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          providerData.user?.name || 'Provider'
        )}&background=0d9488&color=fff`,
        location: { lat, lng },
        distance: Number(distance.toFixed(2)),
        phone: providerData.user?.phone || '',
        services: providerData.services || [],
      };

      setAssignedProvider(transformedProvider);
      setEta(Math.ceil(distance * 3)); // ~3 min per km
      setStep('assigned');
    } catch (error: any) {
      toast({
        title: 'Emergency booking failed',
        description:
          error?.message || 'Could not find available provider',
        variant: 'destructive',
      });
      setStep('confirm');
    }
  };

  const handleCancel = () => {
    setIsEmergencyMode(false);
    navigate('/');
  };

  /* ------------------ UI ------------------ */
  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-background">
        {/* CONFIRM */}
        {step === 'confirm' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container mx-auto px-4 py-12"
          >
            <div className="max-w-lg mx-auto text-center">
              <div className="w-24 h-24 mx-auto rounded-full emergency-gradient flex items-center justify-center mb-8 shadow-emergency animate-pulse-soft">
                <AlertTriangle className="w-12 h-12 text-destructive-foreground" />
              </div>

              <h1 className="text-3xl font-bold mb-4">
                {t('emergency.title')}
              </h1>
              <p className="text-muted-foreground mb-8">
                {t('emergency.description')}
              </p>

              <div className="p-4 rounded-xl bg-muted mb-8">
                <div className="flex items-center justify-center gap-2">
                  {isDetecting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Detecting your location...</span>
                    </>
                  ) : userLocation ? (
                    <>
                      <MapPin className="w-5 h-5 text-success" />
                      <span className="text-success">
                        Location detected
                      </span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5 text-destructive" />
                      <span className="text-destructive">
                        Location not available
                      </span>
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
                  className="emergency-gradient h-14"
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

        {/* FINDING */}
        {step === 'finding' && (
          <motion.div className="container mx-auto px-4 py-12 text-center">
            <Navigation className="w-12 h-12 mx-auto animate-pulse" />
            <h2 className="text-xl font-bold mt-4">
              Finding nearest provider...
            </h2>
          </motion.div>
        )}

        {/* ASSIGNED / TRACKING */}
        {(step === 'assigned' || step === 'tracking') &&
          assignedProvider && (
            <motion.div className="h-[calc(100vh-4rem)]">
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
