import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo-link">
          <h1 className="logo">MovieMap</h1>
        </Link>
        <nav className="main-nav">
          <ul>
            <li>
              <Link to="/">
                Главная
                <span></span>
              </Link>
            </li>
            <li>
              <Link to="/Search">
                Поиск
                <span></span>
              </Link>
            </li>
            <li>
              <Link to="/Favorites">
                Избранное
                <span></span>
              </Link>
            </li>
            <li>
              <Link to="/Profile">
                Профиль
                <span></span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;