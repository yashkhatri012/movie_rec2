import React from 'react';
import { Star, Clock } from 'lucide-react';
import type { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  // Default image if poster_path is missing or invalid
  const fallbackImage = "https://placehold.co/500x750/1F2937/FFFFFF?text=No+Poster";
  
  return (
    <div 
      onClick={onClick}
      className="relative group cursor-pointer rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
      <img
        src={movie.poster_path || fallbackImage}
        alt={movie.title}
        className="w-full h-[400px] object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = fallbackImage;
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent flex flex-col justify-end p-6 translate-y-8 group-hover:translate-y-0 transition-transform">
        <h3 className="text-xl font-bold text-white mb-2">{movie.title}</h3>
        <div className="flex items-center gap-4 text-gray-300 mb-3">
          <div className="flex items-center gap-1">
            <Star size={16} className="text-yellow-500" fill="currentColor" />
            <span>{(movie.vote_average || 0).toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{new Date(movie.release_date).getFullYear()}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap mb-3">
          {(Array.isArray(movie.genres) ? movie.genres : []).map((genre, index) => (
            <span
              key={`${genre}-${index}`}
              className="px-2 py-1 bg-gray-800/80 rounded-full text-xs text-gray-300"
            >
              {genre}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-300 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {movie.overview || 'No overview available'}
        </p>
      </div>
    </div>
  );
}