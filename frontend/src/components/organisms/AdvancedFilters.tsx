'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';
import { MapPin, X, SlidersHorizontal } from 'lucide-react';
import { useLocation } from '@/lib/location-context';
import './AdvancedFilters.css';

interface AdvancedFiltersProps {
  onFilterChange: (filters: any) => void;
  initialFilters?: any;
}

const HAIR_COLORS = ['Blonde', 'Brunette', 'Red', 'Black', 'Gray', 'Other'];
const EYE_COLORS = ['Blue', 'Brown', 'Green', 'Hazel', 'Gray', 'Other'];
const BODY_TYPES = ['Slim', 'Athletic', 'Curvy', 'Average', 'Plus Size'];
const SKIN_TONES = ['Fair', 'Medium', 'Olive', 'Tan', 'Dark'];
const ETHNICITIES = ['White', 'Black', 'Asian', 'Latina', 'Mixed', 'Other'];
const LANGUAGES = ['English', 'Portuguese', 'Spanish', 'French', 'Italian', 'German', 'Mandarin', 'Japanese'];

export function AdvancedFilters({ onFilterChange, initialFilters = {} }: AdvancedFiltersProps) {
  const { userCity } = useLocation();
  const [filters, setFilters] = useState(initialFilters);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(initialFilters.languages || []);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleLanguageToggle = (lang: string) => {
    const newLanguages = selectedLanguages.includes(lang)
      ? selectedLanguages.filter(l => l !== lang)
      : [...selectedLanguages, lang];
    setSelectedLanguages(newLanguages);
    handleChange('languages', newLanguages.join(','));
  };

  const handleApply = () => {
    onFilterChange(filters);
    setIsMobileOpen(false);
  };

  const handleClear = () => {
    setFilters({});
    setSelectedLanguages([]);
    onFilterChange({});
  };

  const FilterContent = () => (
    <>
      <div className="filters-header">
        <h3 className="filters-title">Filters</h3>
        <button onClick={handleClear} className="filters-clear">
          Clear All
        </button>
      </div>

      <form className="filters-form" onSubmit={(e) => { e.preventDefault(); handleApply(); }}>
        {/* Location Section */}
        <div className="filter-section">
          <div className="filter-section-title">Location</div>
          {userCity ? (
            <div className="location-display">
              <MapPin className="h-4 w-4 location-icon" />
              <span>{userCity}</span>
              <button type="button" className="location-change">Change</button>
            </div>
          ) : (
            <div className="filter-group">
              <Label className="filter-label">City</Label>
              <Input
                placeholder="Enter city name"
                value={filters.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                className="filter-input"
              />
            </div>
          )}
        </div>

        {/* Physical Attributes */}
        <div className="filter-section">
          <div className="filter-section-title">Physical Attributes</div>
          
          <div className="filter-group">
            <Label className="filter-label">Hair Color</Label>
            <select
              className="filter-select"
              value={filters.hairColor || ''}
              onChange={(e) => handleChange('hairColor', e.target.value)}
            >
              <option value="">Any</option>
              {HAIR_COLORS.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <Label className="filter-label">Eye Color</Label>
            <select
              className="filter-select"
              value={filters.eyeColor || ''}
              onChange={(e) => handleChange('eyeColor', e.target.value)}
            >
              <option value="">Any</option>
              {EYE_COLORS.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <Label className="filter-label">Body Type</Label>
            <select
              className="filter-select"
              value={filters.bodyType || ''}
              onChange={(e) => handleChange('bodyType', e.target.value)}
            >
              <option value="">Any</option>
              {BODY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <Label className="filter-label">Height (cm)</Label>
            <div className="filter-range">
              <Input
                type="number"
                placeholder="Min"
                min="140"
                max="220"
                value={filters.heightMin || ''}
                onChange={(e) => handleChange('heightMin', e.target.value)}
                className="filter-input"
              />
              <span className="filter-range-separator">—</span>
              <Input
                type="number"
                placeholder="Max"
                min="140"
                max="220"
                value={filters.heightMax || ''}
                onChange={(e) => handleChange('heightMax', e.target.value)}
                className="filter-input"
              />
            </div>
          </div>

          <div className="filter-group">
            <Label className="filter-label">Skin Tone</Label>
            <select
              className="filter-select"
              value={filters.skinTone || ''}
              onChange={(e) => handleChange('skinTone', e.target.value)}
            >
              <option value="">Any</option>
              {SKIN_TONES.map(tone => (
                <option key={tone} value={tone}>{tone}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <Label className="filter-label">Ethnicity</Label>
            <select
              className="filter-select"
              value={filters.ethnicity || ''}
              onChange={(e) => handleChange('ethnicity', e.target.value)}
            >
              <option value="">Any</option>
              {ETHNICITIES.map(ethnicity => (
                <option key={ethnicity} value={ethnicity}>{ethnicity}</option>
              ))}
            </select>
          </div>

          <div className="filter-checkbox-group">
            <div className="filter-checkbox-item">
              <input
                type="checkbox"
                id="tattoos"
                className="filter-checkbox"
                checked={filters.tattoos === 'true'}
                onChange={(e) => handleChange('tattoos', e.target.checked ? 'true' : '')}
              />
              <label htmlFor="tattoos" className="filter-checkbox-label">Has Tattoos</label>
            </div>
            <div className="filter-checkbox-item">
              <input
                type="checkbox"
                id="piercings"
                className="filter-checkbox"
                checked={filters.piercings === 'true'}
                onChange={(e) => handleChange('piercings', e.target.checked ? 'true' : '')}
              />
              <label htmlFor="piercings" className="filter-checkbox-label">Has Piercings</label>
            </div>
          </div>
        </div>

        {/* Services & Availability */}
        <div className="filter-section">
          <div className="filter-section-title">Services</div>
          
          <div className="filter-group">
            <Label className="filter-label">Languages</Label>
            <div className="filter-multi-select">
              {selectedLanguages.map(lang => (
                <div key={lang} className="filter-tag">
                  {lang}
                  <button
                    type="button"
                    onClick={() => handleLanguageToggle(lang)}
                    className="filter-tag-remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <select
              className="filter-select"
              value=""
              onChange={(e) => {
                if (e.target.value) handleLanguageToggle(e.target.value);
              }}
            >
              <option value="">Add language...</option>
              {LANGUAGES.filter(l => !selectedLanguages.includes(l)).map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="filter-checkbox-group">
            <div className="filter-checkbox-item">
              <input
                type="checkbox"
                id="outcall"
                className="filter-checkbox"
                checked={filters.outcall === 'true'}
                onChange={(e) => handleChange('outcall', e.target.checked ? 'true' : '')}
              />
              <label htmlFor="outcall" className="filter-checkbox-label">Outcall Available</label>
            </div>
            <div className="filter-checkbox-item">
              <input
                type="checkbox"
                id="incall"
                className="filter-checkbox"
                checked={filters.incall === 'true'}
                onChange={(e) => handleChange('incall', e.target.checked ? 'true' : '')}
              />
              <label htmlFor="incall" className="filter-checkbox-label">Incall Available</label>
            </div>
          </div>
        </div>

        {/* Price Range */}
        <div className="filter-section">
          <div className="filter-section-title">Price Range</div>
          <div className="filter-group">
            <Label className="filter-label">Budget ($)</Label>
            <div className="filter-range">
              <Input
                type="number"
                placeholder="Min"
                min="0"
                value={filters.price_min || ''}
                onChange={(e) => handleChange('price_min', e.target.value)}
                className="filter-input"
              />
              <span className="filter-range-separator">—</span>
              <Input
                type="number"
                placeholder="Max"
                min="0"
                value={filters.price_max || ''}
                onChange={(e) => handleChange('price_max', e.target.value)}
                className="filter-input"
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="bg-gradient-primary hover:shadow-glow transition-smooth font-semibold border-0 filter-submit"
          size="lg"
        >
          Apply Filters
        </Button>
      </form>
    </>
  );

  return (
    <>
      {/* Desktop Filters */}
      <aside className="advanced-filters hidden lg:block">
        <Card className="glass shadow-premium">
          <CardContent className="p-6">
            <FilterContent />
          </CardContent>
        </Card>
      </aside>

      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="filters-mobile-toggle lg:hidden"
      >
        <SlidersHorizontal className="h-5 w-5" />
        Filters
      </button>

      {/* Mobile Filter Drawer */}
      {isMobileOpen && (
        <>
          <div className="filters-mobile-overlay" onClick={() => setIsMobileOpen(false)} />
          <div className="filters-mobile-drawer">
            <FilterContent />
          </div>
        </>
      )}
    </>
  );
}
