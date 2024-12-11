import jwt from 'jsonwebtoken';
import { userDb } from '../db/users.js';

export const authService = {
  login: async (email, password) => {
    const user = await userDb.findByEmail(email);
    
    if (!user || !(await userDb.verifyPassword(user.password, password))) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Remove sensitive data
    delete user.password;
    
    return { user, token };
  },

  verifyToken: async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userDb.findById(decoded.id);
      
      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}; 