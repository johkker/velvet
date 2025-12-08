'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { MapPin, X } from 'lucide-react';
import { useLocation } from '@/lib/location-context';
import './LocationPermissionModal.css';

export function LocationPermissionModal() {
  const [isVisible, setIsVisible] = useState(false);
  const { requestLocation, isLoading, locationPermission } = useLocation();

  useEffect(() => {
    // Check if we should show the modal
    const hasAsked = localStorage.getItem('velvet_location_asked');
    const neverAsk = localStorage.getItem('velvet_location_never_ask');

    if (!hasAsked && !neverAsk && locationPermission === 'unknown') {
      // Show modal after a short delay (better UX)
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [locationPermission]);

  const handleAllow = async () => {
    localStorage.setItem('velvet_location_asked', 'true');
    await requestLocation();
    setIsVisible(false);
  };

  const handleNotNow = () => {
    localStorage.setItem('velvet_location_asked', 'true');
    setIsVisible(false);
  };

  const handleNeverAsk = () => {
    localStorage.setItem('velvet_location_asked', 'true');
    localStorage.setItem('velvet_location_never_ask', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="location-modal-overlay">
      <Card className="location-modal-card">
        <button 
          onClick={handleNotNow}
          className="location-modal-close"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <CardHeader className="location-modal-header">
          <div className="location-modal-icon">
            <MapPin className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="location-modal-title">
            Find Talents Near You
          </CardTitle>
        </CardHeader>

        <CardContent className="location-modal-content">
          <p className="location-modal-description">
            Allow location access to see talents in your area. We only use your city location, 
            never your exact coordinates.
          </p>

          <div className="location-modal-benefits">
            <div className="location-benefit">
              <span className="location-benefit-icon">✓</span>
              <span>Personalized search results</span>
            </div>
            <div className="location-benefit">
              <span className="location-benefit-icon">✓</span>
              <span>See local featured talents</span>
            </div>
            <div className="location-benefit">
              <span className="location-benefit-icon">✓</span>
              <span>Privacy-focused (city-level only)</span>
            </div>
          </div>

          <div className="location-modal-actions">
            <Button
              onClick={handleAllow}
              disabled={isLoading}
              className="bg-gradient-primary hover:shadow-glow transition-smooth font-semibold border-0"
              size="lg"
            >
              {isLoading ? 'Getting Location...' : 'Allow Location'}
            </Button>
            <Button
              onClick={handleNotNow}
              variant="ghost"
              className="location-modal-secondary"
            >
              Not Now
            </Button>
            <button
              onClick={handleNeverAsk}
              className="location-modal-never"
            >
              Never ask again
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
