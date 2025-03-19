from flask import Flask, request, jsonify
import pickle
import pandas as pd
from flask_cors import CORS
import traceback
import json
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Global variables to track data loading status
data_loaded = False
loading_errors = []

def load_data():
    global movies_df, df3, similarity, data_loaded, loading_errors
    loading_errors = []
    
    try:
        # Check if files exist first
        required_files = ['movies.pkl', 'similarity.pkl', 'df3.csv']
        for file in required_files:
            if not os.path.exists(file):
                loading_errors.append(f"Missing file: {file}")
        
        if loading_errors:
            print("❌ Missing required files:")
            for error in loading_errors:
                print(f"  - {error}")
            return False
        
        print("Loading movies data...")
        movies_df = pd.DataFrame(pickle.load(open('movies.pkl', 'rb')))
        print("Loading similarity matrix...")
        similarity = pickle.load(open('similarity.pkl', 'rb'))
        print("Loading df3 data...")
        df3 = pd.read_csv('df3.csv')
        
        # Print sample data to understand the structure
        print("\nSample movie data:")
        sample_movie = df3.iloc[0]
        print(f"Genres format: {type(sample_movie['genres'])} - {sample_movie['genres']}")
        print(f"Cast format: {type(sample_movie['cast'])} - {sample_movie['cast']}")
        print(f"Crew format: {type(sample_movie['crew'])} - {sample_movie['crew']}")
        
        print("✅ All data loaded successfully!")
        data_loaded = True
        return True
        
    except Exception as e:
        error_msg = f"Error loading data: {str(e)}"
        loading_errors.append(error_msg)
        print(f"❌ {error_msg}")
        print(traceback.format_exc())
        return False

# Initialize data loading
if not load_data():
    print("\nInitializing empty DataFrames due to loading errors...")
    movies_df = pd.DataFrame()
    df3 = pd.DataFrame()
    similarity = []

def parse_string_list(value):
    """Helper function to parse string lists from DataFrame"""
    if pd.isna(value):
        return []
    try:
        # First try direct eval (for lists)
        if isinstance(value, str):
            # Replace single quotes with double quotes for JSON compatibility
            value = value.replace("'", '"')
            # Try to parse as JSON
            return json.loads(value)
        elif isinstance(value, list):
            return value
        return []
    except:
        try:
            # Try eval as a fallback
            return eval(str(value))
        except:
            # If all else fails, return empty list
            return []

# Helper function to fetch movie recommendations
def recommend(movie_name):
    print(f"🔍 Searching for movie: {movie_name}")
    
    # Check if data is loaded
    if movies_df.empty or df3.empty or not similarity:
        error_msg = "Movie data not loaded. Please check if all required data files exist."
        print(f"❌ {error_msg}")
        return jsonify({"error": error_msg}), 500
    
    if movie_name not in movies_df['title'].values:
        error_msg = f"Movie '{movie_name}' not found in database"
        print(f"❌ {error_msg}")
        return jsonify({"error": error_msg}), 404

    try:
        # Find the movie index
        movie_index = movies_df[movies_df['title'] == movie_name].index[0]
        
        # Get similarity scores
        distances = list(enumerate(similarity[movie_index]))
        recommendations = sorted(distances, key=lambda x: x[1], reverse=True)[1:11]

        result = []

        for i, (idx, score) in enumerate(recommendations):
            try:
                movie = movies_df.iloc[idx]
                movie_id = int(movie["movie_id"])
                print(f"\nProcessing recommendation {i+1}: {movie['title']} (ID: {movie_id})")
                
                # Get movie details directly from df3
                movie_data = df3[df3['movie_id'] == movie_id]
                if not movie_data.empty:
                    movie_details = movie_data.iloc[0]
                    
                    # Handle potential NaN values
                    runtime = float(movie_details["runtime"]) if pd.notnull(movie_details["runtime"]) else 0
                    vote_average = float(movie_details["vote_average"]) if pd.notnull(movie_details["vote_average"]) else 0
                    
                    release_date = movie_details["release_date"]
                    year = release_date.split("-")[0] if pd.notnull(release_date) and isinstance(release_date, str) else ""
                    
                    # Parse lists using the helper function
                    genres = parse_string_list(movie_details["genres"])
                    cast = parse_string_list(movie_details["cast"])
                    crew = parse_string_list(movie_details["crew"])
                    
                    # Get director from crew
                    director = crew[0] if crew else "Unknown Director"
                    
                    print(f"Parsed data for {movie_details['title']}:")
                    print(f"Genres: {genres}")
                    print(f"Cast: {cast}")
                    print(f"Director: {director}")
                    
                    details = {
                        "movie_id": int(movie_id),
                        "title": str(movie_details["title"]),
                        "overview": str(movie_details["overview"]) if pd.notnull(movie_details["overview"]) else "",
                        "genres": genres,
                        "cast": cast,
                        "director": director,
                        "runtime": runtime,
                        "vote_average": vote_average,
                        "tagline": str(movie_details["tagline"]) if pd.notnull(movie_details["tagline"]) else "",
                        "year": year,
                        "poster": fetch_poster(movie_id)
                    }
                    print(f"✅ Movie details: {json.dumps(details, indent=2)}")
                    result.append(details)
                else:
                    print(f"❌ No details found in df3 for Movie ID: {movie_id}")
            except Exception as e:
                print(f"❌ Error processing recommendation: {str(e)}")
                print(traceback.format_exc())
                continue

        if not result:
            error_msg = "No valid recommendations found"
            print(f"❌ {error_msg}")
            return jsonify({"error": error_msg}), 404

        print(f"✅ Returning {len(result)} recommendations")
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Error in recommend function: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

def get_movie_details(movie_id):
    try:
        # Convert movie_id to integer
        movie_id = int(movie_id)
        # Find the movie in df3
        movie_data = df3[df3['movie_id'] == movie_id]
        if movie_data.empty:
            print(f"❌ Movie not found with ID: {movie_id}")
            return None
            
        movie = movie_data.iloc[0]
        return {
            "movie_id": movie_id,
            "title": movie["title"],
            "overview": movie["overview"],
            "genres": movie["genres"],
            "cast": movie["cast"],
            "director": movie["crew"],
            "runtime": movie["runtime"],
            "vote_average": movie["vote_average"],
            "tagline": movie["tagline"],
            "year": movie["release_date"].split("-")[0],
            "poster": fetch_poster(movie_id)
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
@app.route('/movie/<movie_id>', methods=['GET'])
def movie_details(movie_id):
    try:
        # Convert movie_id to integer, handling both string and float inputs
        movie_id_int = int(float(movie_id))
        details = get_movie_details(movie_id_int)
        if details:
            return jsonify(details)
        else:
            return jsonify({"error": "Movie not found"}), 404
    except ValueError:
        return jsonify({"error": "Invalid movie ID"}), 400
    except Exception as e:
        print(f"❌ Error in movie_details endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/status', methods=['GET'])
def get_status():
    """Endpoint to check data loading status"""
    return jsonify({
        "status": "ready" if data_loaded else "error",
        "errors": loading_errors if loading_errors else None
    })

@app.route('/recommend', methods=['POST'])
def get_recommendations():
    try:
        print("📥 Received recommendation request")
        
        # Check if data is loaded
        if not data_loaded:
            error_msg = "Movie data not loaded. Please check server logs for details."
            if loading_errors:
                error_msg += f" Errors: {', '.join(loading_errors)}"
            print(f"❌ {error_msg}")
            return jsonify({"error": error_msg}), 500
        
        data = request.json
        print(f"Request data: {data}")
        
        if not data or 'movie' not in data:
            print("❌ No movie name provided in request")
            return jsonify({"error": "No movie name provided"}), 400
            
        movie_name = data.get('movie')
        print(f"🎬 Processing request for movie: {movie_name}")
        
        recommendations = recommend(movie_name)
        return recommendations
        
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
        "poster": fetch_poster(movie["movie_id"])
    })

if __name__ == '__main__':
    app.run(debug=True)
