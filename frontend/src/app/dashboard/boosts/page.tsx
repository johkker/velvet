'use client';

import { useState, useEffect } from 'react';
import { createBoost, getActiveBoost } from '@/lib/api';
import PaymentModal from '@/components/organisms/PaymentModal';
import './page.css';

const BOOST_TIERS = [
  {
    id: 'basic_7d',
    name: 'Basic Boost',
    duration: '7 dias',
    price: 'R$ 49,00',
    features: [
      'Perfil destacado nos resultados',
      'Badge "Em Destaque"',
      'Prioridade nos filtros',
    ]
  },
  {
    id: 'premium_15d',
    name: 'Premium Boost',
    duration: '15 dias',
    price: 'R$ 89,00',
    popular: true,
    features: [
      'Tudo do Basic Boost',
      'Aparece no topo da página inicial',
      'Notificações prioritárias',
      'Badge "Premium"',
    ]
  },
  {
    id: 'elite_30d',
    name: 'Elite Boost',
    duration: '30 dias',
    price: 'R$ 149,00',
    features: [
      'Tudo do Premium Boost',
      'Destaque máximo em todos os filtros',
      'Badge "Elite" exclusivo',
      'Suporte prioritário',
    ]
  }
];

function formatTimeLeft(endDate: string) {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expirado';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h restantes`;
  if (hours > 0) return `${hours}h ${minutes}m restantes`;
  return `${minutes}m restantes`;
}

export default function BoostsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [activeBoost, setActiveBoost] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    loadActiveBoost();
  }, []);

  useEffect(() => {
    if (activeBoost?.endAt) {
      const timer = setInterval(() => {
        setTimeLeft(formatTimeLeft(activeBoost.endAt));
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [activeBoost]);

  const loadActiveBoost = async () => {
    try {
      const boost = await getActiveBoost();
      setActiveBoost(boost);
      if (boost?.endAt) {
        setTimeLeft(formatTimeLeft(boost.endAt));
      }
    } catch (err) {
      console.error('Failed to load active boost:', err);
    }
  };

  const handlePurchase = async (boostType: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createBoost(boostType);
      
      console.log('Boost purchase result:', result);
      
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
    loadActiveBoost();
  };

  return (
    <div className="boosts-page">
      <div className="boosts-header">
        <h1>Impulsione seu Perfil</h1>
        <p>Destaque-se e receba mais propostas de trabalho</p>
      </div>

      {activeBoost && (
        <div className="active-boost-banner">
          <div className="active-boost-content">
            <div className="boost-icon">⚡</div>
            <div className="boost-info">
              <h3>Boost Ativo</h3>
              <p className="boost-status">Seu perfil está em destaque</p>
            </div>
            <div className="boost-timer">
              <div className="timer-label">Tempo restante</div>
              <div className="timer-value">{timeLeft}</div>
            </div>
          </div>
          <div className="boost-progress">
            <div className="progress-bar" style={{
              width: `${Math.max(0, Math.min(100, 
                ((new Date(activeBoost.endAt).getTime() - new Date().getTime()) / 
                (activeBoost.durationDays * 24 * 60 * 60 * 1000)) * 100
              ))}%`
            }}></div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="boosts-grid">
        {BOOST_TIERS.map((tier) => (
          <div 
            key={tier.id} 
            className={`boost-card ${tier.popular ? 'popular' : ''} ${activeBoost ? 'disabled' : ''}`}
          >
            {tier.popular && <div className="popular-badge">Mais Popular</div>}
            <h2>{tier.name}</h2>
            <div className="boost-price">{tier.price}</div>
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

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        paymentData={paymentData}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
