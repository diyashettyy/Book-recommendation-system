from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import uvicorn
import pandas as pd
import sqlite3
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware 

# --- 1. Data Structures for API Responses ---

class Book(BaseModel):
    """Schema for a single book entry."""
    title: str
    author: str
    genre: str
    price: float
    rating: float
    reviews: int
    similarity_score: Optional[float] = None
    relevance_score: Optional[float] = None


class RecommendationResponse(BaseModel):
    """Schema for the recommendation list."""
    book_title: Optional[str] = None
    query_details: Optional[str] = None
    recommendations: List[Book]


# --- 2. Global Variables for Data and Model ---

books_df = pd.DataFrame()
cosine_sim = np.array([])
indices = pd.Series(dtype='object')


# --- 3. Core Logic Functions (Retained in Backend) ---

def load_data():
    """Connects to the database and loads the Books table."""
    try:
        conn = sqlite3.connect("books.db")
        df = pd.read_sql_query("SELECT * FROM Books", conn)
        conn.close()

        # Clean and standardize columns
        df.columns = df.columns.str.lower()
        df['description'] = df['description'].fillna('')
        df['genre'] = df['genre'].fillna('Unknown')
        df['author'] = df['author'].fillna('Unknown')
        
        # Ensure numeric types
        df['rating'] = pd.to_numeric(df['rating'], errors='coerce').fillna(0)
        df['reviews'] = pd.to_numeric(df['reviews'], errors='coerce').fillna(0)
        
        # Ensure 'price' column exists and is numeric, defaulting to 0.0 if not found
        if 'price' not in df.columns:
            df['price'] = 0.0
        df['price'] = pd.to_numeric(df['price'], errors='coerce').fillna(0.0)

        df = df.drop_duplicates(subset=['title', 'author'])
        df = df.reset_index(drop=True)
        
        return df
    except sqlite3.OperationalError:
        print("FATAL ERROR: Could not find 'books.db'. Run data_processing.py.")
        return pd.DataFrame()


def setup_recommendation_model(df):
    """Sets up the TF-IDF vectorizer and cosine similarity matrix."""
    if df.empty:
        return np.array([]), pd.Series(dtype='object')

    # Feature engineering for similarity model
    df['combined_features'] = df.apply(
        lambda row: f"{row['genre'].replace(' ', '')} {row['description']} {row['author'].replace(' ', '')}", axis=1
    )

    tfidf = TfidfVectorizer(stop_words='english', max_df=0.8)
    tfidf_matrix = tfidf.fit_transform(df['combined_features'])
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    indices = pd.Series(df.index, index=df['title']).drop_duplicates()
    
    return cosine_sim, indices


def get_recommendations_logic(title: str, num_recs: int = 10) -> List[Book]:
    """Core logic for title-based (Content-Based) recommendations."""
    if title not in indices.index:
        return []

    idx = indices[title]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:num_recs + 1] # Exclude itself, take top N

    book_indices = [i[0] for i in sim_scores]
    recommendations_df = books_df.iloc[book_indices].copy()
    
    # Add the similarity score back to the DataFrame
    recommendations_df['similarity_score'] = [score[1] for score in sim_scores]
    
    # Prepare list of Book models for response
    results = []
    for _, row in recommendations_df.iterrows():
        # Using .get() ensures we don't fail if an unexpected column is missing, 
        # though the DataFrame structure should be consistent.
        results.append(Book(
            title=row['title'],
            author=row['author'],
            genre=row['genre'],
            price=float(row.get('price', 0.0)),
            rating=float(row.get('rating', 0.0)),
            reviews=int(row.get('reviews', 0)),
            similarity_score=float(row.get('similarity_score', 0.0))
        ))
        
    return results

# --- 4. FastAPI Setup and Startup Events ---

app = FastAPI(
    title="Book Recommendation API",
    description="Backend API for Bestseller Analysis and Content-Based Recommendations."
)

# CORS Configuration: Essential for allowing Streamlit (on a different port) to access this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initializes the data and the ML model when the server starts."""
    global books_df, cosine_sim, indices
    
    books_df = load_data()
    if books_df.empty:
        print("API failed to initialize due to missing or empty data.")
        return
        
    cosine_sim, indices = setup_recommendation_model(books_df)
    print("FastAPI Book Recommendation Model Initialized successfully.")


# --- 5. API Endpoints (Serve Frontend) ---

@app.get("/titles", response_model=List[str], summary="Returns all unique book titles")
async def get_all_titles():
    """Returns a sorted list of all unique book titles for the frontend selectbox."""
    if books_df.empty:
        raise HTTPException(status_code=500, detail="Data not loaded.")
    return sorted(books_df['title'].unique().tolist())


@app.get("/recommendations/title/{book_title}", response_model=RecommendationResponse, summary="Get recommendations based on a specific Book Title (Content-Based)")
async def get_book_recommendations_by_title(book_title: str):
    """
    Finds books similar to the given title using TF-IDF and Cosine Similarity.
    """
    if books_df.empty or cosine_sim.size == 0:
        raise HTTPException(status_code=500, detail="Recommendation model not loaded.")
    
    # Find the title with correct casing from the DataFrame
    # This step is crucial for matching the API request to the model's index
    match = books_df[books_df['title'].str.lower().str.strip() == book_title.lower().strip()]
    
    if match.empty:
        raise HTTPException(status_code=404, detail=f"Book '{book_title}' not found in the database.")
    
    search_title = match['title'].iloc[0]

    recommendations = get_recommendations_logic(search_title, num_recs=10)

    if not recommendations:
        # Note: This is rare but possible if a book has a 1.0 similarity to itself and nothing else.
        raise HTTPException(status_code=404, detail=f"No similar books found for '{book_title}'.")

    return RecommendationResponse(
        book_title=search_title,
        recommendations=recommendations
    )


@app.get("/analysis/data", summary="Returns data for Bestseller Analysis (Top Genres and Authors)")
async def get_analysis_data(num_top: int = 10):
    """
    Provides the raw data necessary for the frontend to render analysis charts (e.g., counts and distributions).
    """
    if books_df.empty:
        raise HTTPException(status_code=500, detail="Data not loaded.")
    
    return {
        # Convert to dictionary for JSON serialization
        "top_genres": books_df['genre'].value_counts().head(num_top).to_dict(),
        "top_authors": books_df['author'].value_counts().head(num_top).to_dict(),
        # Send raw list of ratings for the frontend histogram
        "rating_distribution": books_df['rating'].tolist() 
    }


# --- 6. Execution Block ---

if __name__ == "__main__":
    # The API will run on port 8000 by default
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
