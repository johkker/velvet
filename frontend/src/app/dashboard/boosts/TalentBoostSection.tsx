'use client';

import { useState } from 'react';
import { createBoost } from '@/lib/api';
import PaymentModal from '@/components/organisms/PaymentModal';
import { TALENT_BOOST_TIERS } from './boost-tiers';
import './talent-boost-section.css';

interface TalentBoostSectionProps {
  activeBoost: any;
  onSuccess: () => void;
}

export default function TalentBoostSection({ activeBoost, onSuccess }: TalentBoostSectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  const handlePurchase = async (boostType: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createBoost(boostType);

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
    onSuccess();
  };

  return (
    <section className="talent-boost-section">
      <div className="section-header">
        <h2>Destaque seu Perfil</h2>
        <p>Aumente sua visibilidade e receba mais propostas de trabalho</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="boosts-grid">
        {TALENT_BOOST_TIERS.map((tier) => (
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
