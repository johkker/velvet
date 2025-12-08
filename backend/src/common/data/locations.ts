// Location data structure with proper typing
interface LocationData {
  [country: string]: {
    [state: string]: {
      [city: string]: string[];
    };
  };
}

export const LOCATIONS: LocationData = {
  'United States': {
    'New York': {
      'New York City': ['Manhattan', 'Brooklyn', 'Queens', 'The Bronx', 'Staten Island'],
      'Buffalo': ['Downtown', 'North Buffalo', 'South Buffalo', 'West Side'],
      'Rochester': ['Downtown', 'Park Avenue', 'East End', 'South Wedge'],
    },
    'California': {
      'Los Angeles': ['Hollywood', 'Beverly Hills', 'Santa Monica', 'Downtown LA', 'Venice', 'West Hollywood'],
      'San Francisco': ['Mission District', 'SOMA', 'Marina', 'Castro', 'North Beach', 'Pacific Heights'],
      'San Diego': ['Gaslamp Quarter', 'La Jolla', 'Pacific Beach', 'Downtown', 'North Park'],
      'San Jose': ['Downtown', 'Willow Glen', 'Almaden Valley', 'Rose Garden'],
    },
    'Florida': {
      'Miami': ['South Beach', 'Brickell', 'Wynwood', 'Coconut Grove', 'Downtown Miami'],
      'Orlando': ['Downtown', 'Winter Park', 'Lake Nona', 'Thornton Park'],
      'Tampa': ['Downtown', 'Ybor City', 'Hyde Park', 'Channelside'],
    },
    'Texas': {
      'Houston': ['Downtown', 'Montrose', 'The Heights', 'Midtown', 'River Oaks'],
      'Austin': ['Downtown', 'South Congress', 'East Austin', 'West Lake Hills'],
      'Dallas': ['Downtown', 'Uptown', 'Deep Ellum', 'Bishop Arts'],
    },
    'Nevada': {
      'Las Vegas': ['The Strip', 'Downtown', 'Summerlin', 'Henderson'],
    },
  },
  'Brazil': {
    'São Paulo': {
      'São Paulo': ['Jardins', 'Vila Madalena', 'Pinheiros', 'Itaim Bibi', 'Moema', 'Vila Olímpia'],
      'Campinas': ['Centro', 'Cambuí', 'Barão Geraldo', 'Taquaral'],
    },
    'Rio de Janeiro': {
      'Rio de Janeiro': ['Copacabana', 'Ipanema', 'Leblon', 'Barra da Tijuca', 'Botafogo', 'Lapa'],
      'Niterói': ['Icaraí', 'Centro', 'Santa Rosa', 'Camboinhas'],
    },
    'Minas Gerais': {
      'Belo Horizonte': ['Savassi', 'Lourdes', 'Funcionários', 'Pampulha'],
    },
    'Paraná': {
      'Curitiba': ['Batel', 'Centro', 'Água Verde', 'Bigorrilho'],
    },
    'Rio Grande do Sul': {
      'Porto Alegre': ['Moinhos de Vento', 'Centro', 'Cidade Baixa', 'Petrópolis'],
    },
  },
};

// Helper functions
export function getCountries(): string[] {
  return Object.keys(LOCATIONS);
}

export function getStates(country: string): string[] {
  const countryData = LOCATIONS[country];
  return countryData ? Object.keys(countryData) : [];
}

export function getCities(country: string, state: string): string[] {
  const stateData = LOCATIONS[country]?.[state];
  return stateData ? Object.keys(stateData) : [];
}

export function getRegions(country: string, state: string, city: string): string[] {
  const regions = LOCATIONS[country]?.[state]?.[city];
  return regions || [];
}

export function isValidLocation(country: string, state: string, city: string, region?: string): boolean {
  const cityData = LOCATIONS[country]?.[state]?.[city];
  if (!cityData) return false;
  
  if (region && !cityData.includes(region)) return false;
  
  return true;
}

// Format location for display
export function formatLocation(state: string, city: string, region?: string): string {
  const parts = [region, city, state].filter(Boolean);
  return parts.join(', ');
}
