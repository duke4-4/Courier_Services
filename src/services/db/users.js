import { query } from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export const userDb = {
  findByEmail: async (email) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const users = await query(sql, [email]);
    return users[0];
  },

  create: async (userData) => {
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const sql = `
      INSERT INTO users (id, email, password, name, role, branchId, branchName)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await query(sql, [
      id,
      userData.email,
      hashedPassword,
      userData.name,
      userData.role,
      userData.branchId || null,
      userData.branchName || null
    ]);

    return { ...userData, id, password: undefined };
  },

  verifyPassword: async (hashedPassword, password) => {
    return await bcrypt.compare(password, hashedPassword);
  }
}; 