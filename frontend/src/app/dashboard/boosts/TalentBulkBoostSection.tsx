'use client';

import { useState, useEffect } from 'react';
import { purchaseBoostForTalents, fetchManagedTalents } from '@/lib/api';
import PaymentModal from '@/components/organisms/PaymentModal';
import { TALENT_BULK_BOOST_TIERS } from './boost-tiers';
import './talent-bulk-boost-section.css';

interface TalentBulkBoostSectionProps {
  onSuccess: () => void;
}

interface ManagedTalent {
  id: string;
  displayName: string;
}

export default function TalentBulkBoostSection({ onSuccess }: TalentBulkBoostSectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [managedTalents, setManagedTalents] = useState<ManagedTalent[]>([]);
  const [selectedTalents, setSelectedTalents] = useState<Set<string>>(new Set());
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  useEffect(() => {
    loadManagedTalents();
  }, []);

  const loadManagedTalents = async () => {
    try {
      const response = await fetchManagedTalents();
      setManagedTalents(response.data || []);
    } catch (err) {
      console.error('Failed to load managed talents:', err);
    }
  };

  const toggleTalent = (talentId: string) => {
    const newSelected = new Set(selectedTalents);
    if (newSelected.has(talentId)) {
      newSelected.delete(talentId);
    } else {
      newSelected.add(talentId);
    }
    setSelectedTalents(newSelected);
  };

  const handlePurchase = async (boostType: string) => {
    if (selectedTalents.size === 0) {
      setError('Selecione pelo menos um talento');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSelectedTier(boostType);
      
      const result = await purchaseBoostForTalents(
        Array.from(selectedTalents),
        boostType
      );

      if (!result) {
        throw new Error('No response from server');
      }

      setPaymentData(result);
      setIsModalOpen(true);
    } catch (err: any) {
      setError(err.message || 'Falha ao comprar boost em lote');
      console.error('Failed to purchase bulk boost:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedTalents(new Set());
    setSelectedTier(null);
    onSuccess();
  };

  const calculateTotalPrice = (tier: any) => {
    const tierData = TALENT_BULK_BOOST_TIERS.find(t => t.id === tier.id);
    if (!tierData) return 'R$ 0,00';
    const total = (tierData.pricePerTalentCents * selectedTalents.size) / 100;
    return `R$ ${total.toFixed(2).replace('.', ',')}`;
  };

  if (managedTalents.length === 0) {
    return null;
  }

  return (
    <section className="talent-bulk-boost-section">
      <div className="section-header">
        <h2>Destaque Múltiplos Talentos</h2>
        <p>Impulsione vários talentos de uma vez com descontos em volume</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="bulk-boost-container">
        {/* Talent Selection */}
        <div className="talent-selection">
          <h3>Selecione Talentos</h3>
          <div className="talent-list">
            {managedTalents.map((talent) => (
              <label key={talent.id} className="talent-item">
                <input
                  type="checkbox"
                  checked={selectedTalents.has(talent.id)}
                  onChange={() => toggleTalent(talent.id)}
                  disabled={loading}
                />
                <span className="talent-name">{talent.displayName}</span>
              </label>
            ))}
          </div>
          <div className="selection-summary">
            {selectedTalents.size > 0 && (
              <p className="selected-count">
                {selectedTalents.size} talento{selectedTalents.size !== 1 ? 's' : ''} selecionado{selectedTalents.size !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Boost Tiers */}
        <div className="bulk-boosts-grid">
          {TALENT_BULK_BOOST_TIERS.map((tier) => (
            <div 
              key={tier.id} 
              className={`boost-card ${tier.popular ? 'popular' : ''} ${selectedTalents.size === 0 ? 'disabled' : ''}`}
            >
              {tier.popular && <div className="popular-badge">Melhor Valor</div>}
              <h3>{tier.name}</h3>
              <div className="boost-duration">{tier.duration}</div>
              
              {selectedTalents.size > 0 ? (
                <>
                  <div className="price-breakdown">
                    <div className="price-item">
                      <span className="label">Preço unitário:</span>
                      <span className="value">{tier.pricePerTalent}</span>
                    </div>
                    <div className="price-item">
                      <span className="label">Desconto:</span>
                      <span className="value discount">{tier.discount}% OFF</span>
                    </div>
                    <div className="price-item total">
                      <span className="label">Total ({selectedTalents.size}x):</span>
                      <span className="value">{calculateTotalPrice(tier)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="price-placeholder">
                  <p>{tier.pricePerTalent} por talento</p>
                  <p className="discount-badge">{tier.discount}% desconto</p>
                </div>
              )}

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
                disabled={loading || selectedTalents.size === 0}
                className="boost-button"
              >
                {loading && selectedTier === tier.id ? 'Processando...' : 'Comprar Boost'}
              </button>
            </div>
          ))}
        </div>
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
