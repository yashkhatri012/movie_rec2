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
  const transformMovie = (data: any): Movie => {
    console.log('Raw movie data in transformMovie:', data);
    
    // Handle case where movie_id might be undefined
    const movieId = data.movie_id || data.id || Math.floor(Math.random() * 10000);
    
    // Handle case where genres might be a string that needs parsing
    let genres: string[] = [];
    try {
      if (typeof data.genres === 'string') {
        // Replace single quotes with double quotes for valid JSON
        genres = JSON.parse(data.genres.replace(/'/g, '"'));
      } else if (Array.isArray(data.genres)) {
        genres = data.genres;
      }
    } catch (e) {
      console.warn('Error parsing genres for movie:', data.title, e);
      genres = [];
    }
    
    return {
      id: movieId,
      title: data.title || 'Unknown Movie',
      overview: data.overview || 'No overview available',
      poster_path: data.poster || 'https://via.placeholder.com/300x450?text=No+Poster',
      vote_average: parseFloat(data.vote_average) || 0,
      release_date: data.year || data.release_date || '2000',
      genres: genres,
    };
  };

  // ✅ Fetch movies from API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        console.log('Fetching movies from /popular endpoint...');
        const response = await axios.get('http://localhost:5000/popular');
        console.log('Raw response from /popular:', response);
        
        // Check if response.data is an array or has an 'error' field
        if (response.data && response.data.error) {
          console.error('API returned an error:', response.data.error);
          setMovies([]);
          return;
        }
        
        // Ensure we have an array to map over
        const moviesData = Array.isArray(response.data) ? response.data : [];
        
        console.log('Movie data array length:', moviesData.length);
        if (moviesData.length === 0) {
          console.warn('No movies returned from API');
          return;
        }
        
        console.log('First movie in response:', moviesData[0]);
        
        try {
          const transformedMovies = moviesData.map(movie => {
            console.log('Processing movie:', movie.title);
            return transformMovie(movie);
          });
          console.log('Transformed movies:', transformedMovies);
          setMovies(transformedMovies);
        } catch (parseError) {
          console.error('Error transforming movie data:', parseError);
          // Try to handle the response in a different way if transformation fails
          setMovies([]);
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
        // Add fallback if there's an error
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // ✅ Fetch movie details
  const handleMovieClick = async (movieId: number) => {
    if (!movieId) {
      console.error('Invalid movie ID');
      return;
    }
    
    try {
      setLoading(true);
      console.log(`Fetching details for movie ID: ${movieId}`);
      
      const response = await axios.get(`http://localhost:5000/movie/${movieId}`);
      console.log('Movie details response:', response.data);
      
      // Check if response has an error
      if (!response.data || response.data.error) {
        console.error('API returned an error:', response.data?.error || 'Empty response');
        return;
      }
      
      const movieDetails = response.data;

      // Parse arrays and keep the format consistent
      const transformedDetails: MovieDetailsType = {
        id: movieDetails.movie_id || movieId,
        title: movieDetails.title || 'Unknown Movie',
        poster_path: movieDetails.poster || 'https://via.placeholder.com/300x450?text=No+Poster',
        runtime: movieDetails.runtime || 0,
        vote_average: movieDetails.vote_average || 0,
        release_date: movieDetails.year || '2000',
        director: typeof movieDetails.director === 'string' ? 
          JSON.parse(movieDetails.director.replace(/'/g, '"')) : 
          (movieDetails.director || 'Unknown'),
        overview: movieDetails.overview || 'No overview available',
        tagline: movieDetails.tagline || '',
        genres: typeof movieDetails.genres === 'string' ? 
          JSON.parse(movieDetails.genres.replace(/'/g, '"')) : 
          (movieDetails.genres || []),
        cast: typeof movieDetails.cast === 'string' ? 
          JSON.parse(movieDetails.cast.replace(/'/g, '"')) : 
          (movieDetails.cast || []),
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
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      console.log('Searching for:', searchQuery);
      
      const response = await axios.post('http://localhost:5000/recommend', {
        movie: searchQuery
      });
      
      console.log('Response from /recommend:', response.data);
      
      // Check if response has an error
      if (response.data.error) {
        console.error('API returned an error:', response.data.error);
        setMovies([]);
        return;
      }
      
      // Ensure we have an array to map over
      const moviesData = Array.isArray(response.data) ? response.data : [];
      
      if (moviesData.length === 0) {
        console.warn('No recommendations found for this movie');
        alert('No recommendations found. Try a different movie name.');
      }
      
      const filteredMovies = moviesData.map(transformMovie);
      setMovies(filteredMovies);
    } catch (error) {
      console.error('Error searching movies:', error);
      alert('Error searching for movies. Please try again.');
      setMovies([]);
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