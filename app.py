import streamlit as st
import pandas as pd
import sqlite3
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# --- 1. Data Loading and Preparation (Cached for Performance) ---

@st.cache_data
def load_data():
    """Connects to the database and loads the Books table."""
    try:
        conn = sqlite3.connect("books.db")
        books_df = pd.read_sql_query("SELECT * FROM Books", conn)
        conn.close()

        # Handle NaNs and ensure columns are present
        books_df['description'] = books_df['description'].fillna('')
        books_df['genre'] = books_df['genre'].fillna('Unknown')
        books_df['author'] = books_df['author'].fillna('Unknown')

        # Ensure all columns are lowercased for consistency
        books_df.columns = books_df.columns.str.lower()

        # Drop duplicates again, just in case (e.g., if new data was added)
        books_df = books_df.drop_duplicates(subset=['title', 'author'])

        # Reset index after cleaning, crucial for similarity mapping
        books_df = books_df.reset_index(drop=True)

        return books_df
    except sqlite3.OperationalError:
        st.error("Could not find 'books.db'. Please run data_processing.py first to create the database.")
        return pd.DataFrame()


# --- 2. Phase 5 Core: Content-Based Recommendation System ---

@st.cache_data
def setup_recommendation_system(books_df):
    """
    PHASE 5: Sets up the TF-IDF vectorizer and calculates the cosine similarity matrix.
    Content-Based Filtering is based on a combined feature set (genre + description + author).
    """
    if books_df.empty:
        return None, None

    # Create a combined feature string for vectorization
    books_df['combined_features'] = books_df.apply(
        lambda row: f"{row['genre'].replace(' ', '')} {row['description']} {row['author'].replace(' ', '')}", axis=1
    )

    # Initialize TF-IDF Vectorizer
    tfidf = TfidfVectorizer(stop_words='english', max_df=0.8)

    # Construct the TF-IDF matrix
    tfidf_matrix = tfidf.fit_transform(books_df['combined_features'])

    # Compute the cosine similarity matrix
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    # Construct a reverse map of indices and book titles
    indices = pd.Series(books_df.index, index=books_df['title']).drop_duplicates()

    return cosine_sim, indices


def get_recommendations(title, books_df, cosine_sim, indices, num_recs=10):
    """Generates book recommendations based on cosine similarity."""
    if title not in indices:
        return pd.DataFrame()

    # Get the index of the book that matches the title
    idx = indices[title]

    # Get the pairwise similarity scores of all books with that book
    sim_scores = list(enumerate(cosine_sim[idx]))

    # Sort the books based on the similarity scores
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    # Get the scores of the top N most similar books (excluding the input book itself)
    sim_scores = sim_scores[1:num_recs + 1]

    # Get the book indices
    book_indices = [i[0] for i in sim_scores]

    # Return the top N most similar books with relevant metadata
    recommendations_df = books_df.iloc[book_indices][['title', 'author', 'genre', 'rating', 'price']]

    # Add the similarity score for context
    similarity_scores = [score[1] for score in sim_scores]
    recommendations_df['similarity_score'] = similarity_scores

    return recommendations_df


# --- 3. Phase 4 Analysis Visualization Functions ---

def display_analysis(books_df):
    """Generates and displays all analysis charts (Completes Phase 4 deliverables)."""
    st.header("Bestseller Trend Analysis")

    sns.set_style("whitegrid")

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Top 10 Bestselling Genres")
        top_genres = books_df['genre'].value_counts().head(10)
        fig1, ax1 = plt.subplots(figsize=(10, 6))
        sns.barplot(x=top_genres.values, y=top_genres.index, palette='Spectral', ax=ax1)
        ax1.set_xlabel('Number of Books')
        ax1.set_ylabel('Genre')
        plt.tight_layout()
        st.pyplot(fig1)

    with col2:
        st.subheader("Top 10 Bestselling Authors")
        top_authors = books_df['author'].value_counts().head(10)
        fig2, ax2 = plt.subplots(figsize=(10, 6))
        sns.barplot(x=top_authors.values, y=top_authors.index, palette='viridis', ax=ax2)
        ax2.set_xlabel('Number of Bestsellers')
        ax2.set_ylabel('Author')
        plt.tight_layout()
        st.pyplot(fig2)

    st.subheader("Distribution of Book Ratings")
    fig3, ax3 = plt.subplots(figsize=(12, 5))
    sns.histplot(books_df['rating'], bins=20, kde=True, color='#0077b6', ax=ax3)
    ax3.set_xlabel('Rating (0.0 to 5.0)')
    ax3.set_ylabel('Number of Books')
    st.pyplot(fig3)


# --- 4. Streamlit Main App Layout (Phase 6) ---

def main():
    """Main function for the Streamlit application."""
    st.set_page_config(
        page_title="ReadWise: Book Recommender & Bestseller Dashboard",
        layout="wide",
        initial_sidebar_state="expanded"
    )

    # --- Custom Theme ---
    st.markdown(
        """
        <style>
        [data-testid="stAppViewContainer"] > .main {
            background-color: #F0F2F6;
        }
        [data-testid="stHeader"] {
            background-color: #EAB595;
        }
        [data-testid="stSidebar"] {
            background-color: #AE6378;
        }
        h1, h2, h3, h4, h5, h6 {
            color: #79616F;
        }
        .stButton > button {
            background-color: #7E9680;
            color: white;
            border-radius: 12px;
        }
        .stButton > button:hover {
            background-color: #D87F81;
            color: white;
        }
        .stDataFrame, .stTable {
            border: 1px solid #7E9680;
            border-radius: 12px;
        }
        </style>
        """,
        unsafe_allow_html=True
    )

    st.title("ReadWise: Bestseller Analysis & Smart Book Recommender")
    st.markdown("---")

    books_df = load_data()

    if books_df.empty:
        return

    # Set up the recommendation system
    cosine_sim, indices = setup_recommendation_system(books_df)

    if cosine_sim is None:
        st.warning("Could not set up recommendation system.")
        return

    # Create tabs
    tab_recommender, tab_analysis = st.tabs(["Get Recommendations", "Bestseller Analysis"])

    # --- Recommendation Tab ---
    with tab_recommender:
        st.header("Find Your Next Read")

        unique_titles = sorted([str(t) for t in books_df['title'].unique().tolist() if t is not None])

        selected_title = st.selectbox(
            "Select a book you liked to get recommendations:",
            options=[''] + unique_titles,
            index=0
        )

        if selected_title:
            st.success(f"Generating recommendations similar to: **{selected_title}**")

            recommendations_df = get_recommendations(selected_title, books_df, cosine_sim, indices, num_recs=10)

            if not recommendations_df.empty:
                st.subheader("Top 10 Recommended Books:")
                st.dataframe(
                    recommendations_df,
                    column_config={
                        "title": "Title",
                        "author": "Author",
                        "genre": "Genre",
                        "rating": st.column_config.ProgressColumn("Rating (out of 5)", format="%.2f", min_value=0.0, max_value=5.0),
                        "price": st.column_config.NumberColumn("Price ($)", format="$%.2f"),
                        "similarity_score": st.column_config.NumberColumn("Similarity Score", format="%.4f")
                    },
                    hide_index=True
                )
                st.markdown("Recommendations are based on the book's genre, author, and description similarity.")
            else:
                st.warning("Could not find suitable recommendations for this book.")
        else:
            st.info("Select a book from the list above to get personalized suggestions.")

    # --- Analysis Tab ---
    with tab_analysis:
        display_analysis(books_df)


if __name__ == "__main__":
    main()
