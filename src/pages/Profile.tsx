import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/useAppStore';
import { authAPI } from '@/lib/api';
import { Loader2, User, Mail, Phone, Shield, Briefcase, ArrowLeft } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, setUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<{
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: 'customer' | 'provider' | 'admin';
    createdAt?: string;
  } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await authAPI.getCurrentUser();
      setProfileData({
        _id: data._id || data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        createdAt: data.createdAt,
      });
    } catch (error: any) {
      toast({
        title: 'Error loading profile',
        description: error.message || 'Failed to load profile',
        variant: 'destructive',
      });
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      customer: 'secondary',
      provider: 'default',
      admin: 'destructive',
    };

    const icons: Record<string, JSX.Element> = {
      customer: <User className="w-3 h-3" />,
      provider: <Briefcase className="w-3 h-3" />,
      admin: <Shield className="w-3 h-3" />,
    };

    return (
      <Badge variant={variants[role] || 'outline'} className="gap-1">
        {icons[role]}
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
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

  if (!profileData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Failed to load profile</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">View your account details</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your personal details and account information</CardDescription>
              </div>
              {getRoleBadge(profileData.role)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Name */}
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-accent">
                  <User className="w-5 h-5 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-lg font-semibold mt-1">{profileData.name}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-accent">
                  <Mail className="w-5 h-5 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg font-semibold mt-1">{profileData.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-accent">
                  <Phone className="w-5 h-5 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-lg font-semibold mt-1">{profileData.phone}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-accent">
                  {profileData.role === 'admin' ? (
                    <Shield className="w-5 h-5 text-accent-foreground" />
                  ) : profileData.role === 'provider' ? (
                    <Briefcase className="w-5 h-5 text-accent-foreground" />
                  ) : (
                    <User className="w-5 h-5 text-accent-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <p className="text-lg font-semibold mt-1">
                    {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
                  </p>
                  {profileData.role === 'customer' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Switch to Provider role in Settings to start offering services
                    </p>
                  )}
                </div>
              </div>

              {profileData.createdAt && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(profileData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t flex gap-3">
                <Button onClick={() => navigate('/settings')} className="flex-1">
                  Edit Settings
                </Button>
                <Button variant="outline" onClick={() => navigate('/bookings')} className="flex-1">
                  View Bookings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
