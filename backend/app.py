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
    movies_df = pd.DataFrame(pickle.load(open('movies.pkl', 'rb')))
    print("Loading similarity matrix...")
    similarity = pickle.load(open('similarity.pkl', 'rb'))
    print("Loading df3 data...")
    df3 = pd.read_csv('df3.csv')
    print("✅ All data loaded successfully!")
except Exception as e:
    print(f"❌ Error loading data: {str(e)}")
    print(traceback.format_exc())

# Helper function to fetch movie recommendations
def recommend(movie_name):
    try:
        print(f"🔍 Searching for movie: {movie_name}")
        if movie_name not in movies_df['title'].values:
            print(f"❌ Movie not found: {movie_name}")
            return []

        # Ensure movie_id types are consistent for lookup
        df3["movie_id"] = df3["movie_id"].astype(int)
        movies_df["movie_id"] = movies_df["movie_id"].astype(int)

        # Find the movie index
        movie_index = movies_df[movies_df['title'] == movie_name].index[0]
        distances = list(enumerate(similarity[movie_index]))
        recommendations = sorted(distances, key=lambda x: x[1], reverse=True)[1:11]

        result = []

        for i in recommendations:
            movie = movies_df.iloc[i[0]]
            movie_id = int(movie["movie_id"])

            # Fetch movie details
            details = get_movie_details(movie_id)

            # Ensure valid data is appended
            if details:
                print(f"✅ Appending: {details['title']} - {movie_id}")
                result.append(details)
            else:
                print(f"❌ Missing Details for Movie ID: {movie_id}")

        return jsonify(result)
    except Exception as e:
        print(f"❌ Error in recommend function: {str(e)}")
        print(traceback.format_exc())
        raise

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
        
        recommendations = recommend(movie_name)
        
        if not recommendations:
            print("❌ No recommendations found")
            return jsonify({"error": "No recommendations found"}), 404

        print(f"📤 Returning {len(recommendations.get_json())} recommendations.")
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
