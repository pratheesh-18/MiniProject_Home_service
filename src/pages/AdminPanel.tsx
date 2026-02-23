import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { adminAPI } from '@/lib/api';
import {
  Loader2, Users, BookOpen, DollarSign, CheckCircle, XCircle,
  TrendingUp, Shield, Star, AlertTriangle, Search, RefreshCw,
  UserCheck, UserX, BarChart3, Activity, Clock, Phone, Mail
} from 'lucide-react';

// ─── Interfaces ───────────────────────────────────────────────────────────────

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
  profilePicture?: string;
  createdAt: string;
}

type ActiveTab = 'dashboard' | 'users' | 'providers' | 'bookings';

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  title, value, sub, icon: Icon, color, delay = 0,
}: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="border-border hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Avatar helper ────────────────────────────────────────────────────────────
function UserAvatar({ user }: { user: { name: string; profilePicture?: string } }) {
  return user.profilePicture ? (
    <img src={user.profilePicture} alt={user.name}
      className="w-8 h-8 rounded-full object-cover border border-border flex-shrink-0" />
  ) : (
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-semibold text-primary">{user.name.charAt(0).toUpperCase()}</span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [providerStats, setProviderStats] = useState<ProviderStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [bookingData, providerData, usersData] = await Promise.all([
        adminAPI.getBookingStatistics(),
        adminAPI.getProviderStatistics(),
        adminAPI.getUsers({ limit: 200 }),
      ]);
      setBookingStats(bookingData);
      setProviderStats(providerData);
      setUsers(usersData);
    } catch (error: any) {
      toast({ title: 'Error loading data', description: error.message || 'Failed to load admin data', variant: 'destructive' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleVerifyProvider = async (providerId: string, verified: boolean) => {
    try {
      await adminAPI.verifyProvider(providerId, verified);
      toast({ title: 'Success', description: `Provider ${verified ? 'verified' : 'unverified'} successfully` });
      loadDashboardData(true);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update provider verification', variant: 'destructive' });
    }
  };

  // ─── Filters ────────────────────────────────────────────────────────────────
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !userSearch ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  const customerCount = users.filter((u) => u.role === 'customer').length;
  const providerCount = users.filter((u) => u.role === 'provider').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading admin data…</p>
        </div>
      </Layout>
    );
  }

  // ─── Tab buttons ────────────────────────────────────────────────────────────
  const tabs: { key: ActiveTab; label: string; icon: React.ElementType }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'users', label: `Users (${users.length})`, icon: Users },
    { key: 'providers', label: `Providers (${providerStats?.totalProviders ?? 0})`, icon: UserCheck },
    { key: 'bookings', label: 'Bookings', icon: BookOpen },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-3xl font-bold">Admin Panel</h1>
            </div>
            <p className="text-muted-foreground">Manage your platform — users, providers & bookings</p>
          </div>
          <Button variant="outline" onClick={() => loadDashboardData(true)} disabled={refreshing} className="gap-2 self-start">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>

        {/* Tab Nav */}
        <div className="flex gap-1 bg-muted p-1 rounded-xl w-full overflow-x-auto mb-6">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Booking KPIs */}
            {bookingStats && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Bookings" value={bookingStats.totalBookings} sub={`${bookingStats.completedBookings} completed`} icon={BookOpen} color="bg-blue-500" delay={0.0} />
                <StatCard title="Pending" value={bookingStats.pendingBookings} sub={`${bookingStats.emergencyBookings} emergency`} icon={Clock} color="bg-amber-500" delay={0.1} />
                <StatCard title="Total Revenue" value={`₹${bookingStats.revenue.toLocaleString()}`} sub={`${bookingStats.completionRate.toFixed(1)}% completion`} icon={DollarSign} color="bg-green-500" delay={0.2} />
                <StatCard title="Cancelled" value={bookingStats.cancelledBookings} sub={`${((bookingStats.cancelledBookings / (bookingStats.totalBookings || 1)) * 100).toFixed(1)}% rate`} icon={XCircle} color="bg-red-500" delay={0.3} />
              </div>
            )}

            {/* Provider + User KPIs */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Total Providers" value={providerStats?.totalProviders ?? 0} sub={`${providerStats?.verifiedProviders ?? 0} verified`} icon={UserCheck} color="bg-teal-500" delay={0.4} />
              <StatCard title="Available Now" value={providerStats?.availableProviders ?? 0} sub="Currently online" icon={Activity} color="bg-emerald-500" delay={0.5} />
              <StatCard title="Total Users" value={users.length} sub={`${customerCount} customers · ${adminCount} admins`} icon={Users} color="bg-violet-500" delay={0.6} />
              <StatCard title="Emergency Calls" value={bookingStats?.emergencyBookings ?? 0} sub="Across all time" icon={AlertTriangle} color="bg-rose-500" delay={0.7} />
            </div>

            {/* Completion Meter */}
            {bookingStats && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Booking Completion Rate
                    </CardTitle>
                    <CardDescription>How many bookings are successfully fulfilled</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                        <div
                          className="h-4 rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-1000"
                          style={{ width: `${Math.min(bookingStats.completionRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-xl font-bold text-foreground whitespace-nowrap">
                        {bookingStats.completionRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between mt-3 text-sm text-muted-foreground">
                      <span>✅ Completed: {bookingStats.completedBookings}</span>
                      <span>⏳ Pending: {bookingStats.pendingBookings}</span>
                      <span>❌ Cancelled: {bookingStats.cancelledBookings}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Top Rated Providers Quick View */}
            {providerStats?.topRatedProviders && providerStats.topRatedProviders.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Top Rated Providers
                    </CardTitle>
                    <CardDescription>Highest rated service providers on the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {providerStats.topRatedProviders.slice(0, 5).map((p: any, i: number) => (
                        <div key={p._id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {i + 1}
                          </span>
                          {p.user?.profilePicture ? (
                            <img src={p.user.profilePicture} alt={p.user?.name}
                              className="w-9 h-9 rounded-full object-cover border border-border" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {(p.user?.name || 'P').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{p.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{p.services?.slice(0, 2).join(', ')}</p>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{p.rating?.toFixed(1)}</span>
                            <span className="text-muted-foreground">({p.totalRatings})</span>
                          </div>
                          <Badge variant={p.isVerified ? 'default' : 'secondary'} className="text-xs">
                            {p.isVerified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}

        {/* ── USERS TAB ─────────────────────────────────────────────────────── */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

            {/* Role pill summary */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'All', value: 'all', count: users.length, color: 'bg-muted' },
                { label: 'Customers', value: 'customer', count: customerCount, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
                { label: 'Providers', value: 'provider', count: providerCount, color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' },
                { label: 'Admins', value: 'admin', count: adminCount, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
              ].map((r) => (
                <button
                  key={r.value}
                  onClick={() => setUserRoleFilter(r.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${userRoleFilter === r.value ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'
                    } ${r.color}`}
                >
                  {r.label} ({r.count})
                </button>
              ))}
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>Showing {filteredUsers.length} of {users.length} users</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email…"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user._id} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <UserAvatar user={user} />
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Mail className="w-3 h-3" /> {user.email}
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Phone className="w-3 h-3" /> {user.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : user.role === 'provider' ? 'secondary' : 'outline'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.isVerified ? (
                              <span className="flex items-center gap-1 text-green-600 text-sm">
                                <CheckCircle className="w-4 h-4" /> Verified
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-muted-foreground text-sm">
                                <XCircle className="w-4 h-4" /> Unverified
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredUsers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                            No users match your search
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── PROVIDERS TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'providers' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

            {/* Provider KPI row */}
            {providerStats && (
              <div className="grid grid-cols-3 gap-4">
                <Card className="text-center p-4">
                  <p className="text-2xl font-bold">{providerStats.totalProviders}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </Card>
                <Card className="text-center p-4">
                  <p className="text-2xl font-bold text-green-600">{providerStats.verifiedProviders}</p>
                  <p className="text-sm text-muted-foreground">Verified</p>
                </Card>
                <Card className="text-center p-4">
                  <p className="text-2xl font-bold text-blue-600">{providerStats.availableProviders}</p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>All Providers</CardTitle>
                <CardDescription>Verify, suspend, or review service providers</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {providerStats?.topRatedProviders && providerStats.topRatedProviders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Provider</TableHead>
                          <TableHead>Services</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {providerStats.topRatedProviders.map((provider: any) => (
                          <TableRow key={provider._id} className="hover:bg-muted/30">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {provider.user?.profilePicture ? (
                                  <img src={provider.user.profilePicture} alt={provider.user?.name}
                                    className="w-8 h-8 rounded-full object-cover border border-border flex-shrink-0" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-semibold text-primary">
                                      {(provider.user?.name || 'P').charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium">{provider.user?.name || 'N/A'}</p>
                                  <p className="text-xs text-muted-foreground">{provider.user?.email || ''}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-[180px]">
                                {provider.services?.slice(0, 2).map((s: string) => (
                                  <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                                ))}
                                {provider.services?.length > 2 && (
                                  <Badge variant="outline" className="text-xs">+{provider.services.length - 2}</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{provider.rating?.toFixed(1)}</span>
                                <span className="text-muted-foreground text-sm">({provider.totalRatings})</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">₹{provider.hourlyRate}/hr</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Badge variant={provider.isVerified ? 'default' : 'secondary'}>
                                  {provider.isVerified ? '✓ Verified' : '⏳ Pending'}
                                </Badge>
                                {provider.isAvailable && (
                                  <Badge variant="outline" className="text-xs text-green-600 border-green-300">Available</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={provider.isVerified ? 'outline' : 'default'}
                                  onClick={() => handleVerifyProvider(provider._id, !provider.isVerified)}
                                  className="gap-1 text-xs"
                                >
                                  {provider.isVerified ? (
                                    <><UserX className="w-3 h-3" />Unverify</>
                                  ) : (
                                    <><UserCheck className="w-3 h-3" />Verify</>
                                  )}
                                </Button>
                                <Button size="sm" variant="ghost" className="text-xs"
                                  onClick={() => navigate(`/provider/${provider._id}`)}>
                                  View
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No providers found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── BOOKINGS TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {bookingStats && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="p-6">
                  <p className="text-muted-foreground text-sm mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold">{bookingStats.totalBookings}</p>
                </Card>
                <Card className="p-6">
                  <p className="text-muted-foreground text-sm mb-1">Completion Rate</p>
                  <p className="text-3xl font-bold text-green-600">{bookingStats.completionRate.toFixed(1)}%</p>
                </Card>
                <Card className="p-6">
                  <p className="text-muted-foreground text-sm mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-primary">₹{bookingStats.revenue.toLocaleString()}</p>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Booking Breakdown</CardTitle>
                <CardDescription>Status distribution across all bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {bookingStats ? (
                  <div className="space-y-4">
                    {[
                      { label: 'Completed', value: bookingStats.completedBookings, total: bookingStats.totalBookings, color: 'bg-green-500' },
                      { label: 'Pending', value: bookingStats.pendingBookings, total: bookingStats.totalBookings, color: 'bg-amber-500' },
                      { label: 'Cancelled', value: bookingStats.cancelledBookings, total: bookingStats.totalBookings, color: 'bg-red-500' },
                      { label: 'Emergency', value: bookingStats.emergencyBookings, total: bookingStats.totalBookings, color: 'bg-rose-600' },
                    ].map(({ label, value, total, color }) => {
                      const pct = total ? ((value / total) * 100).toFixed(1) : '0.0';
                      return (
                        <div key={label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{label}</span>
                            <span className="text-muted-foreground">{value} ({pct}%)</span>
                          </div>
                          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                            <div className={`h-2.5 ${color} rounded-full transition-all duration-700`}
                              style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No booking data available</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

      </div>
    </Layout>
  );
}
