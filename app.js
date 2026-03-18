// adapted from sample...
const express = require('express')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'API active' })
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})