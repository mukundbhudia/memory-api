const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 4000

const { connectDB, getDBClient, disconnectDB } = require('./dbClient.js')

require('dotenv').config()

const options = {
  inflate: true,
}

const startServer = async () => {
    await connectDB()
    app.use(cors())
    app.use(bodyParser.json(options))
    app.get('/', (req, res) => res.json({ msg: 'Welcome to the memory API!' }))
    app.post('/signup', (req, res) => {
      console.log(req.body)
      
      res.json({ msg: 'posted' })
    })
    app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`))
  }
  
startServer()