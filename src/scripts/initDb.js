import { query } from '../config/database.js';
import { userDb } from '../services/db/users.js';
import { branchDb } from '../services/db/branches.js';

const initializeDatabase = async () => {
  try {
    // Create initial branches
    const branches = [
      { branchCode: 'BR001', name: 'Harare Central', location: 'Harare CBD' },
      { branchCode: 'BR002', name: 'Bulawayo Main', location: 'Bulawayo CBD' },
      { branchCode: 'BR003', name: 'Gweru Branch', location: 'Gweru' },
      { branchCode: 'BR004', name: 'Mutare Branch', location: 'Mutare' }
    ];

    for (const branch of branches) {
      await branchDb.create(branch);
    }

    // Create initial users
    const users = [
      {
        email: 'admin@hot.co.zw',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin'
      },
      {
        email: 'harare.central@hot.co.zw',
        password: 'operator123',
        name: 'Harare Central Operator',
        role: 'operator',
        branchId: 'BR001',
        branchName: 'Harare Central'
      }
    ];

    for (const user of users) {
      await userDb.create(user);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

initializeDatabase().catch(console.error); 