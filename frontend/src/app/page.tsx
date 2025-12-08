import { fetchFeaturedTalents } from '@/lib/api';
import { TalentGrid } from '@/components/organisms/TalentGrid';
import { Button } from '@/components/atoms/Button';
import Link from 'next/link';
import './page.css';

export default async function Home() {
  const { data: featuredTalents } = await fetchFeaturedTalents();

  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background"></div>
        
        <div className="container hero-content mx-auto px-4">
          <h1 className="hero-title">
            <span className="text-gradient">Velvet</span>
          </h1>
          <p className="hero-subtitle">
            Exclusive connections for exclusive moments.
          </p>
          <p className="hero-description">
            Discover verified talents for dinner, travel, events, and unforgettable experiences.
          </p>
          
          {/* CTA Buttons */}
          <div className="hero-cta">
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-primary hover:shadow-glow transition-smooth px-8 py-6 text-lg font-semibold border-0"
            >
              <Link href="/search">Browse Talents</Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="glass-light hover:bg-white/10 transition-smooth px-8 py-6 text-lg font-semibold border-white/20"
            >
              <Link href="/auth/register">Join as Talent</Link>
            </Button>
          </div>
        </div>

        {/* Decorative Gradient Orbs */}
        <div className="hero-orb hero-orb-primary"></div>
        <div className="hero-orb hero-orb-secondary"></div>
      </section>

      {/* Featured Section */}
      <section className="container featured-section mx-auto px-4">
        <div className="featured-header">
          <div>
            <h2 className="featured-title">Featured Talents</h2>
            <p className="featured-subtitle">Discover our most exclusive members</p>
          </div>
          <Button variant="link" asChild className="text-lg hover:text-gradient transition-smooth">
            <Link href="/search">View All →</Link>
          </Button>
        </div>
        <TalentGrid talents={featuredTalents} />
      </section>
    </main>
  );
}
