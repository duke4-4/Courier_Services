import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import SenderDashboard from './pages/sender/SenderDashboard';
import ReceiverDashboard from './pages/receiver/ReceiverDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { initializeData } from './utils/initializeData';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize data first
    initializeData();
    setInitialized(true);
    
    // Then check for logged in user
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
  }, []);

  // Don't render until initialization is complete
  if (!initialized) {
    return null; // or return a loading spinner
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute user={user} role="admin">
              <AdminDashboard user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/sender/*"
          element={
            <ProtectedRoute user={user} role="sender">
              <SenderDashboard user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/receiver/*"
          element={
            <ProtectedRoute user={user} role="receiver">
              <ReceiverDashboard user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
