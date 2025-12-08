// Predefined services with icons
export const PREDEFINED_SERVICES = [
  { value: 'GFE', label: 'GFE (Girlfriend Experience)', icon: '💕' },
  { value: 'Dinner Date', label: 'Dinner Companion', icon: '🍽️' },
  { value: 'Travel', label: 'Travel Companion', icon: '✈️' },
  { value: 'Events', label: 'Events & Parties', icon: '🎉' },
  { value: 'Massage', label: 'Massage', icon: '💆' },
  { value: 'Tantric', label: 'Tantric Therapy', icon: '🧘' },
  { value: 'Executive', label: 'Executive Companion', icon: '💼' },
  { value: 'Photoshoot', label: 'Photoshoot & Modeling', icon: '📸' },
  { value: 'Fitness', label: 'Fitness & Wellness', icon: '💪' },
  { value: 'Spa', label: 'Spa & Relaxation', icon: '🌸' },
  { value: 'Cultural', label: 'Cultural Activities', icon: '🎭' },
  { value: 'Shopping', label: 'Shopping Companion', icon: '🛍️' },
  { value: 'Overnight', label: 'Overnight Stay', icon: '🌙' },
  { value: 'Weekend', label: 'Weekend Getaway', icon: '🏖️' },
  { value: 'Dance', label: 'Dance & Performance', icon: '💃' },
  { value: 'Sports', label: 'Sports & Recreation', icon: '⚽' },
  { value: 'Wine Tasting', label: 'Wine & Dining', icon: '🍷' },
  { value: 'Gaming', label: 'Gaming Companion', icon: '🎮' },
] as const;

export const MAX_SERVICES = 10;

export type PredefinedService = typeof PREDEFINED_SERVICES[number]['value'];

export interface Service {
  value: string;
  label: string;
  icon?: string;
  isCustom?: boolean;
}

export function getServiceDisplay(value: string): Service {
  const predefined = PREDEFINED_SERVICES.find(s => s.value === value);
  if (predefined) {
    return {
      value: predefined.value,
      label: predefined.label,
      icon: predefined.icon,
      isCustom: false,
    };
  }
  
  // Custom service
  return {
    value,
    label: value,
    isCustom: true,
  };
}

export function validateServices(services: string[]): { valid: boolean; error?: string } {
  if (services.length > MAX_SERVICES) {
    return { valid: false, error: `Maximum ${MAX_SERVICES} services allowed` };
  }
  
  // Check for duplicates
  const unique = new Set(services);
  if (unique.size !== services.length) {
    return { valid: false, error: 'Duplicate services not allowed' };
  }
  
  // Validate custom service length
  for (const service of services) {
    const predefined = PREDEFINED_SERVICES.find(s => s.value === service);
    if (!predefined && service.length > 50) {
      return { valid: false, error: 'Custom service names must be 50 characters or less' };
    }
  }
  
  return { valid: true };
}
