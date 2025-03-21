export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genres: string[];
  movie_id?: number;
}

export interface MovieDetails extends Movie {
  runtime: number;
  tagline: string;
  cast: string[];
  director: string;
}