export interface Movie {
  id: number;
  movie_id?: number;  // The actual TMDB movie ID
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  genres: string[];
  cast: string[];
  director: string;
  runtime: number;
  tagline: string;
}

// MovieDetails extends Movie with any additional fields needed for the details view
export interface MovieDetails extends Movie {
  // Add any additional fields specific to the details view
}