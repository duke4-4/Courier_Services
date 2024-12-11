import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth/authService';

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.target);
      const { user, token } = await authService.login(
        formData.get('email'),
        formData.get('password')
      );

      localStorage.setItem('token', token);
      setUser(user);
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of your component JSX
}; 