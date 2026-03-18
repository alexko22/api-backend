// db connection adapted from sample...
const mysql = require('mysql2')

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'api_backend'
})

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed due to:', err.message)
    return
  }
  console.log('Connected to MySQL database!!!')
})

module.exports = connection