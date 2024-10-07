import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styles/MovieDetails.css';
// Простой компонент аватара
const Avatar = ({ username, className = '' }) => {
  const initials = username.charAt(0).toUpperCase();
  const backgroundColor = stringToColor(username);

  return (
    <div 
      className={`avatar ${className}`} 
      style={{
        backgroundColor,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '1.2rem'
      }}
    >
      {initials}
    </div>
  );
};

// Функция для генерации цвета на основе строки
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

export default function MovieDetails() {
  const [movie, setMovie] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const { id } = useParams();
  const apiKey = process.env.REACT_APP_TMDB_API_KEY;
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setIsLoading(true);
      try {
        const [movieResponse, reviewsResponse, userRatingResponse, averageRatingResponse] = await Promise.all([
          axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=ru-RU`),
          axios.get(`http://localhost/moviesBackend/get_reviews.php?movie_id=${id}`),
          userId ? axios.get(`http://localhost/moviesBackend/get_user_rating.php?user_id=${userId}&movie_id=${id}`) : Promise.resolve({ data: { rating: 0 } }),
          axios.get(`http://localhost/moviesBackend/get_average_rating.php?movie_id=${id}`)
        ]);
        
        setMovie(movieResponse.data);
        setReviews(reviewsResponse.data.reviews);
        setUserRating(userRatingResponse.data.rating);
        setAverageRating(Number(averageRatingResponse.data.average_rating) || 0);

        await saveMovieToDatabase(movieResponse.data);
        checkIfFavorite();
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setError('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id, apiKey, userId]);

  const saveMovieToDatabase = async (movieData) => {
    try {
      await axios.post('http://172.16.216.185/moviesBackend/save_movie.php', {
        id: movieData.id,
        title: movieData.title,
        overview: movieData.overview,
        release_date: movieData.release_date,
        poster_path: movieData.poster_path,
        vote_average: movieData.vote_average
      });
    } catch (error) {
      console.error('Error saving movie to database:', error);
    }
  };

  const checkIfFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.some(fav => fav.id === parseInt(id)));
  };

  const handleRatingChange = async (newRating) => {
    if (!userId) {
      alert('Войдите в аккаунт, чтобы оценить фильм.');
      return;
    }

    try {
      const response = await axios.post('http://172.16.216.185/moviesBackend/add_rating.php', {
        user_id: userId,
        movie_id: id,
        rating: newRating
      });

      if (response.data.status === 'success') {
        setUserRating(newRating);
        const averageRatingResponse = await axios.get(`http://172.16.216.185/moviesBackend/get_average_rating.php?movie_id=${id}`);
        setAverageRating(Number(averageRatingResponse.data.average_rating) || 0);
        alert('Ваша оценка успешно сохранена!');
      } else {
        throw new Error(response.data.message || 'Неизвестная ошибка при сохранении оценки');
      }
    } catch (error) {
      console.error('Ошибка при сохранении оценки:', error);
      alert(`Произошла ошибка при сохранении оценки: ${error.message}`);
    }
  };

  const addReview = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert('Войдите в аккаунт, чтобы оставить отзыв.');
      return;
    }
    if (userRating === 0) {
      alert('Пожалуйста, поставьте оценку фильму перед тем, как оставить отзыв.');
      return;
    }

    try {
      const response = await axios.post('http://172.16.216.185/moviesBackend/add_review.php', {
        user_id: userId,
        movie_id: id,
        review_text: reviewText,
        rating: userRating
      });
      if (response.data.status === 'success') {
        alert('Отзыв успешно добавлен!');
        setReviewText('');
        setReviews(prev => [...prev, { id: response.data.review_id, user_id: userId, review_text: reviewText, username: 'Вы', rating: userRating }]);
      } else {
        alert('Ошибка при добавлении отзыва: ' + response.data.message);
      }
    } catch (error) {
      console.error('Ошибка при добавлении отзыва:', error);
      alert('Произошла ошибка при добавлении отзыва. Пожалуйста, попробуйте позже.');
    }
  };

  const toggleFavorite = async () => {
    if (!userId) {
      alert('Войдите в аккаунт, чтобы добавить фильм в избранное.');
      return;
    }

    try {
      const action = isFavorite ? 'remove' : 'add';
      const response = await axios.post(`http://172.16.216.185/moviesBackend/${action}_favorite.php`, {
        user_id: userId,
        movie_id: id
      });

      if (response.data.status === 'success') {
        setIsFavorite(!isFavorite);
        const message = isFavorite ? 'Фильм удален из избранного!' : 'Фильм успешно добавлен в избранное!';
        alert(message);
      } else {
        throw new Error(response.data.message || 'Неизвестная ошибка при обновлении избранного');
      }
    } catch (error) {
      console.error('Ошибка при обновлении избранного:', error);
      alert('Произошла ошибка при обновлении избранного. Пожалуйста, попробуйте позже.');
    }
  };

  if (isLoading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!movie) return null;

  return (
    <div className="movie-details-container">
      <div className="movie-details">
        <div className="movie-poster">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
          />
        </div>
        <div className="movie-info">
          <h1>{movie.title}</h1>
          <p className="movie-overview">{movie.overview}</p>
          <div className="movie-meta">
            <span>Рейтинг TMDB: {movie.vote_average}/10</span>
            <span>Средняя оценка пользователей: {averageRating.toFixed(2)}/10</span>
            <span>Год: {new Date(movie.release_date).getFullYear()}</span>
            <span>Длительность: {movie.runtime} мин</span>
          </div>
          <div className="user-rating">
            <p>Ваша оценка:</p>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
              <span
                key={star}
                className={`star ${star <= userRating ? 'filled' : ''}`}
                onClick={() => handleRatingChange(star)}
              >
                ★
              </span>
            ))}
          </div>
          <button className="favorite-btn" onClick={toggleFavorite}>
            {isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
          </button>
        </div>
      </div>

      <div className="reviews-section">
        <h2>Отзывы</h2>
        <div className="reviews-list">
          {reviews.map((rev) => (
            <div className="review" key={rev.id} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
              <Avatar username={rev.username} className="mr-4" />
              <div style={{ flex: 1 }}>
                <div className="review-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <span className="review-author" style={{ fontWeight: 'bold', marginRight: '10px' }}>{rev.username}</span>
                  {rev.rating && <span className="review-rating" style={{ fontSize: '0.9em', color: '#666' }}>Оценка: {rev.rating}/10</span>}
                </div>
                <p className="review-text">{rev.review_text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="review-form" style={{ marginTop: '30px' }}>
          <h3 style={{ fontSize: '1.2em', marginBottom: '15px' }}>Оставить отзыв</h3>
          <form onSubmit={addReview} style={{ display: 'flex', flexDirection: 'column' }}>
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Напишите ваш отзыв..."
              required
              style={{ 
                width: '100%', 
                minHeight: '100px', 
                padding: '10px', 
                marginBottom: '10px', 
                border: '1px solid #ccc', 
                borderRadius: '4px' 
              }}
            ></textarea>
            <button 
              type="submit" 
              disabled={userRating === 0}
              style={{
                padding: '10px 20px',
                backgroundColor: userRating === 0 ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: userRating === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {userRating === 0 ? 'Сначала оцените фильм' : 'Отправить'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}