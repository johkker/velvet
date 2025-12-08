'use client';

import { useState } from 'react';
import { PREDEFINED_SERVICES, MAX_SERVICES, validateServices, getServiceDisplay } from '@/lib/services';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { X } from 'lucide-react';

interface ServiceSelectorProps {
  value: string[];
  onChange: (services: string[]) => void;
}

export function ServiceSelector({ value, onChange }: ServiceSelectorProps) {
  const [customService, setCustomService] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleAddPredefined = (serviceValue: string) => {
    if (value.includes(serviceValue)) {
      // Remove if already selected
      onChange(value.filter(s => s !== serviceValue));
    } else if (value.length < MAX_SERVICES) {
      // Add if not at max
      onChange([...value, serviceValue]);
    }
  };

  const handleAddCustom = () => {
    const trimmed = customService.trim();
    if (!trimmed) return;

    if (trimmed.length > 50) {
      alert('Custom service name must be 50 characters or less');
      return;
    }

    if (value.includes(trimmed)) {
      alert('This service is already added');
      return;
    }

    if (value.length >= MAX_SERVICES) {
      alert(`Maximum ${MAX_SERVICES} services allowed`);
      return;
    }

    onChange([...value, trimmed]);
    setCustomService('');
    setShowCustomInput(false);
  };

  const handleRemove = (serviceValue: string) => {
    onChange(value.filter(s => s !== serviceValue));
  };

  return (
    <div className="space-y-4">
      {/* Selected Services */}
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-muted/20">
        {value.length === 0 ? (
          <span className="text-sm text-muted-foreground">No services selected</span>
        ) : (
          value.map((service) => {
            const display = getServiceDisplay(service);
            return (
              <div
                key={service}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium"
              >
                {display.icon && <span>{display.icon}</span>}
                <span>{display.isCustom ? service : display.value}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(service)}
                  className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        {value.length} / {MAX_SERVICES} services selected
      </div>

      {/* Predefined Services Grid */}
      <div>
        <div className="text-sm font-medium mb-2">Popular Services</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PREDEFINED_SERVICES.map((service) => {
            const isSelected = value.includes(service.value);
            const isDisabled = !isSelected && value.length >= MAX_SERVICES;
            
            return (
              <button
                key={service.value}
                type="button"
                onClick={() => handleAddPredefined(service.value)}
                disabled={isDisabled}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-colors
                  ${isSelected 
                    ? 'bg-primary/10 border-primary text-primary font-medium' 
                    : 'bg-background border-border hover:bg-muted/50'
                  }
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span className="text-lg">{service.icon}</span>
                <span className="flex-1 truncate">{service.value}</span>
                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary-foreground"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Service Input */}
      <div>
        {!showCustomInput ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCustomInput(true)}
            disabled={value.length >= MAX_SERVICES}
          >
            + Add Custom Service
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Enter custom service (max 50 chars)"
              value={customService}
              onChange={(e) => setCustomService(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustom();
                }
              }}
              maxLength={50}
              autoFocus
            />
            <Button type="button" onClick={handleAddCustom} size="sm">
              Add
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowCustomInput(false);
                setCustomService('');
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
