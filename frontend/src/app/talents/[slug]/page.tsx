import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/atoms/Button';
import { Card, CardContent } from '@/components/atoms/Card';
import { ServiceBadge } from '@/components/atoms/ServiceBadge';
import { MapPin, CheckCircle } from 'lucide-react';
import { fetchTalentProfile } from '@/lib/api';
import { InviteButton } from '@/components/organisms/InviteButton';
import './page.css';

export default async function TalentProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const response = await fetchTalentProfile(slug);
  
  if (!response || !response.data) {
    notFound();
  }
  
  const talent = response.data;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="profile-container">
        {/* Left Column: Photos & Bio */}
        <div className="profile-left">
          <div className="profile-main-photo">
            {talent.photoGallery?.find((p: any) => p.isMain)?.url && (
              <Image
                src={talent.photoGallery.find((p: any) => p.isMain).url}
                alt={talent.displayName}
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
          
          <section className="profile-section">
            <h2 className="profile-section-title">About Me</h2>
            <p className="profile-bio">
              {talent.bio || 'No bio provided yet.'}
            </p>
          </section>

          {talent.photoGallery && talent.photoGallery.length > 0 && (
            <section className="profile-section">
              <h2 className="profile-section-title">Gallery</h2>
              <div className="profile-gallery">
                {talent.photoGallery.map((photo: any, i: number) => (
                  <div key={photo.id || i} className="profile-gallery-item">
                    <Image
                      src={photo.url}
                      alt={`Gallery ${i + 1}`}
                      fill
                      className="profile-gallery-image"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Info & Actions */}
        <aside className="profile-sidebar">
          {/* Talent Info Card - First */}
          <Card className="profile-info-card">
            <CardContent className="profile-info-content">
              <div className="profile-header">
                <h1 className="profile-name">
                  {talent.displayName}
                  {talent.isVerified && <CheckCircle className="profile-verified-icon" />}
                </h1>
                <div className="profile-location">
                  <MapPin className="profile-location-icon" />
                  {talent.city} {talent.age && `• ${talent.age} years old`}
                </div>
              </div>

              {/* Languages & Availability */}
              {(talent.languages?.length > 0 || talent.outcall || talent.incall || talent.availability) && (
                <div className="profile-extra-info">
                  {talent.languages && talent.languages.length > 0 && (
                    <div className="info-row">
                      <span className="info-icon">🗣️</span>
                      <div>
                        <div className="info-label">Languages</div>
                        <div className="info-value">{talent.languages.join(', ')}</div>
                      </div>
                    </div>
                  )}
                  {(talent.outcall || talent.incall) && (
                    <div className="info-row">
                      <span className="info-icon">📍</span>
                      <div>
                        <div className="info-label">Service Type</div>
                        <div className="info-value">
                          {[talent.outcall && 'Outcall', talent.incall && 'Incall'].filter(Boolean).join(' • ')}
                        </div>
                      </div>
                    </div>
                  )}
                  {talent.availability && (
                    <div className="info-row">
                      <span className="info-icon">⏰</span>
                      <div>
                        <div className="info-label">Availability</div>
                        <div className="info-value">{talent.availability}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {talent.services && talent.services.length > 0 && (
                <div className="profile-services">
                  <h3 className="profile-services-title">Services</h3>
                  <div className="profile-services-list">
                    {talent.services.map((service: string) => (
                      <span key={service} className="service-tag">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Physical Attributes Card - Second */}
          {(talent.hairColor || talent.eyeColor || talent.bodyType || talent.height || talent.skinTone || talent.ethnicity) && (
            <Card className="profile-attributes-card">
              <CardContent className="profile-attributes-content">
                <h3 className="attribute-section-title">Physical Attributes</h3>
                <div className="attribute-grid">
                  {talent.hairColor && (
                    <div className="attribute-item">
                      <span className="attribute-icon">💇</span>
                      <div>
                        <div className="attribute-label">Hair</div>
                        <div className="attribute-value">{talent.hairColor}</div>
                      </div>
                    </div>
                  )}
                  {talent.eyeColor && (
                    <div className="attribute-item">
                      <span className="attribute-icon">👁️</span>
                      <div>
                        <div className="attribute-label">Eyes</div>
                        <div className="attribute-value">{talent.eyeColor}</div>
                      </div>
                    </div>
                  )}
                  {talent.bodyType && (
                    <div className="attribute-item">
                      <span className="attribute-icon">💪</span>
                      <div>
                        <div className="attribute-label">Body</div>
                        <div className="attribute-value">{talent.bodyType}</div>
                      </div>
                    </div>
                  )}
                  {talent.height && (
                    <div className="attribute-item">
                      <span className="attribute-icon">📏</span>
                      <div>
                        <div className="attribute-label">Height</div>
                        <div className="attribute-value">
                          {talent.height} cm ({Math.floor(talent.height / 30.48)}\'{Math.round((talent.height % 30.48) / 2.54)}")
                        </div>
                      </div>
                    </div>
                  )}
                  {talent.skinTone && (
                    <div className="attribute-item">
                      <span className="attribute-icon">🌟</span>
                      <div>
                        <div className="attribute-label">Skin</div>
                        <div className="attribute-value">{talent.skinTone}</div>
                      </div>
                    </div>
                  )}
                  {talent.ethnicity && (
                    <div className="attribute-item">
                      <span className="attribute-icon">🌍</span>
                      <div>
                        <div className="attribute-label">Ethnicity</div>
                        <div className="attribute-value">{talent.ethnicity}</div>
                      </div>
                    </div>
                  )}
                  {(talent.tattoos || talent.piercings) && (
                    <div className="attribute-item">
                      <span className="attribute-icon">✨</span>
                      <div>
                        <div className="attribute-label">Features</div>
                        <div className="attribute-value">
                          {[talent.tattoos && 'Tattoos', talent.piercings && 'Piercings'].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA Card - Sticky on Desktop */}
          <div className="profile-cta-sticky">
            <Card className="profile-cta-card">
              <CardContent className="profile-cta-content">
                {talent.priceMin && (
                  <div className="profile-price-card">
                    <div className="profile-price-label">Starting from</div>
                    <div className="profile-price-value">${talent.priceMin}</div>
                  </div>
                )}

                <div className="profile-actions">
                  <InviteButton talentId={talent.id} talentName={talent.displayName} />
                  {talent.contactLink && (
                    <Button asChild className="profile-contact-btn" size="lg">
                      <a href={talent.contactLink} target="_blank" rel="noopener noreferrer">
                        Contact Now
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </main>
  );
}
