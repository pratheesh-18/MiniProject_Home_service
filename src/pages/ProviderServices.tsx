import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/useAppStore';
import { providersAPI } from '@/lib/api';
import { Loader2, Plus, X, Save, ArrowLeft, Briefcase, DollarSign, Clock, MapPin } from 'lucide-react';

const availableServices = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Cleaning',
  'Painting',
  'Appliance Repair',
  'AC Service',
  'Pest Control',
  'Gardening',
  'Moving & Packing',
  'Roofing',
  'Flooring',
  'Handyman',
];

const serviceSchema = z.object({
  services: z.array(z.string()).min(1, 'Select at least one service'),
  hourlyRate: z.number().min(0, 'Hourly rate must be positive'),
  experience: z.number().min(0, 'Experience must be positive'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface AvailabilityDay {
  start: string;
  end: string;
  available: boolean;
}

export default function ProviderServices() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState<unknown>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [availability, setAvailability] = useState<Record<string, AvailabilityDay>>({
    monday: { start: '09:00', end: '17:00', available: true },
    tuesday: { start: '09:00', end: '17:00', available: true },
    wednesday: { start: '09:00', end: '17:00', available: true },
    thursday: { start: '09:00', end: '17:00', available: true },
    friday: { start: '09:00', end: '17:00', available: true },
    saturday: { start: '09:00', end: '17:00', available: true },
    sunday: { start: '09:00', end: '17:00', available: false },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      services: [],
      hourlyRate: 0,
      experience: 0,
      bio: '',
    },
  });

  const loadProviderData = useCallback(async () => {
    setLoading(true);
    try {
      // Get provider profile
      const providerData = await providersAPI.getMyProfile();
      setProvider(providerData);
      
      if (providerData) {
        setSelectedServices(providerData.services || []);
        setValue('services', providerData.services || []);
        setValue('hourlyRate', providerData.hourlyRate || 0);
        setValue('experience', providerData.experience || 0);
        setValue('bio', providerData.bio || '');
        
        if (providerData.availability) {
          setAvailability(providerData.availability);
        }

        // Set location from provider's currentLocation
        if (providerData.currentLocation?.coordinates) {
          const [longitude, latitude] = providerData.currentLocation.coordinates;
          setLocation({ latitude, longitude });
        }
      }
    } catch (error: unknown) {
      // Provider profile not found, start fresh
      setSelectedServices([]);
      setValue('hourlyRate', 0);
      setValue('experience', 0);
      setValue('bio', '');
    } finally {
      setLoading(false);
    }
  }, [setValue]);

  useEffect(() => {
    loadProviderData();
  }, [loadProviderData]);

  const detectLocation = () => {
    setUpdatingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setUpdatingLocation(false);
          toast({
            title: 'Location detected',
            description: 'Your location has been updated',
          });
        },
        () => {
          setUpdatingLocation(false);
          toast({
            title: 'Location access denied',
            description: 'Please enable location permissions',
            variant: 'destructive',
          });
        }
      );
    }
  };

  const updateLocation = async () => {
    if (!location || !provider) return;

    setUpdatingLocation(true);
    try {
      await providersAPI.updateLocation(provider._id, location.longitude, location.latitude);
      toast({
        title: 'Location updated',
        description: 'Your provider location has been saved',
      });
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update location',
        variant: 'destructive',
      });
    } finally {
      setUpdatingLocation(false);
    }
  };

  const toggleService = (service: string) => {
    const newServices = selectedServices.includes(service)
      ? selectedServices.filter((s) => s !== service)
      : [...selectedServices, service];
    setSelectedServices(newServices);
    setValue('services', newServices, { shouldValidate: true });
  };

  const updateAvailabilityDay = (day: string, field: keyof AvailabilityDay, value: string | boolean) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const onSubmit = async (data: ServiceFormData) => {
    setSaving(true);
    try {
      await providersAPI.updateProfile({
        services: selectedServices,
        hourlyRate: data.hourlyRate,
        experience: data.experience,
        bio: data.bio,
        availability: availability,
      });

      toast({
        title: 'Profile updated!',
        description: 'Your provider profile has been saved successfully.',
      });
      
      // Redirect to dashboard
      navigate('/provider/dashboard');
    } catch (error: unknown) {
      toast({
        title: 'Error saving profile',
        description: error instanceof Error ? error.message : 'Failed to save provider profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const hourlyRate = watch('hourlyRate');
  const experience = watch('experience');

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/provider/dashboard')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-2">Manage Your Services</h1>
          <p className="text-muted-foreground">Set up your provider profile to start receiving bookings</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Services Offered</CardTitle>
              <CardDescription>Select the services you provide</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {availableServices.map((service) => (
                  <Badge
                    key={service}
                    variant={selectedServices.includes(service) ? 'default' : 'outline'}
                    className="cursor-pointer px-4 py-2 text-sm"
                    onClick={() => toggleService(service)}
                  >
                    {service}
                    {selectedServices.includes(service) && (
                      <X className="w-3 h-3 ml-2" />
                    )}
                  </Badge>
                ))}
              </div>
              {errors.services && (
                <p className="text-sm text-destructive mt-2">{errors.services.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Pricing & Experience */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Hourly Rate
                </CardTitle>
                <CardDescription>Set your hourly service rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Rate per hour (₹)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    min="0"
                    step="50"
                    {...register('hourlyRate', { valueAsNumber: true })}
                  />
                  {errors.hourlyRate && (
                    <p className="text-sm text-destructive">{errors.hourlyRate.message}</p>
                  )}
                  {hourlyRate > 0 && (
                    <p className="text-sm text-muted-foreground">
                      You'll earn ₹{hourlyRate.toLocaleString()} per hour
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Experience
                </CardTitle>
                <CardDescription>Years of professional experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    step="1"
                    {...register('experience', { valueAsNumber: true })}
                  />
                  {errors.experience && (
                    <p className="text-sm text-destructive">{errors.experience.message}</p>
                  )}
                  {experience > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {experience} {experience === 1 ? 'year' : 'years'} of experience
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>About You</CardTitle>
              <CardDescription>Tell customers about your expertise</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Describe your skills, experience, and what makes you unique..."
                  rows={4}
                  maxLength={500}
                  {...register('bio')}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {watch('bio')?.length || 0}/500 characters
                </p>
                {errors.bio && (
                  <p className="text-sm text-destructive">{errors.bio.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </CardTitle>
              <CardDescription>Set your service location for customers to find you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {location ? (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-2">
                      Current Location:
                    </p>
                    <p className="font-medium">
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={detectLocation}
                        disabled={updatingLocation}
                      >
                        {updatingLocation ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Detecting...
                          </>
                        ) : (
                          <>
                            <MapPin className="w-4 h-4 mr-2" />
                            Update Location
                          </>
                        )}
                      </Button>
                      {provider && (
                        <Button
                          type="button"
                          variant="default"
                          onClick={updateLocation}
                          disabled={updatingLocation}
                        >
                          {updatingLocation ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Location
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">
                      No location set. Click below to detect your current location.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={detectLocation}
                      disabled={updatingLocation}
                    >
                      {updatingLocation ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Detecting...
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4 mr-2" />
                          Detect Location
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Availability
              </CardTitle>
              <CardDescription>Set your working hours for each day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(availability).map(([day, schedule]) => (
                  <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-24">
                      <p className="font-medium capitalize">{day}</p>
                    </div>
                    <Switch
                      checked={schedule.available}
                      onCheckedChange={(checked) =>
                        updateAvailabilityDay(day, 'available', checked)
                      }
                    />
                    {schedule.available && (
                      <>
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Start Time</Label>
                            <Input
                              type="time"
                              value={schedule.start}
                              onChange={(e) =>
                                updateAvailabilityDay(day, 'start', e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs">End Time</Label>
                            <Input
                              type="time"
                              value={schedule.end}
                              onChange={(e) =>
                                updateAvailabilityDay(day, 'end', e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/provider/dashboard')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

