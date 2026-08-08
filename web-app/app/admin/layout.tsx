'use client';

import { AuthProvider, useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Package, Users, FileText, BarChart3, Home } from 'lucide-react';
import Link from 'next/link';

function AdminNav({ children }: { children: React.ReactNode }) {
  const { customUser, loading, customUserLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || customUserLoading) return;
    if (!customUser || !customUser.isAdmin) {
      router.push('/');
    }
  }, [customUser, loading, customUserLoading, router]);

  if (loading || customUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!customUser || !customUser.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/admin"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <Link
                  href="/admin/releases"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Releases
                </Link>
                <Link
                  href="/admin/users"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </Link>
                <Link
                  href="/admin/requests"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Requests
                </Link>
                <Link
                  href="/admin/analytics"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Button
                onClick={signOut}
                variant="ghost"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminNav>{children}</AdminNav>
    </AuthProvider>
  );
}