import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/useAppStore';
import { providersAPI, bookingsAPI } from '@/lib/api';
import { Loader2, Briefcase, DollarSign, Star, CheckCircle, XCircle, Settings, Calendar, TrendingUp } from 'lucide-react';

interface ProviderProfile {
  _id: string;
  services: string[];
  experience: number;
  hourlyRate: number;
  isVerified: boolean;
  isAvailable: boolean;
  rating: number;
  totalRatings: number;
  badges: string[];
  bio?: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    loadProviderData();
  }, []);

  const loadProviderData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get provider profile
      try {
        const providerData = await providersAPI.getMyProfile();
        setProvider(providerData);
      } catch (error: any) {
        // Provider profile not found, user needs to set it up
        console.log('Provider profile not found');
      }

      // Get bookings
      const bookingsData = await bookingsAPI.getMyBookings({ limit: 100, role: 'provider' });
      setBookings(bookingsData);

      // Calculate stats
      const total = bookingsData.length;
      const pending = bookingsData.filter((b: any) => b.status === 'pending' || b.status === 'accepted').length;
      const completed = bookingsData.filter((b: any) => b.status === 'completed').length;
      const earnings = bookingsData
        .filter((b: any) => b.status === 'completed' && b.paymentStatus === 'paid')
        .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);

      setStats({
        totalBookings: total,
        pendingBookings: pending,
        completedBookings: completed,
        totalEarnings: earnings,
      });
    } catch (error: any) {
      toast({
        title: 'Error loading data',
        description: error.message || 'Failed to load provider data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvailability = async (isAvailable: boolean) => {
    if (!provider) return;

    try {
      await providersAPI.updateAvailability(provider._id, isAvailable);
      setProvider({ ...provider, isAvailable });
      toast({
        title: 'Availability updated',
        description: `You are now ${isAvailable ? 'available' : 'unavailable'}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update availability',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const recentBookings = bookings.slice(0, 5);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
              <p className="text-muted-foreground">Manage your services and bookings</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/provider/services')}>
                <Settings className="w-4 h-4 mr-2" />
                Manage Services
              </Button>
              <Button
                variant={provider?.isAvailable ? 'default' : 'outline'}
                onClick={() => handleUpdateAvailability(!provider?.isAvailable)}
                disabled={!provider}
              >
                {provider?.isAvailable ? 'Available' : 'Unavailable'}
              </Button>
            </div>
          </div>
        </div>

        {!provider && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle>Setup Required</CardTitle>
              <CardDescription>Complete your provider profile to start receiving bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/provider/services')}>
                Set Up Your Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedBookings} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingBookings}</div>
              <p className="text-xs text-muted-foreground">Requires action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From completed bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {provider?.rating?.toFixed(1) || '0.0'}
              </div>
              <p className="text-xs text-muted-foreground">
                {provider?.totalRatings || 0} reviews
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Status */}
        {provider && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Profile Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3">
                  {provider.isVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium">Verification</p>
                    <p className="text-sm text-muted-foreground">
                      {provider.isVerified ? 'Verified' : 'Pending verification'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Services</p>
                    <p className="text-sm text-muted-foreground">
                      {provider.services?.length || 0} service(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Hourly Rate</p>
                    <p className="text-sm text-muted-foreground">₹{provider.hourlyRate}/hr</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Your latest booking requests</CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/provider/bookings')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking: any) => (
                  <div
                    key={booking._id}
                    className={`flex items-center justify-between p-4 border-l-4 rounded-r-lg mb-3 shadow-sm ${booking.emergency
                      ? 'bg-red-100 border-l-red-600 dark:bg-red-900/10'
                      : 'bg-green-100 border-l-green-600 dark:bg-green-900/10'
                      }`}
                  >
                    <div>
                      {/* Explicit Label */}
                      <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${booking.emergency ? 'text-red-700' : 'text-green-700'
                        }`}>
                        {booking.emergency ? '🔴 Emergency Service' : '🟢 Normal Service'}
                      </div>

                      <p className="font-bold text-lg">{booking.service}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {booking.customer?.name || 'Customer'} • {booking.location?.address}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          booking.status === 'completed'
                            ? 'default'
                            : booking.status === 'pending'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {booking.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/provider/bookings/${booking._id}`)}
                        className="hover:bg-white/50"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No bookings yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

