import { authService } from '../services/auth/authService.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);

    res.json({
      status: 'success',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: error.message || 'Invalid credentials'
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    res.json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error fetching current user'
    });
  }
};

// If you need to export more functions, add them here
export const logout = async (req, res) => {
  try {
    // Handle logout logic here
    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error logging out'
    });
  }
}; 