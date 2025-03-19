import React from 'react';
import { X, Clock, Star, Calendar, Users, Video } from 'lucide-react';
import type { MovieDetails } from '../types';

interface MovieDetailsProps {
  movie: MovieDetails | null;
  onClose: () => void;
}

export function MovieDetails({ movie, onClose }: MovieDetailsProps) {
  if (!movie) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors z-10"
          >
            <X size={24} />
          </button>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
            <img
              src={movie.poster_path}
              alt={movie.title}
              className="w-full h-[400px] object-cover rounded-t-2xl"
            />
          </div>
        </div>
        
        <div className="p-6 -mt-20 relative">
          <h2 className="text-4xl font-bold mb-2 text-white">{movie.title}</h2>
          <p className="text-purple-400 italic mb-6">{movie.tagline}</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="flex items-center gap-2 bg-gray-800/50 p-3 rounded-lg">
              <Clock size={20} className="text-purple-500" />
              <span className="text-gray-300">{movie.runtime} min</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 p-3 rounded-lg">
              <Star size={20} className="text-yellow-500" />
              <span className="text-gray-300">{movie.vote_average.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 p-3 rounded-lg">
              <Calendar size={20} className="text-purple-500" />
              <span className="text-gray-300">{new Date(movie.release_date).getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 p-3 rounded-lg">
              <Video size={20} className="text-purple-500" />
              <span className="text-gray-300">{movie.director}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-white">Overview</h3>
              <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 text-white">Genres</h3>
              <div className="flex gap-2 flex-wrap">
                {movie.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-gray-800 rounded-full text-sm text-purple-400"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
                <Users className="text-purple-500" />
                Cast
              </h3>
              <div className="flex gap-2 flex-wrap">
                {movie.cast.map((actor) => (
                  <span
                    key={actor}
                    className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300"
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}