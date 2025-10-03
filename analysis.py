import pandas as pd
import sqlite3
import matplotlib.pyplot as plt
import seaborn as sns
from textblob import TextBlob

# Set a style for the plots
sns.set_style('whitegrid')

# --- Part 1: Load Data from the Database ---
print("Connecting to books.db...")
try:
    # Connect to the SQLite database
    conn = sqlite3.connect("books.db")

    # Load the entire 'Books' table into a Pandas DataFrame
    books_df = pd.read_sql_query("SELECT * FROM Books", conn)

    # Close the database connection
    conn.close()

    print(f"Data loaded from database. Total books: {len(books_df)}")

except sqlite3.OperationalError as e:
    print(f"Error: {e}. Make sure you have run data_processing.py first to create the books.db file.")
    exit()

# --- Part 2: Create Charts for Bestseller Trends ---
print("\nGenerating bestseller analysis charts...")

# --- Chart 1: Top 10 Bestselling Genres ---
# Count the occurrences of each genre
top_genres = books_df['genre'].value_counts().head(10)

# Create a bar chart using Seaborn
plt.figure(figsize=(12, 7))
sns.barplot(x=top_genres.values, y=top_genres.index, palette='viridis')
plt.title('Top 10 Bestselling Book Genres', fontsize=18, fontweight='bold')
plt.xlabel('Number of Books', fontsize=14)
plt.ylabel('Genre', fontsize=14)
plt.show()

# --- Chart 2: Top 10 Bestselling Authors ---
# Count the occurrences of each author
top_authors = books_df['author'].value_counts().head(10)

# Create a bar chart
plt.figure(figsize=(12, 7))
sns.barplot(x=top_authors.values, y=top_authors.index, palette='magma')
plt.title('Top 10 Bestselling Authors', fontsize=18, fontweight='bold')
plt.xlabel('Number of Bestsellers', fontsize=14)
plt.ylabel('Author', fontsize=14)
plt.show()

# --- Chart 3: Distribution of Ratings ---
# Create a histogram for ratings
plt.figure(figsize=(12, 7))
sns.histplot(books_df['rating'], bins=20, kde=True, color='skyblue')
plt.title('Distribution of Bestseller Ratings', fontsize=18, fontweight='bold')
plt.xlabel('Rating', fontsize=14)
plt.ylabel('Number of Books', fontsize=14)
plt.show()

# --- Part 3: Perform Sentiment Analysis on Descriptions (Optional) ---
print("\nPerforming sentiment analysis on book descriptions...")

# A function to get sentiment polarity
def get_sentiment(text):
    if isinstance(text, str):
        return TextBlob(text).sentiment.polarity
    return 0

# Apply the function to the 'description' column
books_df['description_sentiment'] = books_df['description'].apply(get_sentiment)

# Visualize the sentiment distribution
plt.figure(figsize=(12, 7))
sns.histplot(books_df['description_sentiment'], bins=20, kde=True, color='lightgreen')
plt.title('Sentiment Polarity of Book Descriptions', fontsize=18, fontweight='bold')
plt.xlabel('Sentiment Polarity (-1.0 to 1.0)', fontsize=14)
plt.ylabel('Number of Books', fontsize=14)
plt.show()

print("\nAnalysis complete. All charts have been generated.")