from flask import Flask, request, jsonify
import pickle
import pandas as pd

from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Load your data and similarity matrix
movies_df = pd.DataFrame(pickle.load(open('movies.pkl', 'rb')))
similarity = pickle.load(open('similarity.pkl', 'rb'))
df3= pd.read_csv('df3.csv')
# Helper function to fetch movie recommendations
def recommend(movie_name):
    if movie_name not in movies_df['title'].values:
        return []

    movie_index = movies_df[movies_df['title'] == movie_name].index[0]
    distances = list(enumerate(similarity[movie_index]))
    recommendations = sorted(distances, key=lambda x: x[1], reverse=True)[1:11]

    result = []
    for i in recommendations:
        movie = movies_df.iloc[i[0]]
        result.append({
            "title": movie["title"],
            "movie_id": int(movie["movie_id"])
        })
    return result

def get_movie_details(movie_id):
    movie = df3[df3['movie_id'] == movie_id].iloc[0]
    return {
        "title": movie["title"],
        "overview": movie["overview"],
        "genres": movie["genres"],
        "cast": movie["cast"],
        "director": movie["crew"]
    }

import requests

TMDB_API_KEY = '8265bd1679663a7ea12ac168da84d2e8&language=en-US'

def fetch_poster(movie_id):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_API_KEY}"
    response = requests.get(url)
    if response.status_code != 200:
        return "Poster not found"
    
    data = response.json()
    poster_path = data.get('poster_path')
    if not poster_path:
        return "Poster not available"

   

print(fetch_poster(193))


@app.route('/movie/<int:movie_id>', methods=['GET'])
def movie_details(movie_id):
    return jsonify(get_movie_details(movie_id))


# Flask route to get recommendations
@app.route('/recommend', methods=['POST'])
def get_recommendations():
    data = request.json
    movie_name = data.get('movie')
    recommendations = recommend(movie_name)
    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(debug=True)
