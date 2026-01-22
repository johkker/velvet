'use client';

import { useState } from 'react';
import { purchaseEstablishmentBoost } from '@/lib/api';
import PaymentModal from '@/components/organisms/PaymentModal';
import { ESTABLISHMENT_BOOST_TIERS } from './boost-tiers';
import './establishment-boost-section.css';

interface EstablishmentBoostSectionProps {
  activeBoost: any;
  onSuccess: () => void;
}

export default function EstablishmentBoostSection({ activeBoost, onSuccess }: EstablishmentBoostSectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  const handlePurchase = async (boostType: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await purchaseEstablishmentBoost(boostType);

      if (!result) {
        throw new Error('No response from server');
      }

      setPaymentData(result);
      setIsModalOpen(true);
    } catch (err: any) {
      setError(err.message || 'Falha ao comprar boost da empresa');
      console.error('Failed to purchase establishment boost:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    onSuccess();
  };

  return (
    <section className="establishment-boost-section">
      <div className="section-header">
        <h2>Destaque sua Empresa</h2>
        <p>Aumente a visibilidade da sua empresa e atraia mais talentos</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="boosts-grid">
        {ESTABLISHMENT_BOOST_TIERS.map((tier) => (
          <div 
            key={tier.id} 
            className={`boost-card ${tier.popular ? 'popular' : ''} ${activeBoost ? 'disabled' : ''}`}
          >
            {tier.popular && <div className="popular-badge">Mais Popular</div>}
            <h3>{tier.name}</h3>
            <div className="boost-price">{(tier as any).price}</div>
            <div className="boost-duration">{tier.duration}</div>
            <ul className="boost-features">
              {tier.features.map((feature, idx) => (
                <li key={idx}>
                  <span className="check-icon">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePurchase(tier.id)}
              disabled={loading || !!activeBoost}
              className="boost-button"
            >
              {activeBoost ? 'Boost Ativo' : loading ? 'Processando...' : 'Comprar Boost'}
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <PaymentModal
          onClose={() => setIsModalOpen(false)}
          paymentData={paymentData}
          onSuccess={handleSuccess}
        />
      )}
    </section>
  );
}
