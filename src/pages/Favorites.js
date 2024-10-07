import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Favorites.css';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('Пользователь не авторизован');
        }

        const response = await axios.get(`http://172.16.216.185/moviesBackend/get_favorites.php?userId=${userId}`);
        
        console.log('Response from server:', response.data); // Добавим лог для отладки

        if (response.data.status === 'success') {
          setFavorites(response.data.data);
        } else {
          throw new Error(response.data.message || 'Не удалось загрузить избранное');
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const removeFromFavorites = async (id) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('Пользователь не авторизован');
      }

      const response = await axios.post('http://172.16.216.185/moviesBackend/remove_favorite.php', {
        movieId: id,
        userId: userId
      });

      if (response.data.status === 'success') {
        setFavorites(favorites.filter(item => item.id !== id));
      } else {
        throw new Error(response.data.message || 'Не удалось удалить фильм из избранного');
      }
    } catch (err) {
      console.error('Ошибка при удалении из избранного:', err);
      alert('Не удалось удалить фильм из избранного. Пожалуйста, попробуйте позже.');
    }
  };

  if (isLoading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="favorites-container">
      <h1>Избранное</h1>
      {favorites.length === 0 ? (
        <p>У вас пока нет избранных фильмов.</p>
      ) : (
        <div className="favorites-list">
          {favorites.map(movie => (
            <div key={movie.id} className="favorite-item">
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
              />
              <div className="favorite-item-info">
                <h3>{movie.title}</h3>
                <p>Дата выхода: {new Date(movie.release_date).toLocaleDateString()}</p>
                <Link to={`/movie/${movie.id}`}>Подробнее</Link>
                <button onClick={() => removeFromFavorites(movie.id)}>Удалить из избранного</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}