'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Shield, ShieldCheck, ShieldX } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  isApproved: boolean;
  createdAt: string;
  lastDownload: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !currentStatus }),
      });

      if (response.ok) {
        fetchUsers();
      } else {
        alert('Update failed');
      }
    } catch (error) {
      alert('Update failed');
    }
  };

  const toggleApproved = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: !currentStatus }),
      });

      if (response.ok) {
        fetchUsers();
      } else {
        alert('Update failed');
      }
    } catch (error) {
      alert('Update failed');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Users</h2>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.name || '-'}</TableCell>
                  <TableCell>
                    <Switch
                      checked={user.isAdmin}
                      onCheckedChange={() => toggleAdmin(user.id, user.isAdmin)}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={user.isApproved}
                      onCheckedChange={() => toggleApproved(user.id, user.isApproved)}
                    />
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {user.lastDownload ? new Date(user.lastDownload).toLocaleDateString() : 'Never'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
