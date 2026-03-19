// defining endpoint specifics...

const express = require('express')
const router = express.Router()
const { registerUser, loginUser, viewMessages, sendMessage } = require('../controllers/authController')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/view_messages', viewMessages)
router.post('/send_message', sendMessage)

module.exports = router