'use client';

import { useState } from 'react';
import { createBoost } from '@/lib/api';
import PaymentModal from '@/components/organisms/PaymentModal';
import './page.css';

const BOOST_TIERS = [
  {
    id: 'basic_7d',
    name: 'Basic Boost',
    duration: '7 Dias',
    price: 4900,
    features: [
      'Destaque nas buscas',
      'Maior visibilidade',
      'Posicionamento prioritário'
    ],
  },
  {
    id: 'premium_7d',
    name: 'Premium Boost',
    duration: '7 Dias',
    price: 7900,
    features: [
      'Topo da lista',
      'Badge de destaque',
      'Máxima visibilidade',
      'Suporte prioritário'
    ],
    popular: true,
  },
  {
    id: 'premium_30d',
    name: 'Premium Boost',
    duration: '30 Dias',
    price: 24900,
    features: [
      'Topo da lista',
      'Badge de destaque',
      'Máxima visibilidade',
      'Suporte prioritário',
      'Melhor custo-benefício'
    ],
  },
];

export default function BoostsPage() {
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (boostType: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createBoost(boostType);
      
      console.log('Boost purchase result:', result);
      
      // Simple validation - just check we got data back
      if (!result) {
        throw new Error('No response from server');
      }
      
      setPaymentData(result);
      setIsModalOpen(true);
    } catch (err: any) {
      setError(err.message || 'Falha ao criar boost');
      console.error('Failed to create boost:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    // Reload to show updated boost status
    window.location.reload();
  };

  return (
    <div className="boosts-page">
      <div className="boosts-header">
        <h1>Impulsione Seu Perfil</h1>
        <p className="subtitle">Ganhe mais visibilidade e atraia mais clientes</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="boost-tiers">
        {BOOST_TIERS.map((tier) => (
          <div key={tier.id} className={`boost-card ${tier.popular ? 'popular' : ''}`}>
            {tier.popular && <span className="popular-badge">Mais Popular</span>}
            
            <h3>{tier.name}</h3>
            <p className="duration">{tier.duration}</p>
            <div className="price-container">
              <span className="currency">R$</span>
              <span className="price">{(tier.price / 100).toFixed(2)}</span>
            </div>

            <ul className="features">
              {tier.features.map((feature, i) => (
                <li key={i}>
                  <span className="check">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePurchase(tier.id)}
              disabled={loading}
              className="purchase-button"
            >
              {loading ? 'Processando...' : 'Comprar Boost'}
            </button>
          </div>
        ))}
      </div>

      <div className="info-section">
        <h2>Como funciona?</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Escolha seu plano</h4>
            <p>Selecione o boost que melhor atende suas necessidades</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>Pague com PIX</h4>
            <p>Escaneie o QR Code ou copie o código PIX</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>Ativação instantânea</h4>
            <p>Seu boost é ativado automaticamente após o pagamento</p>
          </div>
        </div>
      </div>

      {paymentData && (
        <PaymentModal
          onClose={() => setIsModalOpen(false)}
          paymentData={paymentData}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
