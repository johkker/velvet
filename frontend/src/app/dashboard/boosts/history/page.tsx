'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchTalentBoostHistory } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/analytics-utils';
import './page.css';

interface BoostHistoryItem {
    id: string;
    boostType: string;
    durationDays: number;
    startAt: string;
    endAt: string;
    status: string;
    paidBy: 'SELF' | 'ESTABLISHMENT';
    paidByEstablishment?: {
        id: string;
        name: string;
    } | null;
    payment: {
        amount: number;
        paidAt: string;
        status: string;
    } | null;
}

export default function BoostHistoryPage() {
    const { user } = useAuth();
    const [history, setHistory] = useState<BoostHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const limit = 10;

    useEffect(() => {
        loadHistory();
    }, [page, user]);

    async function loadHistory() {
        if (!user || user.role !== 'TALENT') return;

        setLoading(true);
        const response = await fetchTalentBoostHistory(limit, page * limit);
        setHistory(response.data || []);
        setTotal(response.meta?.total || 0);
        setLoading(false);
    }

    if (!user || user.role !== 'TALENT') {
        return (
            <div className="boost-history-page">
                <div className="error-state">
                    <p>Esta página é apenas para talentos.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="boost-history-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Carregando histórico...</p>
                </div>
            </div>
        );
    }

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="boost-history-page">
            <div className="page-header">
                <h1>Histórico de Boosts</h1>
                <p>Veja todos os boosts que você já teve</p>
            </div>

            {history.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🚀</div>
                    <h2>Nenhum boost ainda</h2>
                    <p>Você ainda não teve nenhum boost ativo.</p>
                    <a href="/dashboard/boosts" className="btn-primary">
                        Impulsionar Perfil
                    </a>
                </div>
            ) : (
                <>
                    <div className="history-table">
                        <div className="table-header">
                            <div className="col-type">Tipo</div>
                            <div className="col-duration">Duração</div>
                            <div className="col-period">Período</div>
                            <div className="col-paid-by">Pago Por</div>
                            <div className="col-amount">Valor</div>
                            <div className="col-status">Status</div>
                        </div>

                        {history.map((boost) => (
                            <div key={boost.id} className="table-row">
                                <div className="col-type">
                                    <div className="boost-type-badge">
                                        {formatBoostType(boost.boostType)}
                                    </div>
                                </div>
                                <div className="col-duration">
                                    {boost.durationDays} dias
                                </div>
                                <div className="col-period">
                                    <div className="period-dates">
                                        <div>{boost.startAt ? formatDate(boost.startAt) : '-'}</div>
                                        <div className="date-separator">até</div>
                                        <div>{boost.endAt ? formatDate(boost.endAt) : '-'}</div>
                                    </div>
                                </div>
                                <div className="col-paid-by">
                                    {boost.paidBy === 'SELF' ? (
                                        <span className="paid-self">Você</span>
                                    ) : (
                                        <div className="paid-establishment">
                                            <span className="establishment-icon">🏢</span>
                                            <span>{boost.paidByEstablishment?.name || 'Estabelecimento'}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="col-amount">
                                    {boost.payment ? formatCurrency(boost.payment.amount) : '-'}
                                </div>
                                <div className="col-status">
                                    <span className={`status-badge status-${boost.status.toLowerCase()}`}>
                                        {formatStatus(boost.status)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                                className="pagination-btn"
                            >
                                ← Anterior
                            </button>
                            <div className="pagination-info">
                                Página {page + 1} de {totalPages}
                            </div>
                            <button
                                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                disabled={page >= totalPages - 1}
                                className="pagination-btn"
                            >
                                Próxima →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function formatBoostType(type: string): string {
    const types: Record<string, string> = {
        'basic_3d': 'Básico 3 Dias',
        'basic_7d': 'Básico 7 Dias',
        'premium_7d': 'Premium 7 Dias',
        'premium_30d': 'Premium 30 Dias',
    };
    return types[type] || type;
}

function formatStatus(status: string): string {
    const statuses: Record<string, string> = {
        'PENDING': 'Pendente',
        'ACTIVE': 'Ativo',
        'EXPIRED': 'Expirado',
        'CANCELLED': 'Cancelado',
    };
    return statuses[status] || status;
}
