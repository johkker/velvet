'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { sendInvitation } from '@/lib/api';
import { Button } from '@/components/atoms/Button';
import './InviteButton.css';

interface InviteButtonProps {
    talentId: string;
    talentName: string;
}

export function InviteButton({ talentId, talentName }: InviteButtonProps) {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!user || user.role !== 'ESTABLISHMENT') {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await sendInvitation(talentId, message);
            setSuccess(true);
            setTimeout(() => {
                setIsModalOpen(false);
                setSuccess(false);
                setMessage('');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button 
                onClick={() => setIsModalOpen(true)} 
                className="invite-button"
                size="lg"
            >
                📧 Enviar Convite
            </Button>

            {isModalOpen && (
                <div className="invite-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="invite-modal-header">
                            <h2>Convite para {talentName}</h2>
                            <button 
                                className="invite-modal-close"
                                onClick={() => setIsModalOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        {success ? (
                            <div className="invite-success">
                                <div className="success-icon">✓</div>
                                <h3>Convite enviado com sucesso!</h3>
                                <p>O talento receberá sua mensagem em breve.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="invite-form">
                                {error && (
                                    <div className="invite-error">{error}</div>
                                )}

                                <div className="form-group">
                                    <label htmlFor="message">Mensagem (opcional)</label>
                                    <textarea
                                        id="message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Gostaria de convidar você para trabalhar em nosso estabelecimento..."
                                        rows={4}
                                    />
                                    <small>Escreva uma mensagem personalizada para o talento</small>
                                </div>

                                <div className="invite-modal-actions">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsModalOpen(false)}
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? 'Enviando...' : 'Enviar Convite'}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
