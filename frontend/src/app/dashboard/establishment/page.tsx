'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchEstablishmentProfile, updateEstablishmentProfile } from '@/lib/api';
import { useRouter } from 'next/navigation';
import './page.css';

interface EstablishmentProfile {
    id: string;
    name: string;
    slug: string;
    address?: string;
    city?: string;
    createdAt: string;
}

export default function EstablishmentProfilePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<EstablishmentProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
    });

    useEffect(() => {
        if (user?.role !== 'ESTABLISHMENT') {
            router.push('/dashboard');
            return;
        }
        loadProfile();
    }, [user, router]);

    const loadProfile = async () => {
        try {
            const response = await fetchEstablishmentProfile();
            if (response?.data) {
                setProfile(response.data);
                setFormData({
                    name: response.data.name || '',
                    address: response.data.address || '',
                    city: response.data.city || '',
                });
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const response = await updateEstablishmentProfile(formData);
            if (response?.data) {
                setProfile(response.data);
                setSuccess('Perfil atualizado com sucesso!');
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="establishment-profile-page">
                <div className="loading">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="establishment-profile-page">
            <div className="profile-header">
                <h1>Perfil do Estabelecimento</h1>
                <p>Gerencie as informações do seu estabelecimento</p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="profile-content">
                <div className="profile-info-card">
                    <h3>Informações Públicas</h3>
                    <div className="info-item">
                        <span className="info-label">URL do Perfil:</span>
                        <span className="info-value">
                            velvet.com/e/{profile?.slug}
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Criado em:</span>
                        <span className="info-value">
                            {profile?.createdAt && new Date(profile.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-section">
                        <h2>Informações Básicas</h2>
                        
                        <div className="form-group">
                            <label htmlFor="name">Nome do Estabelecimento *</label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="Nome do estabelecimento"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="city">Cidade *</label>
                            <input
                                id="city"
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                placeholder="São Paulo"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="address">Endereço Completo</label>
                            <textarea
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Rua, número, bairro"
                                rows={3}
                            />
                            <small>Endereço completo do estabelecimento</small>
                        </div>
                    </div>

                    <button type="submit" disabled={saving} className="submit-button">
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </form>
            </div>
        </div>
    );
}
