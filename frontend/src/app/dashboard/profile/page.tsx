'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { ServiceSelector } from '@/components/molecules/ServiceSelector';
import { useAuth } from '@/lib/auth-context';
import { updateTalentProfile, fetchCurrentUser } from '@/lib/api';
import { validateServices } from '@/lib/services';
import './page.css';

export default function DashboardProfilePage() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    age: '',
    city: '',
    priceMin: '',
    services: [] as string[],
    // Physical attributes
    hairColor: '',
    eyeColor: '',
    bodyType: '',
    height: '',
    skinTone: '',
    ethnicity: '',
    tattoos: false,
    piercings: false,
    // Professional fields
    languages: [] as string[],
    availability: '',
    outcall: false,
    incall: false,
  });

  useEffect(() => {
    if (user?.talentProfile) {
      setFormData({
        displayName: user.talentProfile.displayName || '',
        bio: user.talentProfile.bio || '',
        age: user.talentProfile.age?.toString() || '',
        city: user.talentProfile.city || '',
        priceMin: user.talentProfile.priceMin?.toString() || '',
        services: user.talentProfile.services || [],
        hairColor: user.talentProfile.hairColor || '',
        eyeColor: user.talentProfile.eyeColor || '',
        bodyType: user.talentProfile.bodyType || '',
        height: user.talentProfile.height?.toString() || '',
        skinTone: user.talentProfile.skinTone || '',
        ethnicity: user.talentProfile.ethnicity || '',
        tattoos: user.talentProfile.tattoos || false,
        piercings: user.talentProfile.piercings || false,
        languages: user.talentProfile.languages || [],
        availability: user.talentProfile.availability || '',
        outcall: user.talentProfile.outcall || false,
        incall: user.talentProfile.incall || false,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate services
    const validation = validateServices(formData.services);
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.error || 'Invalid services' });
      setLoading(false);
      return;
    }

    try {
      const data: any = {
        displayName: formData.displayName,
        bio: formData.bio,
        city: formData.city,
        services: formData.services,
        // Physical attributes
        hairColor: formData.hairColor || undefined,
        eyeColor: formData.eyeColor || undefined,
        bodyType: formData.bodyType || undefined,
        skinTone: formData.skinTone || undefined,
        ethnicity: formData.ethnicity || undefined,
        tattoos: formData.tattoos,
        piercings: formData.piercings,
        // Professional fields
        languages: formData.languages,
        availability: formData.availability || undefined,
        outcall: formData.outcall,
        incall: formData.incall,
      };

      if (formData.age) data.age = parseInt(formData.age);
      if (formData.priceMin) data.priceMin = parseInt(formData.priceMin);
      if (formData.height) data.height = parseInt(formData.height);

      await updateTalentProfile(data);
      
      // Refresh user data
      const userResponse = await fetchCurrentUser();
      if (userResponse?.data) {
        setUser(userResponse.data);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-edit-container">
      <h1 className="profile-edit-title">Edit Profile</h1>
      
      {message && (
        <div className={`profile-message ${message.type === 'success' ? 'profile-message-success' : 'profile-message-error'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="form-section">
            <div className="form-group">
              <Label htmlFor="displayName">Display Name</Label>
              <Input 
                id="displayName" 
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <Label htmlFor="bio">Bio</Label>
              <textarea 
                id="bio" 
                className="form-textarea"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell clients about yourself..."
              />
            </div>

            <div className="form-group-double">
              <div className="form-group">
                <Label htmlFor="age">Age</Label>
                <Input 
                  id="age" 
                  type="number" 
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  min="18"
                />
              </div>
              <div className="form-group">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <Label htmlFor="priceMin">Starting Price ($)</Label>
              <Input 
                id="priceMin" 
                type="number" 
                value={formData.priceMin}
                onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                min="0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Physical Attributes Section */}
        <Card>
          <CardHeader>
            <CardTitle>Physical Attributes</CardTitle>
          </CardHeader>
          <CardContent className="form-section">
            <div className="form-group-double">
              <div className="form-group">
                <Label htmlFor="hairColor">Hair Color</Label>
                <select
                  id="hairColor"
                  className="form-select"
                  value={formData.hairColor || ''}
                  onChange={(e) => setFormData({ ...formData, hairColor: e.target.value })}
                >
                  <option value="">Select...</option>
                  {['Blonde', 'Brunette', 'Red', 'Black', 'Gray', 'Other'].map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <Label htmlFor="eyeColor">Eye Color</Label>
                <select
                  id="eyeColor"
                  className="form-select"
                  value={formData.eyeColor || ''}
                  onChange={(e) => setFormData({ ...formData, eyeColor: e.target.value })}
                >
                  <option value="">Select...</option>
                  {['Blue', 'Brown', 'Green', 'Hazel', 'Gray', 'Other'].map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group-double">
              <div className="form-group">
                <Label htmlFor="bodyType">Body Type</Label>
                <select
                  id="bodyType"
                  className="form-select"
                  value={formData.bodyType || ''}
                  onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
                >
                  <option value="">Select...</option>
                  {['Slim', 'Athletic', 'Curvy', 'Average', 'Plus Size'].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <Label htmlFor="height">Height (cm)</Label>
                <Input 
                  id="height" 
                  type="number" 
                  value={formData.height || ''}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  min="140"
                  max="220"
                />
              </div>
            </div>

            <div className="form-group-double">
              <div className="form-group">
                <Label htmlFor="skinTone">Skin Tone</Label>
                <select
                  id="skinTone"
                  className="form-select"
                  value={formData.skinTone || ''}
                  onChange={(e) => setFormData({ ...formData, skinTone: e.target.value })}
                >
                  <option value="">Select...</option>
                  {['Fair', 'Medium', 'Olive', 'Tan', 'Dark'].map(tone => (
                    <option key={tone} value={tone}>{tone}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <Label htmlFor="ethnicity">Ethnicity</Label>
                <select
                  id="ethnicity"
                  className="form-select"
                  value={formData.ethnicity || ''}
                  onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
                >
                  <option value="">Select...</option>
                  {['White', 'Black', 'Asian', 'Latina', 'Mixed', 'Other'].map(eth => (
                    <option key={eth} value={eth}>{eth}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group-checkbox-group">
              <div className="form-checkbox-item">
                <input
                  type="checkbox"
                  id="tattoos"
                  checked={formData.tattoos || false}
                  onChange={(e) => setFormData({ ...formData, tattoos: e.target.checked })}
                  className="form-checkbox"
                />
                <Label htmlFor="tattoos" className="checkbox-label">Has Tattoos</Label>
              </div>

              <div className="form-checkbox-item">
                <input
                  type="checkbox"
                  id="piercings"
                  checked={formData.piercings || false}
                  onChange={(e) => setFormData({ ...formData, piercings: e.target.checked })}
                  className="form-checkbox"
                />
                <Label htmlFor="piercings" className="checkbox-label">Has Piercings</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="form-section">
            <div className="form-group">
              <Label>Languages Spoken</Label>
              <div className="form-checkbox-grid">
                {['English', 'Portuguese', 'Spanish', 'French', 'Italian', 'German'].map(lang => (
                  <div key={lang} className="form-checkbox-item">
                    <input
                      type="checkbox"
                      id={`lang-${lang}`}
                      checked={(formData.languages || []).includes(lang)}
                      onChange={() => {
                        const current = formData.languages || [];
                        setFormData({
                          ...formData,
                          languages: current.includes(lang)
                            ? current.filter(l => l !== lang)
                            : [...current, lang]
                        });
                      }}
                      className="form-checkbox"
                    />
                    <Label htmlFor={`lang-${lang}`} className="checkbox-label">{lang}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <Label htmlFor="availability">Availability</Label>
              <Input 
                id="availability" 
                value={formData.availability || ''}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                placeholder="e.g., 24/7, Weekdays, Evenings"
              />
            </div>

            <div className="form-group-checkbox-group">
              <div className="form-checkbox-item">
                <input
                  type="checkbox"
                  id="outcall"
                  checked={formData.outcall || false}
                  onChange={(e) => setFormData({ ...formData, outcall: e.target.checked })}
                  className="form-checkbox"
                />
                <Label htmlFor="outcall" className="checkbox-label">Offers Outcall Services</Label>
              </div>

              <div className="form-checkbox-item">
                <input
                  type="checkbox"
                  id="incall"
                  checked={formData.incall || false}
                  onChange={(e) => setFormData({ ...formData, incall: e.target.checked })}
                  className="form-checkbox"
                />
                <Label htmlFor="incall" className="checkbox-label">Offers Incall Services</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="form-group">
              <Label htmlFor="priceMin">Starting Price ($)</Label>
              <Input 
                id="priceMin" 
                type="number" 
                value={formData.priceMin}
                onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                min="0"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Services Offered</CardTitle>
            <p className="text-sm text-muted-foreground">
              Select from popular services or add custom ones (max 10)
            </p>
          </CardHeader>
          <CardContent>
            <ServiceSelector
              value={formData.services}
              onChange={(services) => setFormData({ ...formData, services })}
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} className="form-submit" size="lg">
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}
