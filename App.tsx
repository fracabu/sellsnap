import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './src/pages/HomePage';
import { LoginPage } from './src/pages/LoginPage';
import { InventoryPage } from './src/pages/InventoryPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
      </Routes>
    </Router>
  );
};

export default App;