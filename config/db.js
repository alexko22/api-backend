// config/db.js | alexko22222@gmail.com
// establishes connection to the MySQL db

// closely adapted from example documentation snippet...
const mysql = require('mysql2')

// (hidden variables in env file) --> local setup info in ReadME
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