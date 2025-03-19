import React, { useState } from 'react';
import { Film, Search } from 'lucide-react';
import { MovieCard } from './components/MovieCard';
import { MovieDetails } from './components/MovieDetails';
import type { Movie, MovieDetails as MovieDetailsType } from './types';
import axios from "axios";


const API_URL = 'http://localhost:5000';

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetailsType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);



  const fetchRecommendations = async (movieName: string) => {
    try {
      setLoading(true);
      console.log('🔍 Searching for:', movieName);
      
      const response = await axios.post('http://localhost:5000/recommend', {
        movie: movieName,
      });
      
      console.log('📦 Raw response data:', response.data);
      
      // If no recommendations found
      if (!response.data || response.data.error) {
        console.log('❌ No recommendations found:', response.data?.error || 'Unknown error');
        alert(response.data?.error || 'No recommendations found');
        setMovies([]);
        setLoading(false);
        return;
      }

      // Ensure we're working with an array
      const recommendedMovies = Array.isArray(response.data) ? response.data : [response.data];
      console.log('📋 Processing movies:', recommendedMovies);

      const transformedMovies = recommendedMovies
        .filter(movie => movie && movie.title) // Only process movies with at least a title
        .map(movie => {
          console.log('🎬 Processing movie:', movie);
          
          // Parse genres
          let parsedGenres: string[] = [];
          try {
            if (typeof movie.genres === 'string') {
              // Handle string format like "['Action', 'Adventure']"
              const genresString = movie.genres.replace(/'/g, '"');
              parsedGenres = JSON.parse(genresString);
            } else if (Array.isArray(movie.genres)) {
              parsedGenres = movie.genres;
            }
          } catch (e) {
            console.error('Error parsing genres:', e);
            parsedGenres = [];
          }

          // Parse cast
          let parsedCast: string[] = [];
          try {
            if (typeof movie.cast === 'string') {
              // Handle string format like "['Actor1', 'Actor2']"
              const castString = movie.cast.replace(/'/g, '"');
              parsedCast = JSON.parse(castString);
            } else if (Array.isArray(movie.cast)) {
              parsedCast = movie.cast;
            }
          } catch (e) {
            console.error('Error parsing cast:', e);
            parsedCast = [];
          }

          // Parse director
          let parsedDirector = '';
          try {
            if (typeof movie.director === 'string') {
              const directorString = movie.director.replace(/'/g, '"');
              const directors = JSON.parse(directorString);
              parsedDirector = Array.isArray(directors) ? directors[0] : directors;
            } else if (Array.isArray(movie.director)) {
              parsedDirector = movie.director[0];
            } else {
              parsedDirector = movie.director || 'Unknown Director';
            }
          } catch (e) {
            console.error('Error parsing director:', e);
            parsedDirector = 'Unknown Director';
          }

          // Extract movie_id from the poster URL or use a provided movie_id
          let movieId = movie.movie_id;
          
          if (!movieId && typeof movie.id === 'number') {
            movieId = movie.id;
          }
          
          if (!movieId && movie.poster) {
            try {
              const match = movie.poster.match(/\/movie\/(\d+)\?/);
              if (match) {
                movieId = parseInt(match[1]);
              }
            } catch (e) {
              console.error('Error extracting movie ID from poster URL:', e);
            }
          }

          console.log('Movie ID found:', movieId);  // Add logging

          return {
            id: movieId || Math.random(), // Only use random ID as last resort
            movie_id: movieId, // Keep the original movie_id
            title: movie.title,
            overview: movie.overview || 'No overview available',
            poster_path: movie.poster || '',
            vote_average: Number(movie.vote_average) || 0,
            release_date: movie.year ? `${movie.year}-01-01` : '2000-01-01',
            genres: parsedGenres,
            cast: parsedCast,
            director: parsedDirector,
            runtime: Number(movie.runtime) || 0,
            tagline: movie.tagline || 'No tagline available'
          };
        });

      console.log('✨ Transformed movies:', transformedMovies);
      
      if (transformedMovies.length === 0) {
        console.log('⚠️ No valid movies found in response');
        alert('No valid recommendations found');
      }
      
      setMovies(transformedMovies);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching recommendations:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        });
        // Show error message to user
        alert(error.response?.data?.error || 'Error fetching recommendations');
      } else {
        alert('An unexpected error occurred');
      }
      setMovies([]);
      setLoading(false);
    }
  };
  
  // Fetch full movie details
  const fetchMovieDetails = async (movieId: number) => {
    try {
      console.log('Fetching details for movie ID:', movieId);
      const response = await axios.get(`${API_URL}/movie/${movieId}`);
      setSelectedMovie({ ...response.data, id: movieId });
    } catch (error) {
      console.error('Error fetching movie details:', error);
      // Show some user feedback here
    }
  };

  const handleMovieClick = async (movie: Movie) => {
    console.log('Handling click for movie:', movie);
    
    const movieId = movie.movie_id || movie.id;
    
    if (movieId) {
      console.log('Using movie ID for details:', movieId);
      fetchMovieDetails(movieId);
    } else {
      console.error('No valid movie ID available');
      // Show some user feedback
      alert('Sorry, cannot retrieve details for this movie');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) fetchRecommendations(searchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Film className="text-purple-500" size={32} />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                MovieVerse
              </h1>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies..."
                  className="pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-100 placeholder-gray-400"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-gray-100">Popular Movies</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={() => handleMovieClick(movie)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {selectedMovie && (
        <MovieDetails
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}

export default App;