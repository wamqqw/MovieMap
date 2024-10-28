import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/Search.css'
import { Card, CardContent, CardMedia, Typography } from '@mui/material';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  const handleSearch = async (e) => {
    const apiKey = process.env.REACT_APP_TMDB_API_KEY;
    e.preventDefault()
    try {
      const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${searchQuery}`)
      const data = await response.json()
      setSearchResults(data.results)
    } catch (error) {
      console.error('Error searching movies:', error)
    }
  }

  return (
    <div className="search-container">
      <h1 className="search-title">Movie Search</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input
          className="search-input"
          type="text"
          placeholder="Search for movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className="search-button"
          type="submit"
        >
          Search
        </button>
      </form>
      <div className="movie-grid">
        {searchResults.map((movie) => (
          <Card key={movie.id} component={Link} to={`/movie/${movie.id}`} className="movie-card">
            <CardMedia
              component="img"
              height="280"
              image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
            />
            <CardContent>
              <Typography variant="h6" component="div" noWrap>
                {movie.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(movie.release_date).getFullYear()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}