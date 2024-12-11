import { query } from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const branchDb = {
  getAll: async () => {
    const sql = 'SELECT * FROM branches ORDER BY name';
    return await query(sql);
  },

  findById: async (id) => {
    const sql = 'SELECT * FROM branches WHERE id = ?';
    const branches = await query(sql, [id]);
    return branches[0];
  },

  create: async (branchData) => {
    const id = uuidv4();
    const sql = `
      INSERT INTO branches (id, branch_code, name, location)
      VALUES (?, ?, ?, ?)
    `;
    
    await query(sql, [
      id,
      branchData.branchCode,
      branchData.name,
      branchData.location
    ]);

    return { ...branchData, id };
  },

  update: async (id, branchData) => {
    const sql = `
      UPDATE branches 
      SET name = ?, location = ?
      WHERE id = ?
    `;
    
    await query(sql, [branchData.name, branchData.location, id]);
    return await this.findById(id);
  },

  delete: async (id) => {
    const sql = 'DELETE FROM branches WHERE id = ?';
    return await query(sql, [id]);
  }
}; 