// controller logic...

const db = require('../config/db')
// password hashing...
const bcrypt = require('bcrypt')

// REGISTRATION
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
  })

}

// Login Implementation...
const loginUser = async (req, res) => {
    const { email, password } = req.body

    // error case 1: missing username or password
    if (!email || !password) {
        return res.status(400).json({
            error_code: 201,
            error_title: 'Validation Error',
            error_message: 'Could not locate your username or password. Both are required!'
        })
    }

    // error case 2: email invalid (not an email)
    if (!email.includes('@')) {
        return res.status(400).json({
            error_code: 202,
            error_title: 'Invalid Email Address',
            error_message: 'This is not a valid email. Email must contain @ character'
        })
    }

    // try to log in and match to existing account (test email and password)
    const loginQuery = 'SELECT * FROM users WHERE email = ?'
    db.query(loginQuery, [email], async (err, res2) => {
        if (err) {
            return res.status(500).json({
                error_code: 203,
                error_title: 'Internal Query Error',
                error_message: 'An internal error occured when trying to find your account. Please try again later.'
            })
        }

        // error case 4: account with said email does not exist (need to register first)
        if (res2.length == 0) {
            return res.status(400).json({
                error_code: 204,
                error_title: 'Email Account Error',
                error_message: 'An account with this email does not exist. Please register first!'
            })
        }

        // save account... then try password in catch else clear...
        const expectedUser = res2[0]

        try {
            const passTest = await bcrypt.compare(password, expectedUser.hashed_password)

            // error case: password does not match
            if (!passTest) {
                return res.status(400).json({
                    error_code: 205,
                    error_title: 'Password Error',
                    error_message: 'Your Password was Incorrect. Try again.'
                })
            }

            // either good here or catch error in comparison...
            return res.status(200).json({
                success: true,
                message: 'Login complete!',
                // saving for later use (assume i will need when pulling msgs etc.)
                user : {
                    id: expectedUser.id,
                    first_name: expectedUser.first_name,
                    last_name: expectedUser.last_name,
                    email: expectedUser.email
                }
            })
        } catch (error) {
            return res.status(500).json({
                error_code: 206,
                error_title: 'Internal Password Verification Error',
                error_message: 'An internal error occured when verifying your password... Please try again later!'
            })
        }
    })
}
  

// export
module.exports = { registerUser, loginUser }
