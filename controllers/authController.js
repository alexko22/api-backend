// controller logic...
// to do next: validation, error handling

const db = require('../config/db')
// password hashing...
const bcrypt = require('bcrypt')

const registerUser = async (req, res) => {
  const { first_name, last_name, email, password } = req.body

  // first potential error: missing an element
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({
        error_code: 101,
        error_title: 'Validation Error',
        error_message: 'Could not locate one or more of first name, last name, email, and password. All are required!'
    })
  }

  // second potential error: not a valid email (doesn't contain @)
  if (!email.includes('@')) {
    return res.status(400).json({
        error_code: 102,
        error_title: 'Invalid Email Adress',
        error_message: 'Valid email adresses would contain an @ character.'
    })
  }

  // third potential error: user with said email already exists...
  // checking db for previous user account
  const emailQuery = 'SELECT id FROM users WHERE email = ?'
  db.query(emailQuery, [email], async (err, res2) => {
    if (err) {
        // using 500 again cuz its not users fault per say...
        return res.status(500).json({
            error_code: 103,
            error_title: 'Internal Query Error',
            error_message: 'An internal error occured during database operations... please try again.'
        })
    }
    // check if anything was found already existing...
    if (res2.length > 0) {
        return res.status(400).json({
            error_code: 104,
            error_title: 'Duplicate Email Error',
            error_message: 'An account with this email already exists.'
        })
    }
  })

  // bringing into a try to ensure success/catch errors...
  try {
      // hashing complexity...
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
            return res.status(500).json({
                error_code: 103,
                error_title: 'Internal Query Error',
                error_message: 'An internal error occured during database operations... please try again.'
            })
        }
        // else success...
        res.status(201).json({
            success: true,
            message: 'User has registered successfully'
        })
    }
    )
  } catch (error) {
    return res.status(500).json({
        error_code: 105,
        error_title: 'Password Failure',
        error_message: 'An internal error occured when securing your password!'
    })
  }
}
  
module.exports = { registerUser }
