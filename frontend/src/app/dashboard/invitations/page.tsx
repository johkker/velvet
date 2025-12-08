'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { fetchInvitations, acceptInvitation, fetchSentInvitations } from '@/lib/api';

export default function DashboardInvitationsPage() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadInvitations();
  }, [user]);

  const loadInvitations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (user.role === 'ESTABLISHMENT') {
        const response = await fetchSentInvitations();
        setInvitations(response.data || []);
      } else {
        const response = await fetchInvitations();
        setInvitations(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    setActionLoading(id);
    try {
      await acceptInvitation(id);
      await loadInvitations();
      alert('Invitation accepted!');
    } catch (error: any) {
      alert(error.message || 'Failed to accept invitation');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">
          {user?.role === 'ESTABLISHMENT' ? 'Convites Enviados' : 'Convites Recebidos'}
        </h1>
        <div>Carregando...</div>
      </div>
    );
  }

  if (user?.role === 'ESTABLISHMENT') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Convites Enviados</h1>
          <p className="text-muted-foreground">
            Gerencie os convites que você enviou para talentos
          </p>
        </div>
        
        {invitations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <p className="mb-4">Você ainda não enviou nenhum convite</p>
              <Link href="/search">
                <Button>Buscar Talentos</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <Card key={invitation.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Convite para {invitation.talent?.displayName || 'Talento'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invitation.message && (
                      <p className="text-muted-foreground">
                        "{invitation.message}"
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Status:</span>{' '}
                        <span className={`font-medium ${
                          invitation.status === 'ACCEPTED' ? 'text-green-600' :
                          invitation.status === 'REJECTED' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {invitation.status === 'ACCEPTED' ? 'Aceito' :
                           invitation.status === 'REJECTED' ? 'Rejeitado' :
                           'Pendente'}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        {new Date(invitation.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    {invitation.talent?.slug && (
                      <Link href={`/talents/${invitation.talent.slug}`}>
                        <Button variant="outline" size="sm">
                          Ver Perfil
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Convites</h1>
      
      {invitations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Nenhum convite no momento
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <Card key={invitation.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Convite de {invitation.from_establishment?.name || 'Estabelecimento'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {invitation.message || 'Sem mensagem'}
                </p>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Status: <span className="font-medium">{invitation.status}</span>
                  </div>
                </div>
                {invitation.status === 'PENDING' && (
                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={() => handleAccept(invitation.id)}
                      disabled={actionLoading === invitation.id}
                    >
                      {actionLoading === invitation.id ? 'Aceitando...' : 'Aceitar'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
