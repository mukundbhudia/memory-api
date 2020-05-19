const express = require('express')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 4000

const { connectDB, getDBClient, disconnectDB } = require('./dbClient.js')

require('dotenv').config()

const startServer = async () => {
    await connectDB()
    app.use(cors())
    app.get('/', (req, res) => res.json({ msg: 'Welcome to the memory API!' }))
    app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`))
  }
  
startServer()