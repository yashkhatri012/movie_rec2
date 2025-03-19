from flask import Flask, request, jsonify
import pickle
import pandas as pd
from flask_cors import CORS
import traceback

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Load your data and similarity matrix
try:
    print("Loading movies data...")
    movies_df = pd.DataFrame(pickle.load(open('backend/movies.pkl', 'rb')))
    print("Loading similarity matrix...")
    similarity = pickle.load(open('backend/similarity.pkl', 'rb'))
    print("Loading df3 data...")
    df3 = pd.read_csv('backend/df3.csv')
    print("✅ All data loaded successfully!")
except Exception as e:
    print(f"❌ Error loading data: {str(e)}")
    print(traceback.format_exc())

# Helper function to fetch movie recommendations
def recommend(movie_name):
    try:
        print(f"🔍 Searching for movie: {movie_name}")
        
        # Debug print statements
        print(f"movies_df shape: {movies_df.shape}")
        print(f"similarity matrix shape: {similarity.shape}")
        print(f"df3 shape: {df3.shape}")
        
        # Convert movie_name to lowercase for case-insensitive search
        movie_name = movie_name.lower()
        print(f"Lowercase movie name: {movie_name}")
        
        # Check if movies_df exists and has data
        if movies_df is None or len(movies_df) == 0:
            print("❌ movies_df is empty or None")
            return jsonify({"error": "Movie database is not available"}), 500
            
        # Check the structure of movies_df
        print(f"movies_df columns: {list(movies_df.columns)}")
        print(f"First few movie titles: {list(movies_df['title'].head())}")
        
        # Create title_lower column if it doesn't exist
        if 'title_lower' not in movies_df.columns:
            movies_df['title_lower'] = movies_df['title'].str.lower()
        
        # Print a sample of lowercase titles for debugging
        print(f"Sample of lowercase titles: {list(movies_df['title_lower'].head())}")
        
        # Check if the movie exists in our database
        matching_movies = movies_df[movies_df['title_lower'].str.contains(movie_name, na=False)]
        if len(matching_movies) == 0:
            print(f"❌ No movies found containing: {movie_name}")
            return jsonify({"error": f"No movies found containing '{movie_name}' in our database"}), 404
            
        # Get exact match if exists, otherwise take the first partial match
        exact_match = matching_movies[matching_movies['title_lower'] == movie_name]
        if len(exact_match) > 0:
            movie_index = exact_match.index[0]
            print(f"Found exact match at index: {movie_index}")
        else:
            movie_index = matching_movies.index[0]
            print(f"Using closest match at index: {movie_index}")
            print(f"Closest match title: {matching_movies.iloc[0]['title']}")

        # Ensure movie_id types are consistent for lookup
        df3["movie_id"] = df3["movie_id"].astype(int)
        movies_df["movie_id"] = movies_df["movie_id"].astype(int)
        
        # Verify movie_index is valid
        if movie_index >= len(similarity):
            print(f"❌ Movie index {movie_index} is out of bounds for similarity matrix of size {len(similarity)}")
            return jsonify({"error": "Invalid movie index for similarity calculation"}), 500
            
        # Get recommendations
        try:
            distances = list(enumerate(similarity[movie_index]))
            recommendations = sorted(distances, key=lambda x: x[1], reverse=True)[1:11]
            print(f"Found {len(recommendations)} potential recommendations")
        except Exception as e:
            print(f"❌ Error calculating recommendations: {str(e)}")
            print(traceback.format_exc())
            return jsonify({"error": "Error calculating movie recommendations"}), 500

        result = []
        for i in recommendations:
            try:
                movie = movies_df.iloc[i[0]]
                movie_id = int(movie["movie_id"])
                print(f"Processing recommendation: {movie['title']} (ID: {movie_id})")

                # Fetch movie details
                details = get_movie_details(movie_id)

                # Ensure valid data is appended
                if details:
                    print(f"✅ Appending: {details['title']} - {movie_id}")
                    result.append(details)
                else:
                    print(f"❌ Missing Details for Movie ID: {movie_id}")
            except Exception as e:
                print(f"❌ Error processing recommendation {i}: {str(e)}")
                print(traceback.format_exc())
                continue

        if not result:
            return jsonify({"error": "No valid recommendations found"}), 404

        print(f"✅ Successfully returning {len(result)} recommendations")
        return jsonify(result)
    except Exception as e:
        print(f"❌ Error in recommend function: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

def get_movie_details(movie_id):
    try:
        movie = df3[df3['movie_id'] == movie_id].iloc[0]
        return {
            "title": movie["title"],
            "overview": movie["overview"],
            "genres": movie["genres"],
            "cast": movie["cast"],
            "director": movie["crew"],
            "runtime": movie["runtime"],
            "vote_average": movie["vote_average"],
            "tagline": movie["tagline"],
            "year": movie["release_date"].split("-")[0],
            "poster": fetch_poster(movie_id),
            "movie_id": int(movie_id)
        }
    except Exception as e:
        print(f"❌ Error getting movie details for ID {movie_id}: {str(e)}")
        print(traceback.format_exc())
        return None

import requests

TMDB_API_KEY = '8265bd1679663a7ea12ac168da84d2e8'  # Just the API key

def fetch_poster(movie_id):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_API_KEY}&language=en-US"
    response = requests.get(url)
    if response.status_code != 200:
        return "Poster not found"
    
    data = response.json()
    poster_path = data.get('poster_path')
    if not poster_path:
        return "Poster not available"

    return f"https://image.tmdb.org/t/p/w500{poster_path}"

# Flask route to get movie details
@app.route('/movie/<int:movie_id>', methods=['GET'])
def movie_details(movie_id):
    return jsonify(get_movie_details(movie_id))

@app.route('/recommend', methods=['POST'])
def get_recommendations():
    try:
        print("📥 Received recommendation request")
        data = request.json
        print(f"Request data: {data}")
        
        if not data or 'movie' not in data:
            print("❌ No movie name provided in request")
            return jsonify({"error": "No movie name provided"}), 400
            
        movie_name = data.get('movie')
        print(f"🎬 Processing request for movie: {movie_name}")
        
        return recommend(movie_name)
        
    except Exception as e:
        print(f"❌ Error in get_recommendations: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

import random

@app.route('/random', methods=['GET'])
def random_movie():
    random_index = random.randint(0, len(df3) - 1)
    movie = df3.iloc[random_index]
    
    return jsonify({
        "title": movie["title"],
        "overview": movie["overview"],
        "genres": movie["genres"],
        "cast": movie["cast"],
        "director": movie["crew"],
        "runtime": movie["runtime"],
        "vote_average": movie["vote_average"],
        "tagline": movie["tagline"],
        "year": movie["release_date"].split("-")[0],
        "poster": fetch_poster(movie["movie_id"]),
        "movie_id": int(movie["movie_id"])
    })

# Add a debug endpoint to list available movies
@app.route('/movies', methods=['GET'])
def list_movies():
    try:
        # Get the limit parameter, default to 20
        limit = request.args.get('limit', default=20, type=int)
        # Get the search parameter, default to empty string
        search = request.args.get('search', default='', type=str).lower()
        
        if movies_df is None or len(movies_df) == 0:
            return jsonify({"error": "Movie database is not available"}), 500
            
        # Add lowercase title if not already there
        if 'title_lower' not in movies_df.columns:
            movies_df['title_lower'] = movies_df['title'].str.lower()
        
        # Filter movies if search parameter is provided
        if search:
            filtered_movies = movies_df[movies_df['title_lower'].str.contains(search)]
        else:
            filtered_movies = movies_df
            
        # Get the specified number of movies
        movies_list = filtered_movies.head(limit)[['title', 'movie_id']].to_dict('records')
        
        return jsonify({
            "total_movies": len(movies_df),
            "filtered_count": len(filtered_movies),
            "movies": movies_list
        })
    except Exception as e:
        print(f"❌ Error in list_movies: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
