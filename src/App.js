import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Search from './pages/Search';
import Profile from './pages/Profile';
import MovieDetails from './components/MovieDetails';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './styles/GlobalStyles.css';
import Footer from './components/Footer';
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196F3',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
  },
  typography: {
    fontFamily: 'Montserrat, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Header/>
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/tv/:id" element={<MovieDetails />} />
          </Routes>
        </div>
       <Footer/>
      </Router>
    </ThemeProvider>
  );
}

export default App;
