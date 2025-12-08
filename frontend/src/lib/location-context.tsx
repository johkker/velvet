'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationContextType {
  userCity: string | null;
  userCoords: { lat: number; lng: number } | null;
  locationPermission: 'granted' | 'denied' | 'prompt' | 'unknown';
  isLoading: boolean;
  requestLocation: () => Promise<void>;
  setManualCity: (city: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [userCity, setUserCity] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [isLoading, setIsLoading] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCity = localStorage.getItem('velvet_user_city');
    const savedPermission = localStorage.getItem('velvet_location_permission') as 'granted' | 'denied' | 'prompt' | null;
    
    if (savedCity) {
      setUserCity(savedCity);
    }
    
    if (savedPermission) {
      setLocationPermission(savedPermission);
    }
  }, []);

  const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    try {
      // Using Nominatim (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Velvet-App/1.0',
          },
        }
      );

      if (!response.ok) throw new Error('Geocoding failed');

      const data = await response.json();
      
      // Extract city from response
      const city = data.address?.city || 
                   data.address?.town || 
                   data.address?.village || 
                   data.address?.municipality ||
                   data.address?.county ||
                   null;

      return city;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  };

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    setIsLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // Cache for 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      setUserCoords({ lat: latitude, lng: longitude });

      // Reverse geocode to get city
      const city = await reverseGeocode(latitude, longitude);
      
      if (city) {
        setUserCity(city);
        localStorage.setItem('velvet_user_city', city);
      }

      setLocationPermission('granted');
      localStorage.setItem('velvet_location_permission', 'granted');
    } catch (error: any) {
      console.error('Geolocation error:', error);
      
      if (error.code === 1) {
        // Permission denied
        setLocationPermission('denied');
        localStorage.setItem('velvet_location_permission', 'denied');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setManualCity = (city: string) => {
    setUserCity(city);
    localStorage.setItem('velvet_user_city', city);
  };

  return (
    <LocationContext.Provider
      value={{
        userCity,
        userCoords,
        locationPermission,
        isLoading,
        requestLocation,
        setManualCity,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
