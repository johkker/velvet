// Talent boost tiers
export const TALENT_BOOST_TIERS = [
  {
    id: 'basic_3d',
    name: 'Basic Boost',
    duration: '3 dias',
    price: 'R$ 19,90',
    priceInCents: 1990,
    features: [
      'Perfil destacado nos resultados',
      'Aparição em buscas',
      'Badge "Em Destaque"',
    ]
  },
  {
    id: 'basic_7d',
    name: 'Basic Boost',
    duration: '7 dias',
    price: 'R$ 49,00',
    priceInCents: 4900,
    popular: true,
    features: [
      'Perfil destacado nos resultados',
      'Aparição em buscas',
      'Prioridade nos filtros',
      'Badge "Em Destaque"',
    ]
  },
  {
    id: 'premium_7d',
    name: 'Premium Boost',
    duration: '7 dias',
    price: 'R$ 79,00',
    priceInCents: 7900,
    features: [
      'Tudo do Basic Boost',
      'Aparece no topo da página inicial',
      'Notificações prioritárias',
      'Badge "Premium"',
    ]
  },
  {
    id: 'premium_30d',
    name: 'Premium Boost',
    duration: '30 dias',
    price: 'R$ 249,00',
    priceInCents: 24900,
    features: [
      'Tudo do Premium Boost',
      'Destaque máximo em todos os filtros',
      'Badge "Premium" exclusivo',
      'Suporte prioritário',
      'Válido por 30 dias',
    ]
  }
];

// Establishment boost tiers
export const ESTABLISHMENT_BOOST_TIERS = [
  {
    id: 'establishment_3d',
    name: 'Destaque da Empresa',
    duration: '3 dias',
    price: 'R$ 49,90',
    priceInCents: 4990,
    features: [
      'Perfil da empresa destacado',
      'Maior visibilidade para talentos',
      'Aparição em buscas prioritárias',
    ]
  },
  {
    id: 'establishment_7d',
    name: 'Destaque da Empresa',
    duration: '7 dias',
    price: 'R$ 124,00',
    priceInCents: 12400,
    popular: true,
    features: [
      'Perfil da empresa destacado',
      'Maior visibilidade para talentos',
      'Aparição em buscas prioritárias',
      'Badge "Empresa em Destaque"',
      'Notificações prioritárias',
    ]
  },
  {
    id: 'establishment_30d',
    name: 'Destaque Premium da Empresa',
    duration: '30 dias',
    price: 'R$ 623,00',
    priceInCents: 62300,
    features: [
      'Tudo do Destaque de 7 dias',
      'Máxima visibilidade em todas buscas',
      'Badge "Premium Empresa" exclusivo',
      'Suporte prioritário',
      'Acesso a relatórios detalhados',
      'Válido por 30 dias',
    ]
  }
];

// Talent bulk boost tiers
export const TALENT_BULK_BOOST_TIERS = [
  {
    id: 'talent_bulk_3d',
    name: 'Destaque em Lote - 3 Dias',
    duration: '3 dias',
    pricePerTalent: 'R$ 17,90',
    pricePerTalentCents: 1790,
    discount: 10,
    features: [
      'R$ 17,90 por talento (10% desconto)',
      'Destaque de múltiplos talentos',
      'Pagamento único e simplificado',
      'Perfeito para agências',
    ]
  },
  {
    id: 'talent_bulk_7d',
    name: 'Destaque em Lote - 7 Dias',
    duration: '7 dias',
    pricePerTalent: 'R$ 39,20',
    pricePerTalentCents: 3920,
    discount: 20,
    popular: true,
    features: [
      'R$ 39,20 por talento (20% desconto)',
      'Destaque de múltiplos talentos',
      'Pagamento único e simplificado',
      'Melhor custo-benefício',
      'Perfeito para agências',
    ]
  },
  {
    id: 'talent_bulk_30d',
    name: 'Destaque em Lote - 30 Dias',
    duration: '30 dias',
    pricePerTalent: 'R$ 174,30',
    pricePerTalentCents: 17430,
    discount: 30,
    features: [
      'R$ 174,30 por talento (30% desconto)',
      'Destaque máximo de múltiplos talentos',
      'Pagamento único e simplificado',
      'Maior economia em volume',
      'Perfeito para agências',
      'Válido por 30 dias',
    ]
  }
];
