// db.js
import mysql from 'mysql2/promise.js';

const pool = mysql.createPool({
  host: 'localhost',
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: 'testdb',
  connectionLimit: 10,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    process.exit(1);
  }
  if (connection) connection.release();
  console.log('Connected to database!');
});

export default pool;
