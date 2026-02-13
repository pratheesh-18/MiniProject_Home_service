import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/useAppStore';
import { bookingsAPI } from '@/lib/api';
import { Loader2, Calendar, MapPin, Clock, User, DollarSign, CheckCircle, XCircle, AlertCircle, Star } from 'lucide-react';

interface Booking {
  _id: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  provider: {
    _id: string;
    user: {
      _id: string;
      name: string;
      email: string;
      phone: string;
    };
    services: string[];
    hourlyRate: number;
  };
  service: string;
  status: 'pending' | 'accepted' | 'started' | 'completed' | 'cancelled' | 'disputed';
  location: {
    coordinates: [number, number];
    address: string;
  };
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  estimatedDuration: number;
  actualDuration?: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  notes?: string;
  emergency: boolean;
  createdAt: string;
}

export default function MyBookings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingsAPI.getMyBookings({ limit: 100, role: 'customer' });
      setBookings(data);
    } catch (error: any) {
      toast({
        title: 'Error loading bookings',
        description: error.message || 'Failed to load bookings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingsAPI.cancel(bookingId);
      toast({
        title: 'Booking cancelled',
        description: 'Your booking has been cancelled',
      });
      loadBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel booking',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      pending: 'secondary',
      accepted: 'outline',
      started: 'default',
      completed: 'default',
      cancelled: 'destructive',
      disputed: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 'all') return true;
    return booking.status === activeTab;
  });

  const pendingBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'accepted');
  const activeBookings = bookings.filter((b) => b.status === 'started');
  const completedBookings = bookings.filter((b) => b.status === 'completed');

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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">View and manage all your service bookings</p>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBookings.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBookings.length}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedBookings.length}</div>
              <p className="text-xs text-muted-foreground">Finished bookings</p>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>View and manage your bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
                <TabsTrigger value="started">Active ({activeBookings.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {filteredBookings.length > 0 ? (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <Card key={booking._id}>
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg">{booking.service}</h3>
                                {booking.emergency && (
                                  <Badge variant="destructive">Emergency</Badge>
                                )}
                                {getStatusBadge(booking.status)}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span>
                                    {user?.role === 'customer'
                                      ? booking.provider?.user?.name || 'Provider'
                                      : booking.customer?.name || 'Customer'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  <span className="truncate">{booking.location?.address}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {booking.scheduledAt
                                      ? `Scheduled: ${new Date(booking.scheduledAt).toLocaleDateString()}`
                                      : `Booked: ${new Date(booking.createdAt).toLocaleDateString()}`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {booking.actualDuration || booking.estimatedDuration} minutes
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4" />
                                  <span>₹{booking.totalAmount?.toLocaleString()}</span>
                                </div>
                                {booking.status === 'completed' && booking.provider?.hourlyRate && (
                                  <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span className="text-xs">Rate this service</span>
                                  </div>
                                )}
                              </div>

                              {booking.notes && (
                                <p className="text-sm text-muted-foreground">
                                  <strong>Notes:</strong> {booking.notes}
                                </p>
                              )}

                              {booking.paymentStatus && (
                                <Badge variant={booking.paymentStatus === 'paid' ? 'default' : 'outline'}>
                                  Payment: {booking.paymentStatus}
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-col gap-2">
                              <Button
                                variant="outline"
                                onClick={() => navigate(`/bookings/${booking._id}`)}
                              >
                                View Details
                              </Button>
                              {['pending', 'accepted'].includes(booking.status) && user?.role === 'customer' && (
                                <Button
                                  variant="destructive"
                                  onClick={() => handleCancel(booking._id)}
                                >
                                  Cancel Booking
                                </Button>
                              )}
                              {booking.status === 'completed' && user?.role === 'customer' && (
                                <Button
                                  variant="outline"
                                  onClick={() => navigate(`/bookings/${booking._id}/rate`)}
                                >
                                  <Star className="w-4 h-4 mr-2" />
                                  Rate Service
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No bookings found</p>
                    {user?.role === 'customer' && (
                      <Button onClick={() => navigate('/search')}>
                        Browse Providers
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

