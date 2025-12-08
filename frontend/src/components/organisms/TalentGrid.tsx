import React from 'react';
import { TalentCard } from '../molecules/TalentCard';

interface Talent {
  id: string;
  slug: string;
  displayName: string;
  city: string;
  photoMain?: string;
  isBoosted?: boolean;
  isOnline?: boolean;
}

interface TalentGridProps {
  talents: Talent[];
  isLoading?: boolean;
}

export const TalentGrid: React.FC<TalentGridProps> = ({ talents, isLoading }) => {
  const safeTalents = talents || [];
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="aspect-[3/4] w-full animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (safeTalents.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        No talents found matching your criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {safeTalents.map((talent) => (
        <TalentCard
          key={talent.id}
          name={talent.displayName}
          slug={talent.slug}
          imageUrl={talent.photoMain || ''}
          city={talent.city}
          isBoosted={talent.isBoosted}
          isOnline={talent.isOnline}
        />
      ))}
    </div>
  );
};
