// defining endpoint specifics...

const express = require('express')
const router = express.Router()
const { registerUser, loginUser, viewMessages } = require('../controllers/authController')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/view_messages', viewMessages)

module.exports = router