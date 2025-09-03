'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAzureAuth } from '@/hooks/use-azure-auth';
import { LoadingPage } from '@/components/ui/loading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/Button';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { isConfigured, isInitialized, error } = useAzureAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (!isConfigured) {
          setStatus('error');
          setMessage('Azure AD is not configured');
          return;
        }

        if (!isInitialized) {
          setMessage('Initializing Azure AD...');
          return;
        }

        // The useAzureAuth hook will automatically handle the callback
        // We just need to wait a moment and then redirect
        setTimeout(() => {
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        }, 1000);
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('Authentication failed. Please try again.');
      }
    };

    handleCallback();
  }, [isConfigured, isInitialized, router]);

  if (status === 'loading') {
    return (
      <LoadingPage 
        text={message}
        className="min-h-screen"
      />
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="mt-2">
              {message}
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 space-y-2">
            <Button 
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Back to Login
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-4">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Authentication Successful
        </h2>
        <p className="text-gray-600 mb-4">
          {message}
        </p>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}
