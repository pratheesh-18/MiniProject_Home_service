import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/useAppStore';
import { authAPI } from '@/lib/api';
import { Loader2, ArrowLeft, User, Briefcase, AlertCircle, CheckCircle } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, setUser } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentRole, setCurrentRole] = useState<'customer' | 'provider' | 'admin'>(
    user?.role || 'customer'
  );

  useEffect(() => {
    if (user) {
      setCurrentRole(user.role);
    }
  }, [user]);

  const handleRoleChange = async (newRole: 'customer' | 'provider') => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please log in to change your role',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (user.role === 'admin') {
      toast({
        title: 'Cannot change role',
        description: 'Admin role cannot be changed',
        variant: 'destructive',
      });
      return;
    }

    if (newRole === currentRole) {
      return;
    }

    setSaving(true);
    try {
      // Update role via API
      const updatedUser = await authAPI.updateProfile({ role: newRole });
      
      // Update local state
      setUser({
        ...user,
        role: newRole,
      });
      setCurrentRole(newRole);

      toast({
        title: 'Role updated successfully',
        description: `Your role has been changed to ${newRole}.`,
      });

      // If switching to provider, redirect to provider dashboard
      if (newRole === 'provider') {
        setTimeout(() => {
          navigate('/provider/dashboard');
        }, 1500);
      }
    } catch (error: any) {
      toast({
        title: 'Error updating role',
        description: error.message || 'Failed to update role',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
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
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Update your account preferences and role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Change Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Account Role</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Change your role between Customer and Provider
                  </p>
                </div>
                <Badge variant={currentRole === 'provider' ? 'default' : 'secondary'}>
                  {currentRole === 'provider' ? (
                    <Briefcase className="w-3 h-3 mr-1" />
                  ) : (
                    <User className="w-3 h-3 mr-1" />
                  )}
                  {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
                </Badge>
              </div>

              {user?.role === 'admin' ? (
                <div className="p-4 rounded-lg bg-muted border border-border">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Admin Role</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Admin role cannot be changed. You have full access to all features.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Select
                    value={currentRole}
                    onValueChange={(value) => handleRoleChange(value as 'customer' | 'provider')}
                    disabled={saving}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Customer</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="provider">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          <span>Provider</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {currentRole === 'customer' && (
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-900 dark:text-blue-100">
                            Customer Role
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            As a customer, you can book services from providers. Switch to Provider
                            role to start offering your services.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentRole === 'provider' && (
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-900 dark:text-green-100">
                            Provider Role
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            As a provider, you can offer services, manage bookings, and access the
                            Provider Dashboard.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {saving && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating role...</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => navigate('/profile')}
                className="w-full"
              >
                View Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
