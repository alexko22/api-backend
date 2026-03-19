// controllers/authController.js | alexko22222@gmail.com
// controller file to define the logic for each endpoint...

const db = require('../config/db')

// bcrypt for password hashing...
const bcrypt = require('bcrypt')

// registration logic...
const registerUser = async (req, res) => {
  const { first_name, last_name, email, password } = req.body

  // first potential error: missing an element entirely
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({
        error_code: 101,
        error_title: 'Data Validation Error',
        error_message: 'Could not locate one or more of first name, last name, email, and password. All are required!'
    })
  }

  // second potential error: not a valid email address (doesn't contain @)
  if (!email.includes('@')) {
    return res.status(400).json({
        error_code: 102,
        error_title: 'Invalid Email Address',
        error_message: 'Valid email addresses would contain an @ character. Try again!'
    })
  }

  // third potential error: user with said email already exists...
  // checking db for previous user account instance
  const emailQuery = 'SELECT id FROM users WHERE email = ?'
  db.query(emailQuery, [email], async (err, res2) => {
    if (err) {
        // using 500 again cuz its not users fault per say... (vs 400 where it is)
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
            error_title: 'Duplicate Account Error',
            error_message: 'An account with this email already exists!'
        })
    }
      try {

    // hashing complexity...
    const hashed_password = await bcrypt.hash(password, 8)

    // sql query for inserting into db...
    // decided on ? -> prevents SQL injection attacks
    const query = `
        INSERT INTO users (first_name, last_name, email, hashed_password)
        VALUES (?, ?, ?, ?)
    `
    // queries the database as specified...
    db.query(query, [first_name, last_name, email, hashed_password], (err, result) => {
        // error handling... internal error
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

// login logic...
const loginUser = async (req, res) => {
    const { email, password } = req.body

    // error case 1: missing username or password
    if (!email || !password) {
        return res.status(400).json({
            error_code: 201,
            error_title: 'Validation Error',
            error_message: 'Could not locate your username or password. Both are required elements!'
        })
    }

    // error case 2: email invalid (not an email)
    if (!email.includes('@')) {
        return res.status(400).json({
            error_code: 202,
            error_title: 'Invalid Email Address',
            error_message: 'This is not a valid email. Email must contain @ character!'
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
                    error_message: 'Your Password was Incorrect. Please try again!'
                })
            }

            // either good here or catch error of password comparison...
            return res.status(200).json({
                success: true,
                message: 'Login complete!',
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

// View Messages logic...
const viewMessages = (req, res) => {
    const { outgoing_id, incoming_id } = req.query || {} // added for debugging... (should be fine now but added protection for empty request)

    // error case 1: missing one of the user id's
    if (!outgoing_id || !incoming_id) {
        return res.status(400).json({
            error_code: 301,
            error_title: 'User Validation Error',
            error_message: 'Failed to locate one of the users! Both incoming and outgoing user ids are required!',
        })
    }

    // check if both users exist...
    const existCheck = 'SELECT id from users WHERE id IN (?, ?)'
    db.query(existCheck, [outgoing_id, incoming_id], (err, users) => {
        if (err) {
            return res.status(500).json({
                error_code: 302,
                error_title: 'Internal Verification Error',
                error_message: 'An internal error occured while trying to verify user ids. Please try again! ',
            })
        }
        // see if two valid results were returned... if not error...
        if (users.length != 2) {
                return res.status(400).json({
                error_code: 303,
                error_title: 'User Verification Failed',
                error_message: 'One or more of these users do not exist! Try again!',
            })
        }
        // query to get messages... and need to order them by time so convo makes sense...
        const viewQuery = ` SELECT id, outgoing_id, incoming_id, message, time_created FROM messages WHERE (outgoing_id = ? AND incoming_id = ?) OR (outgoing_id = ? AND incoming_id = ?) ORDER BY time_created ASC `

        // placing inside the above query to avoide duplicate response code bug...
        db.query(viewQuery, [outgoing_id, incoming_id, incoming_id, outgoing_id], (err, res2) => {
            if (err) {
                return res.status(500).json({
                    error_code: 304,
                    error_title: 'Internal Retrieval Error',
                    error_message: 'An internal error occured when trying to find the requested messages!',
                })
            }
            // else success...
            return res.status(200).json({
                success: true,
                messages: res2
            })
        })
    })
}

// Send Message logic...
const sendMessage = (req, res) => {
    const { outgoing_id, incoming_id, message } = req.body

    // error case 1: missing one of the elements as before...
    if (!outgoing_id || !incoming_id || !message) {
        return res.status(400).json({
            error_code: 401,
            error_title: 'Data Validation Error',
            error_message: 'Failed to locate one or more of: outgoing id, incoming id, and message, which are all required elements. Try again!'
        })
    }
    // check if the user exists just as before for view message... 
    const existCheck = 'SELECT id from users WHERE id IN (?, ?)'
    db.query(existCheck, [outgoing_id, incoming_id], (err, users) => {
        if (err) {
            return res.status(500).json({
                error_code: 402,
                error_title: 'Internal Verification Error',
                error_message: 'An internal error occured while trying to verify user ids. Please try again! ',
            })
        }
        // see if two valid results were returned...
        if (users.length != 2) {
                return res.status(400).json({
                error_code: 403,
                error_title: 'User Verification Failed',
                error_message: 'One or more of these users do not exist! Try again!',
            })
        }
        // inserting message query
        const sendQuery = ` INSERT INTO messages (outgoing_id, incoming_id, message) VALUES (?, ?, ?) `

        // same format as before to avoid dupe code bug...
        db.query(sendQuery, [outgoing_id, incoming_id, message], (err, res2) => {
            if (err) {
                return res.status(500).json({
                    error_code: 404,
                    error_title: 'Internal Insertion Error',
                    error_message: 'An internal error occured when trying to send the requested message!',
                })
            }
            // else success...
            return res.status(200).json({
                success: true,
                messages: 'message sent successfully!'
            })
        })
    })
}

// list all users logic...
const listUsers = (req, res) =>  {
    const { requester_id } = req.query

    // error case 1: no requester id was provided (only one element)
    if (!requester_id) {
        return res.status(400).json({
            error_code: 501,
            error_title: 'Requester Validation Error',
            error_message: 'You must provide the user who is requesting!',
        })
    }

    // check if they exist like before...
    const requesterCheck = 'SELECT id FROM users WHERE id = ?'
    db.query(requesterCheck, [requester_id], (err, users) => {
        if (err) {
            return res.status(500).json({
                error_code: 502,
                error_title: 'Internal Verification Error',
                error_message: 'An internal error occured when locating your profile. Try again!',
            })
        }

        // ensure only one user was returned by the query (the requester)
        if (users.length != 1) {
            return res.status(500).json({
                error_code: 503,
                error_title: 'User Does Not Exist',
                error_message: 'This user does not exist... please try again!',
            })
        }

        const listQuery = ` SELECT id, first_name, last_name, email, time_created FROM users WHERE id != ? `
        // inside original query again to prevent double res code...
        db.query(listQuery, [requester_id], (err, res2) => {
            if (err) {
                return res.status(500).json({
                    error_code: 504,
                    error_title: 'Internal Query Error',
                    error_message: 'An internal error occured when trying to load users. Try again!',
                })
            }

            // else success
            return res.status(200).json({
                success: true,
                users: res2
            })
        })
    })
}

// export for use in authRoutes...
module.exports = { registerUser, loginUser, viewMessages, sendMessage, listUsers }
