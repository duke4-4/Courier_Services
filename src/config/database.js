import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const query = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Database query failed');
  }
};

export const getConnection = async () => {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Failed to get database connection');
  }
};

// If you need a connectDB function, define it like this:
export const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to the database');
    connection.release();
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Failed to connect to the database');
  }
}; 