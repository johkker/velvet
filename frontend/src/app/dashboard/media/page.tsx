'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { uploadPhoto, fetchCurrentUser } from '@/lib/api';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import './page.css';

export default function DashboardMediaPage() {
  const { user, setUser } = useAuth();
  const [photos, setPhotos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.talentProfile?.photoGallery) {
      setPhotos(user.talentProfile.photoGallery);
    }
  }, [user]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const response = await uploadPhoto(file);
      alert('Photo uploaded successfully! Processing...');
      
      // Refresh user data to get updated photo list
      const userResponse = await fetchCurrentUser();
      if (userResponse?.data) {
        setUser(userResponse.data);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    
    // TODO: Implement DELETE /photos/:id endpoint in backend
    alert('Delete functionality coming soon');
  };

  const handleSetMainPhoto = async (photoId: string) => {
    // TODO: Implement PATCH /photos/:id/set-main endpoint in backend
    alert('Set main photo functionality coming soon');
  };

  return (
    <div className="media-container">
      <h1 className="media-title">Media Gallery</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="media-upload-input"
            id="photo-upload"
          />
          <label htmlFor="photo-upload">
            <div className="media-upload-zone">
              <div className="media-upload-text">
                {uploading ? (
                  <div>
                    <div className="text-lg font-medium">Uploading...</div>
                    <div className="text-sm">Please wait</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-lg font-medium">Click to upload</div>
                    <div className="text-sm">or drag and drop</div>
                    <div className="text-xs mt-1">PNG, JPG, GIF up to 5MB</div>
                  </div>
                )}
              </div>
            </div>
          </label>
        </CardContent>
      </Card>

      {photos.length === 0 ? (
        <Card>
          <CardContent className="media-empty">
            No photos uploaded yet. Upload your first photo to get started!
          </CardContent>
        </Card>
      ) : (
        <div className="media-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="media-item">
              <Image
                src={photo.url}
                alt="Talent photo"
                fill
                className="media-image"
              />
              {photo.isMain && (
                <div className="media-badge-main">
                  Main
                </div>
              )}
              <div className="media-overlay">
                <div className="media-actions">
                  {!photo.isMain && (
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleSetMainPhoto(photo.id)}
                    >
                      Set Main
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDeletePhoto(photo.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
