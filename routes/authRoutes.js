// defining endpoint specifics...

const express = require('express')
const router = express.Router()
const { registerUser, loginUser, viewMessages, sendMessage, listUsers } = require('../controllers/authController')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/view_messages', viewMessages)
router.post('/send_message', sendMessage)
router.get('/list_all_users', listUsers)

module.exports = router