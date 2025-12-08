import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../atoms/Card';
import { Button } from '../atoms/Button';
import Image from 'next/image';
import { MapPin, Star } from 'lucide-react';

interface TalentCardProps {
  name: string;
  slug: string;
  imageUrl: string;
  city: string;
  isBoosted?: boolean;
  isOnline?: boolean;
}

export const TalentCard: React.FC<TalentCardProps> = ({ 
  name, 
  slug, 
  imageUrl, 
  city, 
  isBoosted, 
  isOnline 
}) => {
  return (
    <Card className={`group overflow-hidden transition-smooth hover-lift shadow-premium ${isBoosted ? 'ring-2 ring-primary/30 shadow-glow' : ''}`}>
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-800">
        {imageUrl ? (
          <>
            <Image 
              src={imageUrl} 
              alt={name} 
              fill 
              className="object-cover transition-all duration-500 group-hover:scale-110"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        
        {/* Badges */}
        {isBoosted && (
          <div className="absolute top-3 right-3 rounded-full bg-gradient-primary shadow-glow px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
            <Star className="inline h-3 w-3 mr-1" />
            FEATURED
          </div>
        )}
        {isOnline && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs font-bold text-white shadow-premium">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse shadow-glow-gold" />
            ONLINE
          </div>
        )}

        {/* Info Overlay - Shows on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="glass-light rounded-lg p-3">
            <h3 className="text-xl font-bold text-white mb-1 truncate">{name}</h3>
            <div className="flex items-center text-sm text-neutral-200">
              <MapPin className="mr-1.5 h-4 w-4 text-primary-400" />
              {city}
            </div>
          </div>
        </div>
      </div>
      
      <CardFooter className="p-4 bg-neutral-900/50">
        <Button 
          className={`w-full transition-smooth font-semibold ${
            isBoosted 
              ? 'bg-gradient-primary hover:shadow-glow border-0' 
              : 'bg-neutral-800 hover:bg-neutral-700'
          }`} 
          asChild
        >
          <a href={`/talents/${slug}`}>View Profile</a>
        </Button>
      </CardFooter>
    </Card>
  );
};
