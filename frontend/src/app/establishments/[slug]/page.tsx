'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/organisms/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface Establishment {
  id: string;
  name: string;
  slug: string;
  city: string;
  address?: string;
  createdAt: string;
}

export default function EstablishmentProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEstablishment();
  }, [slug]);

  const loadEstablishment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/establishments/${slug}`);
      if (!res.ok) {
        throw new Error('Establishment not found');
      }
      const data = await res.json();
      setEstablishment(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <Card className="animate-pulse">
                <CardHeader>
                  <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4"></div>
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !establishment) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="text-center py-12">
                  <h2 className="text-2xl font-bold mb-2">Establishment Not Found</h2>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {error || 'The establishment you are looking for does not exist.'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{establishment.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                      Location
                    </h3>
                    <p className="text-lg">📍 {establishment.city}</p>
                    {establishment.address && (
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
                        {establishment.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                      Joined
                    </h3>
                    <p className="text-lg">
                      {new Date(establishment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6 dark:border-neutral-800">
                  <h3 className="font-semibold text-lg mb-2">About</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    This establishment is looking for talented performers. Contact them to learn more about opportunities.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
