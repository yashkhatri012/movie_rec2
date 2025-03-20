import React, { useState ,useEffect  } from 'react';
import { Film, Search } from 'lucide-react';
import { MovieCard } from './components/MovieCard';
import { MovieDetails } from './components/MovieDetails';
import type { Movie, MovieDetails as MovieDetailsType } from './types';
import axios from 'axios';


function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetailsType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);


  // 🧹 Helper to transform API response
  const transformMovie = (data: any): Movie => ({
    id: data.movie_id,
    title: data.title,
    poster_path: data.poster,
    vote_average: data.vote_average,
    release_date: data.year,
    genres: JSON.parse(data.genres.replace(/'/g, '"')), // Convert string to array
  });

  // ✅ Fetch movies from API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/recommend');
        const transformedMovies = response.data.map(transformMovie);
        setMovies(transformedMovies);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // ✅ Fetch movie details
  const handleMovieClick = async (movieId: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/recommend/${movieId}`);
      const movieDetails = response.data;

      // Parse arrays and keep the format consistent
      const transformedDetails: MovieDetailsType = {
        id: movieDetails.movie_id,
        title: movieDetails.title,
        poster_path: movieDetails.poster,
        runtime: movieDetails.runtime,
        vote_average: movieDetails.vote_average,
        release_date: movieDetails.year,
        director: JSON.parse(movieDetails.director.replace(/'/g, '"')),
        overview: movieDetails.overview,
        tagline: movieDetails.tagline,
        genres: JSON.parse(movieDetails.genres.replace(/'/g, '"')),
        cast: JSON.parse(movieDetails.cast.replace(/'/g, '"')),
      };
      setSelectedMovie(transformedDetails);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/recommend?search=${searchQuery}`);
      const filteredMovies = response.data.map(transformMovie);
      setMovies(filteredMovies);
    } catch (error) {
      console.error('Error searching movies:', error);
    } finally {
      setLoading(false);
    }
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
                  onClick={() => handleMovieClick(movie.id)}
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