import React, { useState } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';


function Search() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);

  const searchMovies = e => {
    e.preventDefault();
    const apiKey = process.env.REACT_APP_TMDB_API_KEY;

    axios
      .get(
        `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=ru-RU&query=${query}&page=1`
      )
      .then(response => {
        setMovies(response.data.results);
      })
      .catch(error => {
        console.error('Ошибка при поиске фильмов:', error);
      });
  };

  return (
    <div>
      <h2>Поиск фильмов и сериалов</h2>
      <form className="search-form" onSubmit={searchMovies}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Введите название..."
        />
        <button type="submit">Поиск</button>
      </form>
      <div className="movie-list">
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}

export default Search;
