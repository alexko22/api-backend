// controller logic...
// to do next: validation, error handling

const db = require('../config/db')
// password hashing...
const bcrypt = require('bcrypt')

const registerUser = async (req, res) => {
  const { first_name, last_name, email, password } = req.body

  // hasing complexity...
  const hashed_password = await bcrypt.hash(password, 8)

  // inserting into db...
  // ? -> prevents SQL injection attacks
  const query = `
    INSERT INTO users (first_name, last_name, email, hashed_password)
    VALUES (?, ?, ?, ?)
  `

  // queries the database as specified...
  db.query(query, [first_name, last_name, email, hashed_password], (err, result) => {
    // error handling... to be expanded upon...
    if (err) {
      return res.status(500).json({ message: 'Something went wrong' })
    }
    // else success...
    res.status(201).json({
      success: true,
      message: 'User has registered successfully'
    })
  })
}

module.exports = { registerUser }