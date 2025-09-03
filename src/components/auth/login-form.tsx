import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Building2, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function LoginForm({ onSuccess, className }: LoginFormProps) {
  const { signInWithEmail, signInWithAzure, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    isInternal: false,
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signInWithEmail(
      signInData.email,
      signInData.password
    );

    if (error) {
      setError(error.message || 'Failed to sign in');
    } else {
      onSuccess?.();
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const { error } = await signUp(signUpData.email, signUpData.password, {
      first_name: signUpData.firstName,
      last_name: signUpData.lastName,
      phone: signUpData.phone,
      is_internal: signUpData.isInternal,
    });

    if (error) {
      setError(error.message || 'Failed to create account');
    } else {
      setSuccess(
        'Account created successfully! Please check your email to verify your account.'
      );
      setSignUpData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        isInternal: false,
      });
    }

    setLoading(false);
  };

  const handleAzureSignIn = async () => {
    setLoading(true);
    setError(null);

    const { error } = await signInWithAzure();

    if (error) {
      setError(error.message || 'Failed to sign in with Azure AD');
    }

    setLoading(false);
  };

  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center bg-gradient-to-br from-background-50 via-white to-primary-50 p-4',
        className
      )}
    >
      <div className="w-full max-w-md">
        {/* Welcome Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-primary-100 p-8">
          {/* Logo/Icon */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-charcoal-900 to-primary-600 bg-clip-text text-transparent mb-2">
              Welcome to MDM Hub
            </h1>
            <p className="text-charcoal-600 text-sm">
              Sign in to your account or create a new one
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={value => setActiveTab(value as 'signin' | 'signup')}
          >
            <TabsList className="grid w-full grid-cols-2 bg-primary-50 p-1 rounded-xl mb-6">
              <TabsTrigger
                value="signin"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary-700"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary-700"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {error && (
              <Alert className="mt-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4" variant="default">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="signin" className="space-y-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={signInData.email}
                    onChange={e =>
                      setSignInData({ ...signInData, email: e.target.value })
                    }
                    leftIcon={<Mail className="h-4 w-4 text-primary-500" />}
                    className="h-12 rounded-xl border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={signInData.password}
                    onChange={e =>
                      setSignInData({ ...signInData, password: e.target.value })
                    }
                    leftIcon={<Lock className="h-4 w-4 text-primary-500" />}
                    className="h-12 rounded-xl border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  loading={loading}
                >
                  Sign In
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-primary-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-charcoal-500 font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-12 border-primary-200 hover:bg-primary-50 hover:border-primary-300 rounded-xl transition-all duration-200"
                onClick={handleAzureSignIn}
                disabled={loading}
              >
                <Building2 className="mr-2 h-4 w-4 text-primary-600" />
                Sign in with Microsoft
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    placeholder="First Name"
                    value={signUpData.firstName}
                    onChange={e =>
                      setSignUpData({
                        ...signUpData,
                        firstName: e.target.value,
                      })
                    }
                    leftIcon={<User className="h-4 w-4 text-primary-500" />}
                    className="h-12 rounded-xl border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Last Name"
                    value={signUpData.lastName}
                    onChange={e =>
                      setSignUpData({ ...signUpData, lastName: e.target.value })
                    }
                    leftIcon={<User className="h-4 w-4 text-primary-500" />}
                    className="h-12 rounded-xl border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={signUpData.email}
                    onChange={e =>
                      setSignUpData({ ...signUpData, email: e.target.value })
                    }
                    leftIcon={<Mail className="h-4 w-4 text-primary-500" />}
                    className="h-12 rounded-xl border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={signUpData.phone}
                    onChange={e =>
                      setSignUpData({ ...signUpData, phone: e.target.value })
                    }
                    leftIcon={<Phone className="h-4 w-4 text-primary-500" />}
                    className="h-12 rounded-xl border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={signUpData.password}
                    onChange={e =>
                      setSignUpData({ ...signUpData, password: e.target.value })
                    }
                    leftIcon={<Lock className="h-4 w-4 text-primary-500" />}
                    className="h-12 rounded-xl border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={signUpData.confirmPassword}
                    onChange={e =>
                      setSignUpData({
                        ...signUpData,
                        confirmPassword: e.target.value,
                      })
                    }
                    leftIcon={<Lock className="h-4 w-4 text-primary-500" />}
                    className="h-12 rounded-xl border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  loading={loading}
                >
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
