import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import ReceiverDashboard from './pages/receiver/ReceiverDashboard';
import OperatorDashboard from './pages/operator/OperatorDashboard';
import TrackParcel from './pages/TrackParcel';
import { initializeData } from './utils/initializeData';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Initialize data
    initializeData();
    
    // Check for logged in user
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
  }, []);

  const getDashboardComponent = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard user={user} setUser={setUser} />;
      case 'operator':
        return <OperatorDashboard user={user} setUser={setUser} />;
      case 'receiver':
        return <ReceiverDashboard user={user} setUser={setUser} />;
      default:
        return <Navigate to="/login" />;
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/track" element={<TrackParcel />} />
        <Route path="/admin/*" element={user?.role === 'admin' ? <AdminDashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/operator/*" element={user?.role === 'operator' ? <OperatorDashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/receiver/*" element={user?.role === 'receiver' ? <ReceiverDashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/" element={user ? getDashboardComponent() : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
