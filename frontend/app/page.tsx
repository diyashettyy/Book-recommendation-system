"use client"

import { useState, useEffect, useMemo } from "react"

// Mock data for bestsellers
const mockBestsellers = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    genre: "Fiction",
    rating: 4.5,
    price: 16.99,
    sales: 15420,
  },
  { id: 2, title: "Atomic Habits", author: "James Clear", genre: "Self-Help", rating: 4.8, price: 18.99, sales: 28350 },
  {
    id: 3,
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    genre: "Fiction",
    rating: 4.6,
    price: 15.99,
    sales: 22100,
  },
  { id: 4, title: "Educated", author: "Tara Westover", genre: "Biography", rating: 4.7, price: 17.99, sales: 19800 },
  {
    id: 5,
    title: "The Silent Patient",
    author: "Alex Michaelides",
    genre: "Thriller",
    rating: 4.4,
    price: 14.99,
    sales: 17650,
  },
]

// Mock recommendations data
const mockRecommendations = {
  1: [
    {
      id: 6,
      title: "The Invisible Life of Addie LaRue",
      author: "V.E. Schwab",
      genre: "Fiction",
      rating: 4.3,
      price: 16.99,
      similarity: 0.89,
    },
    {
      id: 7,
      title: "Anxious People",
      author: "Fredrik Backman",
      genre: "Fiction",
      rating: 4.2,
      price: 15.99,
      similarity: 0.85,
    },
    {
      id: 8,
      title: "The Vanishing Half",
      author: "Brit Bennett",
      genre: "Fiction",
      rating: 4.4,
      price: 17.99,
      similarity: 0.82,
    },
  ],
  2: [
    {
      id: 9,
      title: "Deep Work",
      author: "Cal Newport",
      genre: "Self-Help",
      rating: 4.6,
      price: 16.99,
      similarity: 0.91,
    },
    {
      id: 10,
      title: "The Power of Habit",
      author: "Charles Duhigg",
      genre: "Self-Help",
      rating: 4.5,
      price: 15.99,
      similarity: 0.88,
    },
    {
      id: 11,
      title: "Mindset",
      author: "Carol S. Dweck",
      genre: "Self-Help",
      rating: 4.7,
      price: 14.99,
      similarity: 0.84,
    },
  ],
  3: [
    {
      id: 12,
      title: "The Great Alone",
      author: "Kristin Hannah",
      genre: "Fiction",
      rating: 4.5,
      price: 16.99,
      similarity: 0.87,
    },
    {
      id: 13,
      title: "The Nightingale",
      author: "Kristin Hannah",
      genre: "Fiction",
      rating: 4.6,
      price: 15.99,
      similarity: 0.83,
    },
    {
      id: 14,
      title: "All the Light We Cannot See",
      author: "Anthony Doerr",
      genre: "Fiction",
      rating: 4.4,
      price: 17.99,
      similarity: 0.81,
    },
  ],
  4: [
    {
      id: 15,
      title: "Becoming",
      author: "Michelle Obama",
      genre: "Biography",
      rating: 4.8,
      price: 19.99,
      similarity: 0.9,
    },
    {
      id: 16,
      title: "The Glass Castle",
      author: "Jeannette Walls",
      genre: "Biography",
      rating: 4.6,
      price: 14.99,
      similarity: 0.86,
    },
    {
      id: 17,
      title: "Born a Crime",
      author: "Trevor Noah",
      genre: "Biography",
      rating: 4.7,
      price: 16.99,
      similarity: 0.83,
    },
  ],
  5: [
    {
      id: 18,
      title: "The Woman in the Window",
      author: "A.J. Finn",
      genre: "Thriller",
      rating: 4.1,
      price: 15.99,
      similarity: 0.88,
    },
    {
      id: 19,
      title: "Gone Girl",
      author: "Gillian Flynn",
      genre: "Thriller",
      rating: 4.3,
      price: 14.99,
      similarity: 0.85,
    },
    {
      id: 20,
      title: "The Girl on the Train",
      author: "Paula Hawkins",
      genre: "Thriller",
      rating: 4.2,
      price: 13.99,
      similarity: 0.82,
    },
  ],
}

// Mock genres for the dropdown
const mockGenres = [
  "All Genres",
  "Fiction",
  "Self-Help",
  "Biography",
  "Thriller",
  "Mystery",
  "Romance",
  "Science Fiction",
]

// Mock query results with relevance_score
const mockQueryResults = [
  {
    id: 21,
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    genre: "Fiction",
    rating: 4.6,
    price: 16.99,
    relevance_score: 0.94,
  },
  {
    id: 22,
    title: "Project Hail Mary",
    author: "Andy Weir",
    genre: "Science Fiction",
    rating: 4.7,
    price: 18.99,
    relevance_score: 0.91,
  },
  {
    id: 23,
    title: "The Thursday Murder Club",
    author: "Richard Osman",
    genre: "Mystery",
    rating: 4.5,
    price: 15.99,
    relevance_score: 0.88,
  },
  {
    id: 24,
    title: "Circe",
    author: "Madeline Miller",
    genre: "Fiction",
    rating: 4.4,
    price: 17.99,
    relevance_score: 0.86,
  },
  {
    id: 25,
    title: "The Guest List",
    author: "Lucy Foley",
    genre: "Thriller",
    rating: 4.3,
    price: 14.99,
    relevance_score: 0.83,
  },
  {
    id: 26,
    title: "Malibu Rising",
    author: "Taylor Jenkins Reid",
    genre: "Fiction",
    rating: 4.2,
    price: 16.99,
    relevance_score: 0.81,
  },
]

export default function BookRecommenderFrontend() {
  const [activeTab, setActiveTab] = useState<"query" | "similar" | "analysis">("query")
  const [selectedBook, setSelectedBook] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<any[]>([])

  const [query, setQuery] = useState({
    genre: "",
    author: "",
    min_rating: 0.0,
  })
  const [queryResults, setQueryResults] = useState<any[]>([])

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Get recommendations when book selection changes
  useEffect(() => {
    if (selectedBook) {
      setLoading(true)
      setTimeout(() => {
        setRecommendations(mockRecommendations[selectedBook as keyof typeof mockRecommendations] || [])
        setLoading(false)
      }, 500)
    }
  }, [selectedBook])

  const handleQuerySearch = () => {
    setLoading(true)
    setTimeout(() => {
      // Filter mock results based on query criteria
      let filtered = [...mockQueryResults]

      if (query.genre && query.genre !== "All Genres") {
        filtered = filtered.filter((book) => book.genre === query.genre)
      }

      if (query.author) {
        filtered = filtered.filter((book) => book.author.toLowerCase().includes(query.author.toLowerCase()))
      }

      if (query.min_rating > 0) {
        filtered = filtered.filter((book) => book.rating >= query.min_rating)
      }

      setQueryResults(filtered)
      setLoading(false)
    }, 500)
  }

  const selectedBookData = useMemo(() => {
    return mockBestsellers.find((book) => book.id === selectedBook)
  }, [selectedBook])

  return (
    <div className="min-h-screen py-4 px-3 sm:py-8 sm:px-4 md:py-12 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Card Container */}
        <div className="bg-[#F5F3C7] rounded-lg shadow-[6px_6px_0px_0px_rgba(48,24,10,0.3)] md:shadow-[8px_8px_0px_0px_rgba(48,24,10,0.3)] border-[4px] md:border-[6px] border-[#30180a] overflow-hidden">
          {/* Header */}
          <div className="bg-[#FD9A02] border-b-[4px] md:border-b-[6px] border-[#30180a] p-4 sm:p-6 md:p-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#30180a] text-center tracking-tight">
              BOOK RECOMMENDER
            </h1>
            <p className="text-center text-[#30180a] mt-1 sm:mt-2 text-base sm:text-lg font-serif italic">
              Discover Your Next Great Read
            </p>
          </div>

          <div className="flex flex-col sm:flex-row border-b-[3px] md:border-b-[4px] border-[#30180a] bg-[#F5F3C7]">
            <button
              onClick={() => setActiveTab("query")}
              className={`flex-1 py-3 px-3 sm:py-4 sm:px-4 md:px-6 font-bold text-sm sm:text-base md:text-lg transition-all duration-500 flex items-center justify-center gap-2 sm:gap-3 border-b-[3px] sm:border-b-0 sm:border-r-[3px] md:border-r-[4px] border-[#30180a] ${
                activeTab === "query"
                  ? "bg-[#01928B] text-white shadow-inner"
                  : "bg-[#F5F3C7] text-[#30180a] hover:bg-[#FD9A02] hover:text-white"
              }`}
            >
              {/* Search Icon */}
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="hidden sm:inline">Multi-Criteria Query</span>
              <span className="sm:hidden">Query</span>
            </button>
            <button
              onClick={() => setActiveTab("similar")}
              className={`flex-1 py-3 px-3 sm:py-4 sm:px-4 md:px-6 font-bold text-sm sm:text-base md:text-lg transition-all duration-500 flex items-center justify-center gap-2 sm:gap-3 border-b-[3px] sm:border-b-0 sm:border-r-[3px] md:border-r-[4px] border-[#30180a] ${
                activeTab === "similar"
                  ? "bg-[#01928B] text-white shadow-inner"
                  : "bg-[#F5F3C7] text-[#30180a] hover:bg-[#FD9A02] hover:text-white"
              }`}
            >
              {/* Book Icon */}
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span className="hidden sm:inline">Similar to Book</span>
              <span className="sm:hidden">Similar</span>
            </button>
            <button
              onClick={() => setActiveTab("analysis")}
              className={`flex-1 py-3 px-3 sm:py-4 sm:px-4 md:px-6 font-bold text-sm sm:text-base md:text-lg transition-all duration-500 flex items-center justify-center gap-2 sm:gap-3 ${
                activeTab === "analysis"
                  ? "bg-[#01928B] text-white shadow-inner"
                  : "bg-[#F5F3C7] text-[#30180a] hover:bg-[#FD9A02] hover:text-white"
              }`}
            >
              {/* Trending Icon */}
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="hidden sm:inline">Bestseller Analysis</span>
              <span className="sm:hidden">Analysis</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-10">
            {activeTab === "query" ? (
              <div>
                {/* Query Input Area */}
                <div className="mb-6 sm:mb-8 bg-white border-[3px] md:border-[4px] border-[#30180a] rounded-lg p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(48,24,10,0.2)]">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#30180a] mb-4 sm:mb-6 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-[#B44819]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110 4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      />
                    </svg>
                    Search by Criteria
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    {/* Genre Dropdown */}
                    <div>
                      <label className="block text-[#30180a] font-bold text-sm sm:text-base mb-2">Genre:</label>
                      <select
                        value={query.genre}
                        onChange={(e) => setQuery({ ...query, genre: e.target.value })}
                        className="w-full p-3 sm:p-4 border-[2px] md:border-[3px] border-[#30180a] rounded-lg text-sm sm:text-base font-serif bg-[#F5F3C7] text-[#30180a] focus:outline-none focus:ring-4 focus:ring-[#FD9A02] transition-all duration-300 cursor-pointer hover:border-[#FD9A02]"
                      >
                        {mockGenres.map((genre) => (
                          <option key={genre} value={genre}>
                            {genre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Author Input */}
                    <div>
                      <label className="block text-[#30180a] font-bold text-sm sm:text-base mb-2">Author:</label>
                      <input
                        type="text"
                        value={query.author}
                        onChange={(e) => setQuery({ ...query, author: e.target.value })}
                        placeholder="Search by author name..."
                        className="w-full p-3 sm:p-4 border-[2px] md:border-[3px] border-[#30180a] rounded-lg text-sm sm:text-base font-serif bg-[#F5F3C7] text-[#30180a] placeholder-[#30180a]/50 focus:outline-none focus:ring-4 focus:ring-[#FD9A02] transition-all duration-300 hover:border-[#FD9A02]"
                      />
                    </div>

                    {/* Min Rating Input */}
                    <div>
                      <label className="block text-[#30180a] font-bold text-sm sm:text-base mb-2">Min. Rating:</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={query.min_rating}
                        onChange={(e) => setQuery({ ...query, min_rating: Number.parseFloat(e.target.value) || 0 })}
                        className="w-full p-3 sm:p-4 border-[2px] md:border-[3px] border-[#30180a] rounded-lg text-sm sm:text-base font-mono bg-[#F5F3C7] text-[#30180a] focus:outline-none focus:ring-4 focus:ring-[#FD9A02] transition-all duration-300 hover:border-[#FD9A02]"
                      />
                    </div>
                  </div>

                  {/* Search Button */}
                  <button
                    onClick={handleQuerySearch}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-[#FD9A02] text-white font-bold text-base sm:text-lg rounded-lg border-[3px] md:border-[4px] border-[#30180a] shadow-[4px_4px_0px_0px_rgba(48,24,10,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(48,24,10,0.4)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Search Books
                  </button>
                </div>

                {/* Results Header */}
                <h2 className="text-2xl sm:text-3xl font-bold text-[#30180a] mb-4 sm:mb-6 border-b-[3px] md:border-b-[4px] border-[#B44819] pb-2 sm:pb-3">
                  Search Results
                </h2>

                {/* Loading State */}
                {loading ? (
                  <div className="flex justify-center items-center py-12 sm:py-20">
                    <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-[4px] sm:border-[6px] border-[#30180a] border-t-[#FD9A02]"></div>
                  </div>
                ) : (
                  /* Book Cards Grid with relevance_score */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {queryResults.length > 0 ? (
                      queryResults.map((book) => (
                        <div
                          key={book.id}
                          className="bg-white border-[3px] md:border-[4px] border-[#30180a] rounded-lg p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(48,24,10,0.2)] transition-all duration-500 hover:shadow-[6px_6px_0px_0px_rgba(48,24,10,0.4)] md:hover:shadow-[8px_8px_0px_0px_rgba(48,24,10,0.4)] hover:scale-105 hover:border-[#01928B] cursor-pointer"
                        >
                          {/* Relevance Badge */}
                          <div className="flex justify-end mb-3">
                            <span className="bg-[#B44819] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-mono font-bold border-[2px] border-[#30180a]">
                              {(book.relevance_score * 100).toFixed(0)}% Score
                            </span>
                          </div>

                          {/* Book Title */}
                          <h3 className="text-xl sm:text-2xl font-bold text-[#30180a] mb-2 leading-tight">
                            {book.title}
                          </h3>

                          {/* Author */}
                          <p className="text-base sm:text-lg italic text-[#B44819] mb-3 sm:mb-4">by {book.author}</p>

                          {/* Book Details */}
                          <div className="space-y-2 border-t-[2px] border-[#30180a] pt-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs sm:text-sm font-bold text-[#30180a]">Genre:</span>
                              <span className="text-xs sm:text-sm text-[#30180a] bg-[#F5F3C7] px-2 py-1 rounded border-[2px] border-[#30180a]">
                                {book.genre}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs sm:text-sm font-bold text-[#30180a]">Rating:</span>
                              <span className="text-xs sm:text-sm text-[#30180a]">
                                {"★".repeat(Math.floor(book.rating))}
                                {"☆".repeat(5 - Math.floor(book.rating))}
                                <span className="ml-1 font-mono">{book.rating}</span>
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs sm:text-sm font-bold text-[#30180a]">Price:</span>
                              <span className="text-base sm:text-lg font-bold text-[#01928B]">${book.price}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12 sm:py-20">
                        <p className="text-lg sm:text-xl text-[#30180a] font-serif italic">
                          No books found. Try adjusting your search criteria.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : activeTab === "similar" ? (
              <div>
                {/* Book Selection Area */}
                <div className="mb-6 sm:mb-8 bg-white border-[3px] md:border-[4px] border-[#30180a] rounded-lg p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(48,24,10,0.2)]">
                  <label className="block text-[#30180a] font-bold text-lg sm:text-xl mb-3 sm:mb-4 flex items-center gap-2">
                    {/* Search Icon */}
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-[#B44819]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Select a Book You Love:
                  </label>
                  <select
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(Number(e.target.value))}
                    className="w-full p-3 sm:p-4 border-[2px] md:border-[3px] border-[#30180a] rounded-lg text-sm sm:text-base lg:text-lg font-serif bg-[#F5F3C7] text-[#30180a] focus:outline-none focus:ring-4 focus:ring-[#FD9A02] transition-all duration-300 cursor-pointer hover:border-[#FD9A02]"
                  >
                    {mockBestsellers.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title} by {book.author}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Book Display */}
                {selectedBookData && (
                  <div className="mb-6 sm:mb-8 bg-[#FD9A02] border-[3px] md:border-[4px] border-[#30180a] rounded-lg p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(48,24,10,0.3)] md:shadow-[6px_6px_0px_0px_rgba(48,24,10,0.3)]">
                    <h3 className="text-lg sm:text-2xl font-bold text-[#30180a] mb-2">You Selected:</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{selectedBookData.title}</p>
                    <p className="text-lg sm:text-xl italic text-[#30180a]">by {selectedBookData.author}</p>
                  </div>
                )}

                {/* Recommendations Header */}
                <h2 className="text-2xl sm:text-3xl font-bold text-[#30180a] mb-4 sm:mb-6 border-b-[3px] md:border-b-[4px] border-[#B44819] pb-2 sm:pb-3">
                  Recommended For You
                </h2>

                {/* Loading State */}
                {loading ? (
                  <div className="flex justify-center items-center py-12 sm:py-20">
                    <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-[4px] sm:border-[6px] border-[#30180a] border-t-[#FD9A02]"></div>
                  </div>
                ) : (
                  /* Book Cards Grid with similarity */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {recommendations.map((book) => (
                      <div
                        key={book.id}
                        className="bg-white border-[3px] md:border-[4px] border-[#30180a] rounded-lg p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(48,24,10,0.2)] transition-all duration-500 hover:shadow-[6px_6px_0px_0px_rgba(48,24,10,0.4)] md:hover:shadow-[8px_8px_0px_0px_rgba(48,24,10,0.4)] hover:scale-105 hover:border-[#01928B] cursor-pointer"
                      >
                        {/* Similarity Badge */}
                        <div className="flex justify-end mb-3">
                          <span className="bg-[#01928B] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-mono font-bold border-[2px] border-[#30180a]">
                            {(book.similarity * 100).toFixed(0)}% Match
                          </span>
                        </div>

                        {/* Book Title */}
                        <h3 className="text-xl sm:text-2xl font-bold text-[#30180a] mb-2 leading-tight">
                          {book.title}
                        </h3>

                        {/* Author */}
                        <p className="text-base sm:text-lg italic text-[#B44819] mb-3 sm:mb-4">by {book.author}</p>

                        {/* Book Details */}
                        <div className="space-y-2 border-t-[2px] border-[#30180a] pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm font-bold text-[#30180a]">Genre:</span>
                            <span className="text-xs sm:text-sm text-[#30180a] bg-[#F5F3C7] px-2 py-1 rounded border-[2px] border-[#30180a]">
                              {book.genre}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm font-bold text-[#30180a]">Rating:</span>
                            <span className="text-xs sm:text-sm text-[#30180a]">
                              {"★".repeat(Math.floor(book.rating))}
                              {"☆".repeat(5 - Math.floor(book.rating))}
                              <span className="ml-1 font-mono">{book.rating}</span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm font-bold text-[#30180a]">Price:</span>
                            <span className="text-base sm:text-lg font-bold text-[#01928B]">${book.price}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Bestseller Analysis Tab */
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#30180a] mb-4 sm:mb-6 border-b-[3px] md:border-b-[4px] border-[#B44819] pb-2 sm:pb-3">
                  Bestseller Trends & Analysis
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Genre Distribution Placeholder */}
                  <div className="bg-white border-[3px] md:border-[4px] border-[#30180a] rounded-lg p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(48,24,10,0.3)] md:shadow-[6px_6px_0px_0px_rgba(48,24,10,0.3)] min-h-[250px] sm:min-h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-[#FD9A02]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                        />
                      </svg>
                      <p className="text-lg sm:text-xl font-bold text-[#30180a]">Genre Distribution Chart</p>
                      <p className="text-xs sm:text-sm text-[#B44819] mt-2 italic">Visualization Coming Soon</p>
                    </div>
                  </div>

                  {/* Sales Trends Placeholder */}
                  <div className="bg-white border-[3px] md:border-[4px] border-[#30180a] rounded-lg p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(48,24,10,0.3)] md:shadow-[6px_6px_0px_0px_rgba(48,24,10,0.3)] min-h-[250px] sm:min-h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-[#01928B]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      <p className="text-lg sm:text-xl font-bold text-[#30180a]">Sales Trends Chart</p>
                      <p className="text-xs sm:text-sm text-[#B44819] mt-2 italic">Visualization Coming Soon</p>
                    </div>
                  </div>

                  {/* Rating Analysis Placeholder */}
                  <div className="bg-white border-[3px] md:border-[4px] border-[#30180a] rounded-lg p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(48,24,10,0.3)] md:shadow-[6px_6px_0px_0px_rgba(48,24,10,0.3)] min-h-[250px] sm:min-h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-[#B44819]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                      <p className="text-lg sm:text-xl font-bold text-[#30180a]">Rating Analysis Chart</p>
                      <p className="text-xs sm:text-sm text-[#B44819] mt-2 italic">Visualization Coming Soon</p>
                    </div>
                  </div>

                  {/* Price Comparison Placeholder */}
                  <div className="bg-white border-[3px] md:border-[4px] border-[#30180a] rounded-lg p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(48,24,10,0.3)] md:shadow-[6px_6px_0px_0px_rgba(48,24,10,0.3)] min-h-[250px] sm:min-h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-[#FD9A02]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-lg sm:text-xl font-bold text-[#30180a]">Price Comparison Chart</p>
                      <p className="text-xs sm:text-sm text-[#B44819] mt-2 italic">Visualization Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-[#30180a] border-t-[4px] md:border-t-[6px] border-[#30180a] p-4 sm:p-6 text-center">
            <p className="text-[#F5F3C7] font-serif italic text-base sm:text-lg">
              Powered by Machine Learning & Good Taste
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
