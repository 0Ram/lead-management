import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import LeadGrid from './components/LeadGrid';
import LeadForm from './components/LeadForm';
import { authService } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authService.getCurrentUser();
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.data.user);
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/leads" /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={user ? <Navigate to="/leads" /> : <Register />} />
        <Route 
          path="/leads" 
          element={user ? <LeadGrid user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/leads/create" 
          element={user ? <LeadForm user={user} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/leads/edit/:id" 
          element={user ? <LeadForm user={user} /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to={user ? "/leads" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;