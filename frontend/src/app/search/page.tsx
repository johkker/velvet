'use client';

import { useState, useEffect } from 'react';
import { smartSearch } from '@/lib/api';
import { TalentGrid } from '@/components/organisms/TalentGrid';
import { AdvancedFilters } from '@/components/organisms/AdvancedFilters';
import { useLocation } from '@/lib/location-context';
import './page.css';

export default function SearchPage() {
  const { userCity } = useLocation();
  const [featuredTalents, setFeaturedTalents] = useState<any[]>([]);
  const [regularTalents, setRegularTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});

  // Auto-search when location is detected or filters change
  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      
      const query = {
        ...filters,
        city: filters.city || userCity || undefined,
      };

      // Remove empty values
      Object.keys(query).forEach(key => {
        if (query[key] === '' || query[key] === undefined) {
          delete query[key];
        }
      });

      const { featured, regular } = await smartSearch(query);
      setFeaturedTalents(featured || []);
      setRegularTalents(regular || []);
      setLoading(false);
    };

    performSearch();
  }, [filters, userCity]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const totalResults = featuredTalents.length + regularTalents.length;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="search-header">
        <h1 className="search-title">Find Your Perfect Match</h1>
        <p className="search-subtitle">
          {userCity 
            ? `Discover talents in ${userCity} and beyond` 
            : 'Browse our exclusive collection of verified talents'}
        </p>
      </div>
      
      <div className="search-layout">
        <AdvancedFilters 
          onFilterChange={handleFilterChange}
          initialFilters={filters}
        />

        <div className="search-results">
          <div className="results-header">
            <p className="results-count">
              {loading ? (
                'Searching...'
              ) : (
                `${totalResults} ${totalResults === 1 ? 'talent' : 'talents'} found`
              )}
            </p>
          </div>
          
          {loading ? (
            <div className="results-loading">
              <div className="loading-spinner"></div>
              <p>Finding the best matches...</p>
            </div>
          ) : (
            <>
              {/* Featured Section */}
              {featuredTalents.length > 0 && (
                <div className="results-section">
                  <div className="section-header">
                    <h2 className="section-title">
                      ✨ Featured {userCity ? `in ${userCity}` : ''}
                    </h2>
                    <p className="section-subtitle">
                      {featuredTalents.length} premium {featuredTalents.length === 1 ? 'talent' : 'talents'}
                    </p>
                  </div>
                  <TalentGrid talents={featuredTalents} />
                </div>
              )}

              {/* Regular Section */}
              {regularTalents.length > 0 && (
                <div className="results-section">
                  <div className="section-header">
                    <h2 className="section-title">
                      📍 {featuredTalents.length > 0 ? 'More' : 'All Talents'} {userCity ? `in ${userCity}` : ''}
                    </h2>
                    <p className="section-subtitle">
                      {regularTalents.length} {regularTalents.length === 1 ? 'talent' : 'talents'}
                    </p>
                  </div>
                  <TalentGrid talents={regularTalents} />
                </div>
              )}

              {/* No Results */}
              {totalResults === 0 && (
                <div className="no-results">
                  <h3>No talents found</h3>
                  <p>Try adjusting your filters or search in a different city</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
