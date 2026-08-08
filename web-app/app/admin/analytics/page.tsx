'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from 'lucide-react';

interface DownloadData {
  id: string;
  downloadedAt: string;
  user: {
    email: string;
    name: string | null;
  };
  release: {
    version: string;
    fileName: string;
  };
}

export default function AnalyticsPage() {
  const [downloads, setDownloads] = useState<DownloadData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      if (response.ok) {
        const data = await response.json();
        setDownloads(data);
      }
    } catch (error) {
      console.error('Failed to fetch downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>;
  }

  const totalDownloads = downloads.length;
  const uniqueUsers = new Set(downloads.map(d => d.user.email)).size;
  const uniqueReleases = new Set(downloads.map(d => d.release.version)).size;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDownloads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Releases Downloaded</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueReleases}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Download History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Release</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Downloaded At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {downloads.map((download) => (
                <TableRow key={download.id}>
                  <TableCell className="font-medium">{download.user.email}</TableCell>
                  <TableCell>{download.release.fileName}</TableCell>
                  <TableCell>{download.release.version}</TableCell>
                  <TableCell>{new Date(download.downloadedAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
