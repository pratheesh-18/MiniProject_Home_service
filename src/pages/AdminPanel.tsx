import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { adminAPI } from '@/lib/api';
import { Loader2, Users, BookOpen, DollarSign, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

interface BookingStats {
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  emergencyBookings: number;
  revenue: number;
  completionRate: number;
}

interface ProviderStats {
  totalProviders: number;
  verifiedProviders: number;
  availableProviders: number;
  topRatedProviders: any[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

export default function AdminPanel() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [providerStats, setProviderStats] = useState<ProviderStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [bookingData, providerData, usersData] = await Promise.all([
        adminAPI.getBookingStatistics(),
        adminAPI.getProviderStatistics(),
        adminAPI.getUsers({ limit: 100 }),
      ]);

      setBookingStats(bookingData);
      setProviderStats(providerData);
      setUsers(usersData);
    } catch (error: any) {
      toast({
        title: 'Error loading data',
        description: error.message || 'Failed to load admin data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProvider = async (providerId: string, verified: boolean) => {
    try {
      await adminAPI.verifyProvider(providerId, verified);
      toast({
        title: 'Success',
        description: `Provider ${verified ? 'verified' : 'unverified'} successfully`,
      });
      loadDashboardData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update provider verification',
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, providers, and bookings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Booking Statistics */}
            {bookingStats && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{bookingStats.totalBookings}</div>
                    <p className="text-xs text-muted-foreground">
                      {bookingStats.completedBookings} completed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{bookingStats.pendingBookings}</div>
                    <p className="text-xs text-muted-foreground">
                      {bookingStats.emergencyBookings} emergency
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{bookingStats.revenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {bookingStats.completionRate.toFixed(1)}% completion rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{bookingStats.cancelledBookings}</div>
                    <p className="text-xs text-muted-foreground">
                      {((bookingStats.cancelledBookings / bookingStats.totalBookings) * 100).toFixed(1)}% cancellation rate
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Provider Statistics */}
            {providerStats && (
              <Card>
                <CardHeader>
                  <CardTitle>Provider Statistics</CardTitle>
                  <CardDescription>Overview of service providers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Providers</p>
                      <p className="text-2xl font-bold">{providerStats.totalProviders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Verified</p>
                      <p className="text-2xl font-bold">{providerStats.verifiedProviders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Available</p>
                      <p className="text-2xl font-bold">{providerStats.availableProviders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage system users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.isVerified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="providers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Providers</CardTitle>
                <CardDescription>Manage service providers</CardDescription>
              </CardHeader>
              <CardContent>
                {providerStats?.topRatedProviders && providerStats.topRatedProviders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Provider</TableHead>
                        <TableHead>Services</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Hourly Rate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {providerStats.topRatedProviders.map((provider: any) => (
                        <TableRow key={provider._id}>
                          <TableCell className="font-medium">
                            {provider.user?.name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {provider.services?.slice(0, 2).map((service: string) => (
                                <Badge key={service} variant="outline" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                              {provider.services?.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{provider.services.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span>{provider.rating?.toFixed(1)}</span>
                              <span className="text-muted-foreground">
                                ({provider.totalRatings})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>₹{provider.hourlyRate}</TableCell>
                          <TableCell>
                            {provider.isVerified ? (
                              <Badge variant="default">Verified</Badge>
                            ) : (
                              <Badge variant="secondary">Unverified</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant={provider.isVerified ? 'outline' : 'default'}
                              onClick={() => handleVerifyProvider(provider._id, !provider.isVerified)}
                            >
                              {provider.isVerified ? 'Unverify' : 'Verify'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No providers found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

