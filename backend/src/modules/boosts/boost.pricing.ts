export const BOOST_PRICING = {
  TALENT: {
    basic_3d: {
      externalId: 'boost_talent_3d',
      name: 'Basic Boost - 3 Days',
      description: 'Featured profile for 3 days',
      price: 1990, // R$ 19.90
      duration: 3,
    },
    basic_7d: {
      externalId: 'boost_talent_7d',
      name: 'Basic Boost - 7 Days',
      description: 'Featured profile for 7 days',
      price: 4900, // R$ 49.00
      duration: 7,
    },
    premium_7d: {
      externalId: 'boost_talent_premium_7d',
      name: 'Premium Boost - 7 Days',
      description: 'Top position + featured for 7 days',
      price: 7900, // R$ 79.00
      duration: 7,
    },
    premium_30d: {
      externalId: 'boost_talent_premium_30d',
      name: 'Premium Boost - 30 Days',
      description: 'Top position + featured for 30 days',
      price: 24900, // R$ 249.00
      duration: 30,
    },
  },
  ESTABLISHMENT_PROFILE: {
    establishment_3d: {
      externalId: 'boost_establishment_3d',
      name: 'Establishment Boost - 3 Days',
      description: 'Featured establishment for 3 days',
      price: 4990, // R$ 49.90
      duration: 3,
      margin: 1.5,
    },
    establishment_7d: {
      externalId: 'boost_establishment_7d',
      name: 'Establishment Boost - 7 Days',
      description: 'Featured establishment for 7 days',
      price: 12400, // R$ 124.00
      duration: 7,
      margin: 1.53,
    },
    establishment_30d: {
      externalId: 'boost_establishment_30d',
      name: 'Establishment Boost - 30 Days',
      description: 'Top position establishment for 30 days',
      price: 62300, // R$ 623.00
      duration: 30,
      margin: 1.5,
    },
  },
  TALENT_BULK: {
    talent_bulk_3d: {
      externalId: 'boost_talent_bulk_3d',
      name: 'Talent Bulk Boost - 3 Days',
      description: 'Boost multiple talents for 3 days',
      pricePerTalent: 1790, // R$ 17.90 (10% discount)
      duration: 3,
      discount: 0.1,
    },
    talent_bulk_7d: {
      externalId: 'boost_talent_bulk_7d',
      name: 'Talent Bulk Boost - 7 Days',
      description: 'Boost multiple talents for 7 days',
      pricePerTalent: 3920, // R$ 39.20 (20% discount)
      duration: 7,
      discount: 0.2,
    },
    talent_bulk_30d: {
      externalId: 'boost_talent_bulk_30d',
      name: 'Talent Bulk Boost - 30 Days',
      description: 'Boost multiple talents for 30 days',
      pricePerTalent: 17430, // R$ 174.30 (30% discount)
      duration: 30,
      discount: 0.3,
    },
  },
};

export enum BoostTier {
  BASIC_3D = 'basic_3d',
  BASIC_7D = 'basic_7d',
  PREMIUM_7D = 'premium_7d',
  PREMIUM_30D = 'premium_30d',
  ESTABLISHMENT_3D = 'establishment_3d',
  ESTABLISHMENT_7D = 'establishment_7d',
  ESTABLISHMENT_30D = 'establishment_30d',
  TALENT_BULK_3D = 'talent_bulk_3d',
  TALENT_BULK_7D = 'talent_bulk_7d',
  TALENT_BULK_30D = 'talent_bulk_30d',
}
