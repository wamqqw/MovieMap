import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Profile.css';

export default function Profile() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistered, setIsRegistered] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [ratedMovies, setRatedMovies] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setIsLoggedIn(true);
      fetchUserData(userId);
      fetchRatedMovies(userId);
    }
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(`http://172.16.216.185/moviesBackend/get_user.php?user_id=${userId}`);
      if (response.data.status === 'success') {
        setUsername(response.data.username);
        setEmail(response.data.email);
      }
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error);
    }
  };

  const fetchRatedMovies = async (userId) => {
    try {
      const response = await axios.get(`http://172.16.216.185/moviesBackend/get_user_rated_movies.php?user_id=${userId}`);
      if (response.data.status === 'success') {
        setRatedMovies(response.data.movies);
      }
    } catch (error) {
      console.error('Ошибка при получении оцененных фильмов:', error);
    }
  };

  const register = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://172.16.216.185/moviesBackend/register.php', {
        username,
        email,
        password
      });
      if (response.data.status === 'success') {
        alert('Регистрация успешна!');
        localStorage.setItem('userId', response.data.user_id);
        setIsLoggedIn(true);
        fetchUserData(response.data.user_id);
        fetchRatedMovies(response.data.user_id);
      } else {
        alert('Ошибка регистрации: ' + response.data.message);
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
    }
  };

  const login = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://172.16.216.185/moviesBackend/login.php', {
        email,
        password
      });
      if (response.data.status === 'success') {
        alert('Вход выполнен!');
        localStorage.setItem('userId', response.data.user_id);
        setIsLoggedIn(true);
        fetchUserData(response.data.user_id);
        fetchRatedMovies(response.data.user_id);
      } else {
        alert('Ошибка входа: ' + response.data.message);
      }
    } catch (error) {
      console.error('Ошибка при входе:', error);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('new_username', newUsername);
    if (profileImage) {
      formData.append('profile_image', profileImage);
    }

    try {
      const response = await axios.post('http://172.16.216.185/moviesBackend/update_profile.php', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.status === 'success') {
        alert('Профиль обновлен!');
        setUsername(newUsername);
      } else {
        alert('Ошибка обновления профиля: ' + response.data.message);
      }
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setUsername('');
    setEmail('');
    setRatedMovies([]);
  };

  if (isLoggedIn) {
    return (
      <div className="profile-container">
        <h2 className="profile-title">Профиль пользователя</h2>
        <div className="profile-content">
          <div className="profile-image-container">
            <img src={profileImage ? URL.createObjectURL(profileImage) : '/placeholder.svg?height=150&width=150'} alt="Profile" className="profile-image" />
            <label htmlFor="profile-image-upload" className="profile-image-upload-label">
              Изменить фото
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => setProfileImage(e.target.files[0])}
                className="profile-image-upload"
              />
            </label>
          </div>
          <form onSubmit={updateProfile} className="profile-form">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Новое имя пользователя"
              className="profile-input"
            />
            <button type="submit" className="profile-button">Обновить профиль</button>
          </form>
          <button onClick={logout} className="profile-button logout-button">Выйти</button>
        </div>
        <div className="rated-movies-section">
          <h3 className="rated-movies-title">Оцененные и отрецензированные фильмы</h3>
          <div className="rated-movies-list">
            {ratedMovies.map((movie) => (
              <div key={movie.id} className="rated-movie-item">
                <img 
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
                  alt={movie.title} 
                  className="rated-movie-poster"
                />
                <div className="rated-movie-info">
                  <h4 className="rated-movie-title">{movie.title}</h4>
                  <p className="rated-movie-rating">Ваша оценка: {movie.user_rating}/10</p>
                  {movie.review_text && (
                    <p className="rated-movie-review">Ваш отзыв: {movie.review_text}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2 className="profile-title">{isRegistered ? 'Вход' : 'Регистрация'}</h2>
      <div className="profile-content">
        {isRegistered ? (
          <form onSubmit={login} className="profile-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="profile-input"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              required
              className="profile-input"
            />
            <button type="submit" className="profile-button">Войти</button>
            <p className="profile-switch">
              Нет аккаунта?{' '}
              <span onClick={() => setIsRegistered(false)} className="profile-switch-link">Зарегистрируйтесь</span>
            </p>
          </form>
        ) : (
          <form onSubmit={register} className="profile-form">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Имя пользователя"
              required
              className="profile-input"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="profile-input"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              required
              className="profile-input"
            />
            <button type="submit" className="profile-button">Зарегистрироваться</button>
            <p className="profile-switch">
              Уже есть аккаунт?{' '}
              <span onClick={() => setIsRegistered(true)} className="profile-switch-link">Войдите</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}