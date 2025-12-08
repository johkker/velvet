'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchManagedTalents, purchaseBoostForTalents } from '@/lib/api';
import PaymentModal from '@/components/organisms/PaymentModal';
import './page.css';

interface ManagedTalent {
    id: string;
    displayName: string;
    slug: string;
    city?: string;
    isBoosted: boolean;
    activeBoost?: {
        id: string;
        endAt: string;
        durationDays: number;
    } | null;
    acceptedAt: string;
}

const BOOST_TIERS = [
    { id: 'basic_7d', name: 'Basic 7 Dias', price: 'R$ 49,00', duration: 7 },
    { id: 'premium_7d', name: 'Premium 7 Dias', price: 'R$ 79,00', duration: 7 },
    { id: 'premium_30d', name: 'Premium 30 Dias', price: 'R$ 249,00', duration: 30 },
];

export default function ManagedTalentsPage() {
    const [talents, setTalents] = useState<ManagedTalent[]>([]);
    const [selectedTalents, setSelectedTalents] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [showBoostModal, setShowBoostModal] = useState(false);
    const [selectedBoostType, setSelectedBoostType] = useState('');
    const [paymentData, setPaymentData] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        loadTalents();
    }, []);

    async function loadTalents() {
        setLoading(true);
        const response = await fetchManagedTalents();
        setTalents(response.data || []);
        setLoading(false);
    }

    function toggleTalentSelection(talentId: string) {
        if (selectedTalents.includes(talentId)) {
            setSelectedTalents(selectedTalents.filter(id => id !== talentId));
        } else {
            setSelectedTalents([...selectedTalents, talentId]);
        }
    }

    function selectAll() {
        if (selectedTalents.length === talents.length) {
            setSelectedTalents([]);
        } else {
            setSelectedTalents(talents.map(t => t.id));
        }
    }

    async function handlePurchaseBoost(boostType: string) {
        if (selectedTalents.length === 0) {
            alert('Selecione pelo menos um talento');
            return;
        }

        try {
            setSelectedBoostType(boostType);
            const payment = await purchaseBoostForTalents(selectedTalents, boostType);
            setPaymentData(payment);
            setShowBoostModal(true);
        } catch (error: any) {
            alert(error.message || 'Erro ao processar pagamento');
        }
    }

    function handlePaymentSuccess() {
        setShowBoostModal(false);
        setPaymentData(null);
        setSelectedTalents([]);
        loadTalents();
    }

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    function getDaysRemaining(endAt: string) {
        const end = new Date(endAt);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    }

    if (loading) {
        return (
            <div className="managed-talents-page">
                <div className="loading">Carregando talentos...</div>
            </div>
        );
    }

    return (
        <div className="managed-talents-page">
            <div className="page-header">
                <h1>Meus Talentos</h1>
                <p>Gerencie e impulsione os talentos do seu estabelecimento</p>
            </div>

            {talents.length === 0 ? (
                <div className="empty-state">
                    <p>Você ainda não tem talentos associados.</p>
                    <button onClick={() => router.push('/search')} className="btn-primary">
                        Buscar Talentos
                    </button>
                </div>
            ) : (
                <>
                    <div className="selection-bar">
                        <div className="selection-info">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={selectedTalents.length === talents.length}
                                    onChange={selectAll}
                                />
                                <span>
                                    {selectedTalents.length > 0
                                        ? `${selectedTalents.length} selecionado(s)`
                                        : 'Selecionar todos'}
                                </span>
                            </label>
                        </div>

                        {selectedTalents.length > 0 && (
                            <div className="boost-actions">
                                <span className="action-label">Impulsionar selecionados:</span>
                                {BOOST_TIERS.map(tier => (
                                    <button
                                        key={tier.id}
                                        onClick={() => handlePurchaseBoost(tier.id)}
                                        className="btn-boost"
                                    >
                                        {tier.name} ({tier.price})
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="talents-grid">
                        {talents.map(talent => (
                            <div key={talent.id} className="talent-card">
                                <div className="card-header">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedTalents.includes(talent.id)}
                                            onChange={() => toggleTalentSelection(talent.id)}
                                        />
                                    </label>
                                    <h3>{talent.displayName}</h3>
                                    {talent.isBoosted && (
                                        <span className="badge-boosted">🚀 Ativo</span>
                                    )}
                                </div>

                                <div className="card-body">
                                    <p className="city">{talent.city || 'Localização não informada'}</p>

                                    {talent.activeBoost && (
                                        <div className="boost-info">
                                            <p className="boost-duration">
                                                Impulso termina em {getDaysRemaining(talent.activeBoost.endAt)} dias
                                            </p>
                                            <p className="boost-end-date">
                                                {formatDate(talent.activeBoost.endAt)}
                                            </p>
                                        </div>
                                    )}

                                    <p className="accepted-date">
                                        Associado em {formatDate(talent.acceptedAt)}
                                    </p>
                                </div>

                                <div className="card-footer">
                                    <button
                                        onClick={() => router.push(`/talents/${talent.slug}`)}
                                        className="btn-view"
                                    >
                                        Ver Perfil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {showBoostModal && paymentData && (
                <PaymentModal
                    paymentData={paymentData}
                    onClose={() => setShowBoostModal(false)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
}
