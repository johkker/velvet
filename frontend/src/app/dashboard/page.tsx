'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import './page.css';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === 'ESTABLISHMENT') {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Bem-vindo, Estabelecimento!</h1>
          <p>Gerencie seu perfil e encontre talentos</p>
        </div>

        <div className="quick-actions">
          <Link href="/dashboard/establishment" className="quick-action-card">
            <div className="quick-action-icon">🏢</div>
            <div className="quick-action-content">
              <h3>Meu Perfil</h3>
              <p>Gerencie as informações do estabelecimento</p>
            </div>
          </Link>
          <Link href="/dashboard/talents" className="quick-action-card">
            <div className="quick-action-icon">👥</div>
            <div className="quick-action-content">
              <h3>Meus Talentos</h3>
              <p>Gerencie e impulsione seus talentos</p>
            </div>
          </Link>
          <Link href="/search" className="quick-action-card">
            <div className="quick-action-icon">🔍</div>
            <div className="quick-action-content">
              <h3>Buscar Talentos</h3>
              <p>Encontre e convide talentos para seu estabelecimento</p>
            </div>
          </Link>
          <Link href="/dashboard/invitations" className="quick-action-card">
            <div className="quick-action-icon">📧</div>
            <div className="quick-action-content">
              <h3>Convites Enviados</h3>
              <p>Gerencie seus convites para talentos</p>
            </div>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent className="dashboard-info">
            <div className="info-field">
              <span className="info-field-label">Email:</span> {user.email}
            </div>
            <div className="info-field">
              <span className="info-field-label">Tipo:</span> {user.role}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const talentProfile = user.talentProfile;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {talentProfile?.displayName || user.email}!</h1>
        <p>Here's an overview of your profile</p>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link href="/dashboard/analytics" className="quick-action-card">
          <div className="quick-action-icon">📊</div>
          <div className="quick-action-content">
            <h3>Suas Métricas</h3>
            <p>Veja o desempenho do seu perfil</p>
          </div>
        </Link>
        <Link href="/dashboard/boosts" className="quick-action-card boost">
          <div className="quick-action-icon">🚀</div>
          <div className="quick-action-content">
            <h3>Impulsionar Perfil</h3>
            <p>Aumente sua visibilidade</p>
          </div>
        </Link>
        <Link href="/dashboard/boosts/history" className="quick-action-card">
          <div className="quick-action-icon">📜</div>
          <div className="quick-action-content">
            <h3>Histórico de Boosts</h3>
            <p>Veja seus boosts anteriores</p>
          </div>
        </Link>
        <Link href="/dashboard/profile" className="quick-action-card">
          <div className="quick-action-icon">✏️</div>
          <div className="quick-action-content">
            <h3>Editar Perfil</h3>
            <p>Atualize suas informações</p>
          </div>
        </Link>
        <Link href="/dashboard/media" className="quick-action-card">
          <div className="quick-action-icon">📸</div>
          <div className="quick-action-content">
            <h3>Gerenciar Fotos</h3>
            <p>Organize suas fotos</p>
          </div>
        </Link>
      </div>
      
      <div className="dashboard-stats">
        <Card>
          <CardHeader className="stat-card-header">
            <CardTitle className="stat-card-title">Profile Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-card-value">
              {talentProfile?.isVerified ? '✓ Verified' : 'Pending'}
            </div>
            <p className="stat-card-label">
              {talentProfile?.status || 'OFFLINE'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="stat-card-header">
            <CardTitle className="stat-card-title">Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-card-value">
              {talentProfile?.city || 'Not set'}
            </div>
            <p className="stat-card-label">
              {talentProfile?.priceMin ? `Starting from $${talentProfile.priceMin}` : 'No price set'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="stat-card-header">
            <CardTitle className="stat-card-title">Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-card-value">
              {talentProfile?.services?.length || 0}
            </div>
            <p className="stat-card-label">
              Services offered
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="dashboard-info">
          <div className="info-field">
            <span className="info-field-label">Email:</span> {user.email}
          </div>
          <div className="info-field">
            <span className="info-field-label">Role:</span> {user.role}
          </div>
          {talentProfile?.bio && (
            <div className="info-field">
              <span className="info-field-label">Bio:</span> {talentProfile.bio}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
