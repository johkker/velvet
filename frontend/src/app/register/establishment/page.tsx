'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerEstablishment } from '@/lib/api';
import Link from 'next/link';
import './page.css';

export default function RegisterEstablishmentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    slug: '',
    address: '',
    city: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await registerEstablishment(formData);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Registre seu Estabelecimento</h1>
          <p>Cadastre seu clube, casa noturna ou estabelecimento</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Nome do Estabelecimento *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              placeholder="Club Velvet"
            />
          </div>

          <div className="form-group">
            <label htmlFor="slug">URL Personalizada *</label>
            <div className="slug-input">
              <span className="slug-prefix">velvet.com/e/</span>
              <input
                id="slug"
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                placeholder="club-velvet"
              />
            </div>
            <small>Esta será a URL do seu perfil público</small>
          </div>

          <div className="form-group">
            <label htmlFor="address">Endereço *</label>
            <input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              placeholder="Rua Example, 123"
            />
          </div>

          <div className="form-group">
            <label htmlFor="city">Cidade *</label>
            <input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
              placeholder="São Paulo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="contato@estabelecimento.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha *</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Senha *</label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              placeholder="Digite a senha novamente"
              minLength={6}
            />
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Já tem uma conta? <Link href="/login">Faça login</Link>
          </p>
          <p>
            É um talento? <Link href="/register/talent">Registre-se como talento</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
