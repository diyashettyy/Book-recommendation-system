# 📚 ReadWise: Bestseller Analysis & Smart Book Recommender  

A complete **data analysis + recommendation system** for Amazon Bestselling Books.  
This project provides **insights into bestseller trends** and also recommends books based on your selected reads using **content-based filtering (TF-IDF + Cosine Similarity)**.  

---

## ✦ Features
- 📊 **Bestseller Analysis Dashboard**
  - Top 10 bestselling genres
  - Top 10 bestselling authors
  - Distribution of ratings
- 🤖 **AI-Powered Book Recommender**
  - Suggests books similar to your chosen title
  - Uses genre, author, and description features
  - Built with **TF-IDF vectorization + cosine similarity**
- 🌐 **Streamlit Frontend**
  - Interactive tabs (Recommendations | Analysis)
  - Clean retro-inspired theme with custom styles
  - Responsive and fun to use

---

## ✦ Project Structure
```

├── data_preprocessing.py   # Cleans CSV files & loads data into books.db
├── analysis.py             # Generates charts and sentiment analysis
├── app.py                  # Streamlit dashboard (recommendations + analysis)
├── books.db                # SQLite database (auto-generated after preprocessing)
├── requirements.txt        # Python dependencies
└── README.md               # Documentation

````

<img width="1755" height="1495" alt="image" src="https://github.com/user-attachments/assets/08751eb3-a200-43da-8984-796576b71c08" />
<img width="1755" height="1562" alt="image" src="https://github.com/user-attachments/assets/2c7d5af8-6b10-4e04-a436-bb8d9051fc42" />

---

## ✦ Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/readwise-books.git
cd readwise-books
````

2. **Install dependencies**

```bash
pip install -r requirements.txt
```

3. **Prepare the database**

```bash
python data_preprocessing.py
```

4. **Run the analysis (optional, charts only)**

```bash
python analysis.py
```

5. **Run the Streamlit app**

```bash
streamlit run app.py
```

---

## ✦ Screenshots

### 1. 📊 Bestseller Trends Dashboard

*Add screenshots here*
![Screenshot Placeholder](./screenshot_trends.png)

### 2. 🤖 Recommendation System

*Add screenshots here*
![Screenshot Placeholder](./screenshot_recs.png)

---

## ✦ Requirements

* Python 3.8+
* Pandas
* Matplotlib
* Seaborn
* SQLite3
* TextBlob
* Scikit-learn
* Streamlit
* Numpy

Install all with:

```bash
pip install -r requirements.txt
```

---

## ✦ Future Improvements

* Add **collaborative filtering** for more personalized recs
* Enhance sentiment analysis with advanced NLP models
* Deploy on **Streamlit Cloud / Hugging Face Spaces**
* Add user authentication for saving preferences
