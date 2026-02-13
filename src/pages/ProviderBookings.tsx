import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { bookingsAPI } from '@/lib/api';
import { Loader2, Calendar, MapPin, Clock, User, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Booking {
  _id: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
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
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  notes?: string;
  emergency: boolean;
  createdAt: string;
}

export default function ProviderBookings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingsAPI.getMyBookings({ limit: 100, role: 'provider' });
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

  const handleAccept = async (bookingId: string) => {
    try {
      await bookingsAPI.accept(bookingId);
      toast({
        title: 'Booking accepted',
        description: 'You have accepted this booking',
      });
      loadBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept booking',
        variant: 'destructive',
      });
    }
  };

  const handleStart = async (bookingId: string) => {
    try {
      await bookingsAPI.start(bookingId);
      toast({
        title: 'Booking started',
        description: 'You have started this booking',
      });
      loadBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start booking',
        variant: 'destructive',
      });
    }
  };

  const handleComplete = async (bookingId: string) => {
    try {
      await bookingsAPI.complete(bookingId);
      toast({
        title: 'Booking completed',
        description: 'Booking has been marked as completed',
      });
      loadBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete booking',
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
          <p className="text-muted-foreground">Manage and track your service bookings</p>
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
              <p className="text-xs text-muted-foreground">Requires action</p>
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

        {/* Bookings Table */}
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
                      <Card
                        key={booking._id}
                        className={`border-l-8 shadow-sm ${booking.emergency
                          ? 'bg-red-100 border-l-red-600 dark:bg-red-900/10'
                          : 'bg-green-100 border-l-green-600 dark:bg-green-900/10'
                          }`}
                      >
                        <CardContent className="pt-6">
                          {/* Explicit Label */}
                          <div className={`font-extrabold uppercase tracking-wider text-sm mb-4 flex items-center gap-2 ${booking.emergency ? 'text-red-700' : 'text-green-700'
                            }`}>
                            {booking.emergency ? (
                              <>
                                <AlertCircle className="w-5 h-5" />
                                <span>Emergency Service</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                <span>Normal Service</span>
                              </>
                            )}
                          </div>
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg">{booking.service}</h3>
                                {booking.emergency && (
                                  <Badge variant="destructive">Emergency</Badge>
                                )}
                                {getStatusBadge(booking.status)}
                              </div>

                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span>{booking.customer?.name || 'Customer'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  <span>{booking.location?.address}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {booking.scheduledAt
                                      ? new Date(booking.scheduledAt).toLocaleString()
                                      : 'Not scheduled'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{booking.estimatedDuration} minutes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4" />
                                  <span>₹{booking.totalAmount?.toLocaleString()}</span>
                                </div>
                              </div>

                              {booking.notes && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  <strong>Notes:</strong> {booking.notes}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col gap-2">
                              {booking.status === 'pending' && (
                                <Button onClick={() => handleAccept(booking._id)}>
                                  Accept Booking
                                </Button>
                              )}
                              {booking.status === 'accepted' && (
                                <Button onClick={() => handleStart(booking._id)}>
                                  Start Service
                                </Button>
                              )}
                              {booking.status === 'started' && (
                                <button
                                  onClick={() => handleComplete(booking._id)}
                                  className="group flex items-center gap-3 bg-white/80 hover:bg-white px-4 py-2 rounded-lg shadow-sm transition-all border border-gray-200 cursor-pointer"
                                  title="Click to complete this job"
                                >
                                  <span className="font-semibold text-gray-700 group-hover:text-green-700">Mark Completed</span>
                                  <div className="h-8 w-8 rounded border-2 border-gray-400 group-hover:border-green-600 flex items-center justify-center bg-white transition-colors">
                                    <CheckCircle className="w-6 h-6 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </button>
                              )}
                              <Button
                                variant="outline"
                                onClick={() => navigate(`/bookings/${booking._id}`)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No bookings found</p>
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

