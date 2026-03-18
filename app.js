// adapted from sample...
const express = require('express')
require('dotenv').config()

// auth routes...
const authRoutes = require('./routes/authRoutes')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
// auth routes cont...
app.use('/', authRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'API active' })
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})