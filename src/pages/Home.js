import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import Footer from '../components/Footer';
import '../styles/Home.css';

function Home() {
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_TMDB_API_KEY;
    // Получение популярных фильмов
    axios
      .get(
        `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=ru-RU&page=1`
      )
      .then(response => {
        setPopularMovies(response.data.results);
        // Выбор нескольких фильмов для героя
        setFeaturedMovies(response.data.results.slice(0, 5));
      })
      .catch(error => {
        console.error('Ошибка при получении популярных фильмов:', error);
      });

    // Получение популярных сериалов
    axios
      .get(
        `https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}&language=ru-RU&page=1`
      )
      .then(response => {
        setPopularTVShows(response.data.results);
      })
      .catch(error => {
        console.error('Ошибка при получении популярных сериалов:', error);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeaturedIndex((prevIndex) => 
        (prevIndex + 1) % featuredMovies.length
      );
    }, 7000);

    return () => clearInterval(interval);
  }, [featuredMovies]);
  return (
    <div className="home-container">
      {featuredMovies.length > 0 && (
        <div className="hero-section" style={{backgroundImage: `url(https://image.tmdb.org/t/p/original${featuredMovies[currentFeaturedIndex].backdrop_path})`}}>
          <div className="hero-content">
            <h1>{featuredMovies[currentFeaturedIndex].title}</h1>
            <p>{featuredMovies[currentFeaturedIndex].overview}</p>
            <button className="watch-now-btn">Смотреть сейчас</button>
          </div>
        </div>
      )}
      {searchResults.length > 0 ? (
        <div>
          <h2>Результаты поиска</h2>
          <div className="movie-list">
            {searchResults.map(item => (
              <MovieCard key={item.id} movie={item} />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div>
            <h2>Популярные фильмы</h2>
            <div className="movie-list">
              {popularMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
          <div>
            <h2>Популярные сериалы</h2>
            <div className="movie-list">
              {popularTVShows.map(show => (
                <MovieCard key={show.id} movie={{...show, title: show.name}} />
              ))}
            </div>
          </div>
        </>
      )}
      <Footer />
    </div>
  );
}

export default Home;