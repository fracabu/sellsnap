import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { HomePage } from './src/pages/HomePage';
import { LoginPage } from './src/pages/LoginPage';
import { InventoryPage } from './src/pages/InventoryPage';
import './src/styles/themes.css';
import './src/i18n';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;