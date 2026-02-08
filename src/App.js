import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'antd/dist/reset.css'; // Ant Design CSS

// Layout Components
import Navbar from './components/common/navbar';
import Footer from './components/common/footer';

// Pages
import HomePage from './pages/homepage';
import CatalogPage from './pages/catalog';
import AuthPage from './pages/Auth';
import UserDashboardPage from './pages/userDashboard';
import AdminDashboardPage from './pages/adminDashboard';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/Auth" element={<AuthPage />} />

            {/* User Routes */}
            <Route path="/userDashboard" element={<UserDashboardPage />} />

            {/* Admin Routes */}
            <Route path="/adminDashboard" element={<AdminDashboardPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;