'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchMyMetrics } from '@/lib/api';
import { formatMetricValue, formatPercentage } from '@/lib/analytics-utils';
import './page.css';

interface MetricsData {
    profileViews: {
        total: number;
        unique: number;
        byPeriod: Array<{ date: string; count: number }>;
    };
    interactions: {
        total: number;
        contactClicks: number;
        clickThroughRate: number;
        byType: Record<string, number>;
    };
    searchImpressions: {
        total: number;
        averagePosition: string | null;
    };
    performance: {
        engagementRate: number;
        boostImpact: {
            viewsIncrease: string;
            avgViewsBefore: string;
            avgViewsDuring: string;
        } | null;
    };
}

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState<MetricsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('week');

    useEffect(() => {
        loadMetrics();
    }, [period, user]);

    async function loadMetrics() {
        console.log('loadMetrics called, user:', user);
        
        if (!user) {
            console.log('No user');
            setLoading(false);
            return;
        }

        if (user.role !== 'TALENT') {
            console.log('User is not TALENT, role:', user.role);
            setLoading(false);
            return;
        }

        console.log('Fetching my metrics, period:', period);
        setLoading(true);
        
        try {
            const response = await fetchMyMetrics(period);
            console.log('Metrics response:', response);
            setMetrics(response.data);
        } catch (error) {
            console.error('Error fetching metrics:', error);
        } finally {
            setLoading(false);
        }
    }

    if (!user || user.role !== 'TALENT') {
        return (
            <div className="analytics-page">
                <div className="error-state">
                    <p>Esta página é apenas para talentos.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="analytics-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Carregando métricas...</p>
                </div>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="analytics-page">
                <div className="error-state">
                    <p>Erro ao carregar métricas. Tente novamente.</p>
                    <button onClick={loadMetrics} className="btn-retry">
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-page">
            <div className="page-header">
                <h1>Suas Métricas</h1>
                <div className="period-selector">
                    <button
                        className={period === 'day' ? 'active' : ''}
                        onClick={() => setPeriod('day')}
                    >
                        Hoje
                    </button>
                    <button
                        className={period === 'week' ? 'active' : ''}
                        onClick={() => setPeriod('week')}
                    >
                        Semana
                    </button>
                    <button
                        className={period === 'month' ? 'active' : ''}
                        onClick={() => setPeriod('month')}
                    >
                        Mês
                    </button>
                    <button
                        className={period === 'all' ? 'active' : ''}
                        onClick={() => setPeriod('all')}
                    >
                        Tudo
                    </button>
                </div>
            </div>

            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon">👁️</div>
                    <div className="metric-content">
                        <h3>Visualizações</h3>
                        <div className="metric-value">{formatMetricValue(metrics.profileViews?.total || 0)}</div>
                        <div className="metric-subtitle">
                            {metrics.profileViews?.unique || 0} visitantes únicos
                        </div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon">🖱️</div>
                    <div className="metric-content">
                        <h3>Clicks em Contato</h3>
                        <div className="metric-value">{metrics.interactions?.contactClicks || 0}</div>
                        <div className="metric-subtitle">
                            CTR: {formatPercentage(metrics.interactions?.clickThroughRate || 0)}
                        </div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon">💡</div>
                    <div className="metric-content">
                        <h3>Taxa de Engajamento</h3>
                        <div className="metric-value">
                            {formatPercentage(metrics.performance?.engagementRate || 0)}
                        </div>
                        <div className="metric-subtitle">
                            {metrics.interactions?.total || 0} interações totais
                        </div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon">🔍</div>
                    <div className="metric-content">
                        <h3>Impressões em Busca</h3>
                        <div className="metric-value">{formatMetricValue(metrics.searchImpressions?.total || 0)}</div>
                        <div className="metric-subtitle">
                            {metrics.searchImpressions?.averagePosition 
                                ? `Posição média: ${metrics.searchImpressions.averagePosition}`
                                : 'Sem dados de posição'}
                        </div>
                    </div>
                </div>
            </div>

            {metrics.performance?.boostImpact && (
                <div className="boost-impact-section">
                    <h2>Impacto do Boost Ativo</h2>
                    <div className="boost-impact-grid">
                        <div className="impact-card">
                            <div className="impact-label">Aumento de Visualizações</div>
                            <div className="impact-value highlight">
                                {metrics.performance.boostImpact.viewsIncrease}
                            </div>
                        </div>
                        <div className="impact-card">
                            <div className="impact-label">Média Antes do Boost</div>
                            <div className="impact-value">
                                {metrics.performance.boostImpact.avgViewsBefore} views/dia
                            </div>
                        </div>
                        <div className="impact-card">
                            <div className="impact-label">Média Durante o Boost</div>
                            <div className="impact-value">
                                {metrics.performance.boostImpact.avgViewsDuring} views/dia
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {metrics.profileViews?.byPeriod && metrics.profileViews.byPeriod.length > 0 && (
                <div className="chart-section">
                    <h2>Visualizações ao Longo do Tempo</h2>
                    <div className="simple-chart">
                        {metrics.profileViews.byPeriod.map((item, index) => {
                            const maxCount = Math.max(...metrics.profileViews.byPeriod.map(i => i.count));
                            const heightPercentage = (item.count / maxCount) * 100;

                            return (
                                <div key={index} className="chart-bar-container">
                                    <div 
                                        className="chart-bar" 
                                        style={{ height: `${heightPercentage}%` }}
                                        title={`${item.count} views`}
                                    />
                                    <div className="chart-label">
                                        {new Date(item.date).getDate()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {metrics.interactions?.byType && Object.keys(metrics.interactions.byType).length > 0 && (
                <div className="interactions-section">
                    <h2>Tipos de Interação</h2>
                    <div className="interactions-list">
                        {Object.entries(metrics.interactions.byType).map(([type, count]) => (
                            <div key={type} className="interaction-item">
                                <div className="interaction-type">{formatInteractionType(type)}</div>
                                <div className="interaction-count">{count}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function formatInteractionType(type: string): string {
    const types: Record<string, string> = {
        'CONTACT_CLICK': 'Cliques em Contato',
        'PHONE_REVEAL': 'Revelações de Telefone',
        'WHATSAPP_CLICK': 'Cliques no WhatsApp',
        'EMAIL_CLICK': 'Cliques no Email',
        'INVITE_CLICK': 'Cliques em Convite',
    };
    return types[type] || type;
}
