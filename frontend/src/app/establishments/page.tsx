'use client';

import { useState, useEffect } from 'react';
import { fetchEstablishments } from '@/lib/api';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';

interface Establishment {
  id: string;
  name: string;
  slug: string;
  city: string;
  address?: string;
  createdAt: string;
}

export default function EstablishmentsPage() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadEstablishments();
  }, []);

  const loadEstablishments = async () => {
    setLoading(true);
    try {
      const response = await fetchEstablishments();
      const data = response.data?.data || response.data || [];
      setEstablishments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load establishments:', error);
      setEstablishments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEstablishments = establishments.filter(est =>
    est.name.toLowerCase().includes(filter.toLowerCase()) ||
    est.city.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-16">
      <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Establishments</h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Browse venues and clubs looking for talent
              </p>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Search by name or city..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2"></div>
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredEstablishments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {filter ? 'No establishments found matching your search.' : 'No establishments available yet.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEstablishments.map((establishment) => (
                  <Link
                    key={establishment.id}
                    href={`/establishments/${establishment.slug}`}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {establishment.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <p className="text-neutral-600 dark:text-neutral-400">
                            📍 {establishment.city}
                          </p>
                          {establishment.address && (
                            <p className="text-neutral-500 dark:text-neutral-500 text-xs">
                              {establishment.address}
                            </p>
                          )}
                          <p className="text-neutral-400 dark:text-neutral-600 text-xs">
                            Joined {new Date(establishment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
