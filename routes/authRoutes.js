// routes/authRoutes.js | alexko22222@gmail.com
// defining endpoint specifics (matching with controller logic)

const express = require('express')
const router = express.Router()

// import from authController.js
const { registerUser, loginUser, viewMessages, sendMessage, listUsers } = require('../controllers/authController')

// define endpoints (and desired methods)
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/view_messages', viewMessages)
router.post('/send_message', sendMessage)
router.get('/list_all_users', listUsers)

module.exports = router