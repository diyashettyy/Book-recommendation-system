import pandas as pd
import os
import sqlite3

# Define the data folder - ASSUMES CSV FILES ARE HERE
# NOTE: You will need to create a folder named 'data' and place your raw CSV files inside it.
data_folder = "data/" 

# Step 1: Create a dictionary to map inconsistent column names to standard names
column_mapping = {
    'Name': 'title',
    'Book Nam': 'title',
    'Author': 'author',
    'Author Na': 'author',
    'User Ratin': 'rating',
    'Rating': 'rating',
    'Reviews': 'reviews',
    'Number of Price': 'price',
    'Price': 'price',
    'Genre': 'genre',
    'Type': 'genre',  # Assuming 'Type' is another name for 'Genre'
    'description': 'description',
    'Description': 'description'
}

# Step 2: Read, Rename, and Combine All CSVs
print("Reading and combining CSV files...")
# Check if the data folder exists and contains files, otherwise, this will likely fail
if not os.path.exists(data_folder):
    print(f"Error: Data folder '{data_folder}' not found. Please create it and add your CSV files.")
    # Exit silently if the file is not runnable
    # exit() 
    pass # Continue to allow the existing books.db to be used by the API if it's there

csv_files = [f for f in os.listdir(data_folder) if f.endswith('.csv')]
books_list = []

for file in csv_files:
    try:
        df = pd.read_csv(os.path.join(data_folder, file))
        
        # Rename columns using the mapping dictionary
        df = df.rename(columns={col: column_mapping.get(col, col) for col in df.columns})
        
        books_list.append(df)
    except pd.errors.EmptyDataError:
        print(f"Warning: Skipping empty file {file}")
    except FileNotFoundError:
        print(f"Error: File {file} not found.")

if books_list:
    # Concatenate into a single DataFrame
    books_df = pd.concat(books_list, ignore_index=True)
    print(f"Total books loaded: {len(books_df)}")

    # Step 3: Clean the Combined Dataset
    print("\nCleaning the combined dataset...")

    # Now that columns are standardized, drop_duplicates will work
    books_df = books_df.drop_duplicates(subset=['title', 'author'])

    # Standardize column names (already done above, but good practice to ensure)
    books_df.columns = books_df.columns.str.strip().str.lower()

    # Fill missing values
    books_df['genre'] = books_df['genre'].fillna('Unknown')
    books_df['rating'] = pd.to_numeric(books_df['rating'], errors='coerce').fillna(0)
    books_df['reviews'] = pd.to_numeric(books_df['reviews'], errors='coerce').fillna(0)
    books_df['price'] = pd.to_numeric(books_df['price'], errors='coerce').fillna(0)
    # Use .get() defensively for columns that might exist only in some files
    books_df['description'] = books_df.get('description', pd.Series('No description available', index=books_df.index)).fillna('No description available')

    # Standardize genres
    genre_mapping = {
        'Sci-Fi': 'Science Fiction',
        'YA': 'Young Adult',
        'Non Fiction': 'Non-Fiction',
        'Self Help': 'Self-Help'
    }
    books_df['genre'] = books_df['genre'].replace(genre_mapping)

    print(f"Unique genres after standardization: {books_df['genre'].unique()}")
    print(f"Total unique books after cleaning: {len(books_df)}")

    # Step 4: Insert into SQLite Database
    print("\nInserting data into SQLite database...")
    conn = sqlite3.connect("books.db")
    cursor = conn.cursor()

    # Create Books table (if not exists)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS Books(
        book_id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT,
        genre TEXT,
        price REAL,
        rating REAL,
        reviews INTEGER,
        description TEXT
    )
    ''')
    
    # Clear existing data before inserting new clean data
    cursor.execute("DELETE FROM Books") 
    
    # Insert all books into DB
    for index, row in books_df.iterrows():
        cursor.execute('''
            INSERT INTO Books (title, author, genre, price, rating, reviews, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (row.get('title'), row.get('author'), row.get('genre'), row.get('price'), row.get('rating'), row.get('reviews'), row.get('description')))

    conn.commit()
    conn.close()

    print("All CSVs processed and data inserted into books.db!")
else:
    print("\nSkipping database creation as no data files were processed. Using existing 'books.db' if available.")
