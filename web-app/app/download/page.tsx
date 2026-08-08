'use client';

import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Download, Lock, LogOut, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function DownloadPage() {
  const { user, customUser, loading, signOut } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    console.log('Download page state:', { user: !!user, customUser: !!customUser, loading });
    console.log('Current URL:', window.location.href);
  }, [user, customUser, loading]);

  const handleGoogleLogin = async () => {
    console.log('Initiating Google login');
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/download/latest');
      if (response.ok) {
        const { downloadUrl } = await response.json();
        window.location.href = downloadUrl;
      } else {
        const error = await response.json();
        alert(error.error || 'Download failed');
      }
    } catch (error) {
      alert('Download failed');
    }
  };

  const handleRequestAccess = async () => {
    try {
      const response = await fetch('/api/access/request', { method: 'POST' });
      if (response.ok) {
        alert('Access request submitted successfully');
      } else {
        const error = await response.json();
        alert(error.error || 'Request failed');
      }
    } catch (error) {
      alert('Request failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Horashtak
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Download App</h1>
          <p className="text-gray-600">Get the latest version of our mobile app</p>
        </div>

        {!user ? (
          <div className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <User className="mr-2 h-5 w-5" />
              Sign in with Google
            </Button>
            <p className="text-center text-sm text-gray-500">
              Sign in to download the app
            </p>
          </div>
        ) : customUser?.isApproved ? (
          <div className="space-y-4">
            <Button
              onClick={handleDownload}
              className="w-full h-16 text-xl bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Download className="mr-2 h-6 w-6" />
              Download Latest App
            </Button>
            <Button
              onClick={signOut}
              variant="outline"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <Lock className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Access Pending</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your account is waiting for approval. Request access to download the app.
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleRequestAccess}
              className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Request Access
            </Button>
            <Button
              onClick={signOut}
              variant="outline"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        )}
      </div>

      {customUser?.isAdmin && (
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/admin')}
          >
            Admin Panel
          </Button>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500 space-x-4">
        <Link href="/privacy" className="hover:text-gray-700">
          Privacy Policy
        </Link>
        <Link href="/terms" className="hover:text-gray-700">
          Terms of Service
        </Link>
      </div>
    </div>
  );
}
