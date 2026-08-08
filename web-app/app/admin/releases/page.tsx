'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Plus, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Release {
  id: string;
  version: string;
  fileName: string;
  fileSize: number;
  r2Key: string;
  changelog: string | null;
  releaseNotes: string | null;
  isProduction: boolean;
  isLatest: boolean;
  createdAt: string;
}

export default function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    version: '',
    changelog: '',
    releaseNotes: '',
    isProduction: false,
    isLatest: false,
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchReleases();
  }, []);

  const fetchReleases = async () => {
    try {
      const response = await fetch('/api/admin/releases');
      if (response.ok) {
        const data = await response.json();
        setReleases(data);
      }
    } catch (error) {
      console.error('Failed to fetch releases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formDataToSend = new FormData();
    formDataToSend.append('file', file);
    formDataToSend.append('version', formData.version);
    formDataToSend.append('changelog', formData.changelog);
    formDataToSend.append('releaseNotes', formData.releaseNotes);
    formDataToSend.append('isProduction', formData.isProduction.toString());
    formDataToSend.append('isLatest', formData.isLatest.toString());

    try {
      const response = await fetch('/api/admin/releases', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setDialogOpen(false);
        setFormData({ version: '', changelog: '', releaseNotes: '', isProduction: false, isLatest: false });
        setFile(null);
        fetchReleases();
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this release?')) return;

    try {
      const response = await fetch(`/api/admin/releases/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchReleases();
      } else {
        alert('Delete failed');
      }
    } catch (error) {
      alert('Delete failed');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Releases</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Release
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Release</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="file">APK File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".apk"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="changelog">Changelog</Label>
                <Textarea
                  id="changelog"
                  value={formData.changelog}
                  onChange={(e) => setFormData({ ...formData, changelog: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="releaseNotes">Release Notes</Label>
                <Textarea
                  id="releaseNotes"
                  value={formData.releaseNotes}
                  onChange={(e) => setFormData({ ...formData, releaseNotes: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isProduction"
                  checked={formData.isProduction}
                  onCheckedChange={(checked) => setFormData({ ...formData, isProduction: checked })}
                />
                <Label htmlFor="isProduction">Production Release</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isLatest"
                  checked={formData.isLatest}
                  onCheckedChange={(checked) => setFormData({ ...formData, isLatest: checked })}
                />
                <Label htmlFor="isLatest">Latest Release</Label>
              </div>
              <Button type="submit" disabled={uploading} className="w-full">
                {uploading ? 'Uploading...' : 'Upload Release'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Production</TableHead>
                <TableHead>Latest</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {releases.map((release) => (
                <TableRow key={release.id}>
                  <TableCell className="font-medium">{release.version}</TableCell>
                  <TableCell>{release.fileName}</TableCell>
                  <TableCell>{formatFileSize(release.fileSize)}</TableCell>
                  <TableCell>{release.isProduction ? '✓' : '-'}</TableCell>
                  <TableCell>{release.isLatest ? '✓' : '-'}</TableCell>
                  <TableCell>{new Date(release.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(release.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
