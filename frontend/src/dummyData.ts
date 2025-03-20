import type { Movie, MovieDetails } from './types';

export const dummyMovies: Movie[] = [
  {
    id: 1,
    title: "Inception",
    overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    poster_path: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80",
    release_date: "2010-07-16",
    vote_average: 8.8,
    genres: ["Action", "Sci-Fi", "Thriller"]
  },
  {
    id: 2,
    title: "The Dark Knight",
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    poster_path: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&q=80",
    release_date: "2008-07-18",
    vote_average: 9.0,
    genres: ["Action", "Crime", "Drama"]
  },
  {
    id: 3,
    title: "Interstellar",
    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    poster_path: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80",
    release_date: "2014-11-07",
    vote_average: 8.6,
    genres: ["Adventure", "Drama", "Sci-Fi"]
  },
  {
    id: 4,
    title: "Blade Runner 2049",
    overview: "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing for thirty years.",
    poster_path: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80",
    release_date: "2017-10-06",
    vote_average: 8.0,
    genres: ["Action", "Drama", "Sci-Fi"]
  },
  {
    id: 5,
    title: "Dune",
    overview: "Feature adaptation of Frank Herbert's science fiction novel about the son of a noble family entrusted with the protection of the most valuable asset and most vital element in the galaxy.",
    poster_path: "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&q=80",
    release_date: "2021-10-22",
    vote_average: 8.2,
    genres: ["Action", "Adventure", "Sci-Fi"]
  },
  {
    id: 6,
    title: "The Matrix",
    overview: "A computer programmer discovers that reality as he knows it is a simulation created by machines, and joins a rebellion to break free.",
    poster_path: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80",
    release_date: "1999-03-31",
    vote_average: 8.7,
    genres: ["Action", "Sci-Fi"]
  },
  {
    id: 7,
    title: "Avatar",
    overview: "A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.",
    poster_path: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80",
    release_date: "2009-12-18",
    vote_average: 7.8,
    genres: ["Action", "Adventure", "Fantasy"]
  },
  {
    id: 8,
    title: "Arrival",
    overview: "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.",
    poster_path: "https://images.unsplash.com/photo-1465101162946-4377e57745c3?auto=format&fit=crop&q=80",
    release_date: "2016-11-11",
    vote_average: 7.9,
    genres: ["Drama", "Sci-Fi"]
  }
];

export const dummyMovieDetails: MovieDetails[] = dummyMovies.map(movie => ({
  ...movie,
  runtime: Math.floor(Math.random() * 60) + 120, // Random runtime between 120 and 180 minutes
  tagline: "Every dream has a beginning",
  cast: [
    "Leonardo DiCaprio",
    "Joseph Gordon-Levitt",
    "Ellen Page",
    "Tom Hardy",
    "Ken Watanabe"
  ],
  director: "Christopher Nolan"
}));