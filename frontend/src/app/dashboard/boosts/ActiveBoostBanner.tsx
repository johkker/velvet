'use client';

import { useState, useEffect } from 'react';
import './active-boost-banner.css';

interface ActiveBoostBannerProps {
  activeBoost: any;
}

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

export default function ActiveBoostBanner({ activeBoost }: ActiveBoostBannerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (activeBoost?.endAt) {
      setTimeLeft(formatTimeLeft(activeBoost.endAt));
      
      const timer = setInterval(() => {
        setTimeLeft(formatTimeLeft(activeBoost.endAt));
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [activeBoost]);

  if (!activeBoost) return null;

  return (
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
  );
}
