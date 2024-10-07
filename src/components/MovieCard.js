import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardMedia, CardContent, Typography, Chip } from '@mui/material';
import '../styles/MovieCard.css'

function MovieCard({ movie }) {
  const releaseYear = new Date(movie.release_date).getFullYear();

  return (
    <Card className="movie-card">
      <Link to={`/movie/${movie.id}`} className="movie-link">
        <CardMedia
          component="img"
          image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title || movie.name}
          className="movie-poster"
        />
        <CardContent className="movie-content">
          <Typography variant="h6" className="movie-title">
            {movie.title || movie.name}
          </Typography>
          <Typography variant="body2" className="movie-year">
            Год выхода: {releaseYear}
          </Typography>
          <Typography variant="body2" className="movie-rating">
            Рейтинг: {movie.vote_average}
          </Typography>
        </CardContent>
      </Link>
    </Card>
  );
}
export default MovieCard;