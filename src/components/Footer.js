import React, { useState, useEffect } from 'react';
import '../styles/Footer.css';

function Footer() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer className={`footer ${isVisible ? 'visible' : ''}`}>
      <div className="footer-content">
        <i>MovieMap</i>
        <nav className="footer-nav">
          <a href="/">О нас</a>
          <a href="/">Контакты</a>
          <a href="/">Политика конфиденциальности</a>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;