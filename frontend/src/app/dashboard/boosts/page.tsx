'use client';

import { useState, useEffect } from 'react';
import { fetchCurrentUser, getActiveBoost } from '@/lib/api';
import TalentBoostSection from './TalentBoostSection';
import EstablishmentBoostSection from './EstablishmentBoostSection';
import TalentBulkBoostSection from './TalentBulkBoostSection';
import ActiveBoostBanner from './ActiveBoostBanner';
import './page.css';

export default function BoostsPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeBoost, setActiveBoost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get current user role
      const user = await fetchCurrentUser();
      if (user?.data?.role) {
        setUserRole(user.data.role);
      } else if (user?.role) {
        setUserRole(user.role);
      }

      // Get active boost
      const boost = await getActiveBoost();
      setActiveBoost(boost);
    } catch (err) {
      console.error('Failed to load boost data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="boosts-page">
        <div className="boosts-header">
          <h1>Impulsione seu Perfil</h1>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="boosts-page">
      <div className="boosts-header">
        <h1>Impulsione seu Perfil</h1>
        <p>Destaque-se e atraia mais oportunidades</p>
      </div>

      <ActiveBoostBanner activeBoost={activeBoost} />

      {/* Show components based on user role */}
      {userRole === 'TALENT' && (
        <TalentBoostSection activeBoost={activeBoost} onSuccess={handleSuccess} />
      )}

      {userRole === 'ESTABLISHMENT' && (
        <>
          <EstablishmentBoostSection activeBoost={activeBoost} onSuccess={handleSuccess} />
          <TalentBulkBoostSection onSuccess={handleSuccess} />
        </>
      )}

      {!userRole && (
        <div className="error-message">
          Não foi possível determinar seu tipo de usuário. Por favor, recarregue a página.
        </div>
      )}
    </div>
  );
}
