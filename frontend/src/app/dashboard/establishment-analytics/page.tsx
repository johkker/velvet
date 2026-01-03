'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchManagedTalentsMetrics } from '@/lib/api';
import { formatMetricValue, formatPercentage } from '@/lib/analytics-utils';
import './page.css';

interface TalentMetrics {
    talentId: string;
    talentName: string;
    slug: string;
    profileViews: {
        total: number;
        unique: number;
    };
    interactions: {
        total: number;
        contactClicks: number;
        clickThroughRate: number;
    };
    isBoosted: boolean;
    engagementRate: number;
}

interface ManagedTalentsMetricsData {
    totalViews: number;
    totalInteractions: number;
    averageEngagement: number;
    talentMetrics: TalentMetrics[];
}

export default function EstablishmentAnalyticsPage() {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState<ManagedTalentsMetricsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'views' | 'engagement' | 'interactions'>('views');
    const [filterBoosted, setFilterBoosted] = useState<'all' | 'boosted' | 'unboosted'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadMetrics();
    }, [user]);

    async function loadMetrics() {
        if (!user || user.role !== 'ESTABLISHMENT') {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await fetchManagedTalentsMetrics(user.id);
            setMetrics(response.data);
        } catch (error) {
            console.error('Error fetching managed talents metrics:', error);
        } finally {
            setLoading(false);
        }
    }

    if (!user || user.role !== 'ESTABLISHMENT') {
        return (
            <div className="establishment-analytics-page">
                <div className="error-state">
                    <p>Esta página é apenas para estabelecimentos.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="establishment-analytics-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Carregando métricas...</p>
                </div>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="establishment-analytics-page">
                <div className="error-state">
                    <p>Erro ao carregar métricas. Tente novamente.</p>
                    <button onClick={loadMetrics} className="btn-retry">
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    // Filter and sort talents
    let filteredTalents = metrics.talentMetrics.filter(t => {
        const matchesSearch = t.talentName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = 
            filterBoosted === 'all' || 
            (filterBoosted === 'boosted' && t.isBoosted) ||
            (filterBoosted === 'unboosted' && !t.isBoosted);
        return matchesSearch && matchesFilter;
    });

    // Sort talents
    const sortedTalents = [...filteredTalents].sort((a, b) => {
        switch (sortBy) {
            case 'views':
                return b.profileViews.total - a.profileViews.total;
            case 'engagement':
                return b.engagementRate - a.engagementRate;
            case 'interactions':
                return b.interactions.total - a.interactions.total;
            default:
                return 0;
        }
    });

    return (
        <div className="establishment-analytics-page">
            <div className="page-header">
                <h1>Métricas dos Talentos</h1>
                <p>Acompanhe o desempenho de todos os talentos do seu estabelecimento</p>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card">
                    <div className="card-icon">👁️</div>
                    <div className="card-content">
                        <h3>Total de Visualizações</h3>
                        <div className="card-value">{formatMetricValue(metrics.totalViews)}</div>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-icon">🔗</div>
                    <div className="card-content">
                        <h3>Total de Interações</h3>
                        <div className="card-value">{formatMetricValue(metrics.totalInteractions)}</div>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-icon">📊</div>
                    <div className="card-content">
                        <h3>Engajamento Médio</h3>
                        <div className="card-value">{formatPercentage(metrics.averageEngagement)}</div>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-icon">⭐</div>
                    <div className="card-content">
                        <h3>Talentos Ativos</h3>
                        <div className="card-value">{metrics.talentMetrics.length}</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="controls-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Buscar talento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="filter-controls">
                    <div className="filter-group">
                        <label>Status:</label>
                        <select value={filterBoosted} onChange={(e) => setFilterBoosted(e.target.value as any)} className="select-input">
                            <option value="all">Todos</option>
                            <option value="boosted">Com Boost</option>
                            <option value="unboosted">Sem Boost</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Ordenar por:</label>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="select-input">
                            <option value="views">Visualizações</option>
                            <option value="engagement">Engajamento</option>
                            <option value="interactions">Interações</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Talents Table */}
            {sortedTalents.length === 0 ? (
                <div className="empty-state">
                    <p>Nenhum talento encontrado com os filtros selecionados.</p>
                </div>
            ) : (
                <div className="talents-table-container">
                    <table className="talents-table">
                        <thead>
                            <tr>
                                <th>Talento</th>
                                <th className="numeric">Visualizações</th>
                                <th className="numeric">Visitantes Únicos</th>
                                <th className="numeric">Interações</th>
                                <th className="numeric">Cliques no Contato</th>
                                <th className="numeric">Taxa de Engajamento</th>
                                <th className="status">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTalents.map(talent => (
                                <tr key={talent.talentId} className={talent.isBoosted ? 'boosted' : ''}>
                                    <td className="talent-name">
                                        <a href={`/talents/${talent.slug}`} target="_blank" rel="noopener noreferrer">
                                            {talent.talentName}
                                        </a>
                                    </td>
                                    <td className="numeric">{formatMetricValue(talent.profileViews.total)}</td>
                                    <td className="numeric">{formatMetricValue(talent.profileViews.unique)}</td>
                                    <td className="numeric">{formatMetricValue(talent.interactions.total)}</td>
                                    <td className="numeric">{formatMetricValue(talent.interactions.contactClicks)}</td>
                                    <td className="numeric">
                                        <span className="metric-badge">
                                            {formatPercentage(talent.engagementRate)}
                                        </span>
                                    </td>
                                    <td className="status">
                                        {talent.isBoosted ? (
                                            <span className="badge-boosted">⭐ Impulsionado</span>
                                        ) : (
                                            <span className="badge-unboosted">Normal</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Action Bar */}
            <div className="action-bar">
                <button onClick={loadMetrics} className="btn-refresh">
                    🔄 Atualizar Dados
                </button>
                <button className="btn-export">
                    📥 Exportar CSV
                </button>
            </div>
        </div>
    );
}
