const express = require('express')
const bodyParser = require('body-parser')
const jwt = require("jsonwebtoken");
const cors = require('cors')

require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 4000

const { connectDB, getDBClient, getClient } = require('../src/dbClient')

const bodyParserOptions = {
  inflate: true,
}

let session
let dbClient

const registerUser = async (user) => {
  let result
  await session.withTransaction(async () => {
    let existingUsers = []
    const cursor = await dbClient.collection('users').find({userName: user.userName})
    existingUsers = await cursor.toArray()
    if (existingUsers.length > 0) {
      result = { insertedId: null }
    } else {
      result = await dbClient.collection('users').insertOne(user)
    }
  })
  return result
}

const loginUser = async (user) => {
  let result
  await session.withTransaction(async () => {
    result = await dbClient.collection('users').findOne({userName: user.userName, password: user.password})
  })
  return result
}

const generateAccessToken = (username) => {
  return jwt.sign(username, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1800s' });
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  
  const token = authHeader && authHeader.split(' ')[1]
  
  if (token == null) return res.sendStatus(401) // when there's an invalid token

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) console.error(err)
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

const startServer = async () => {
  await connectDB()
  dbClient = getDBClient()
  session = getClient().startSession()
  app.use(cors())
  app.use(bodyParser.json(bodyParserOptions))
  app.get('/', (req, res) => res.json({ msg: 'Welcome to the memory API!' }))
  app.post('/signup', async (req, res) => {
    let data
    data = await registerUser(req.body)
    res.json({ msg: 'posted', userId: data.insertedId })
  })
  app.post('/login', async (req, res) => {
    let data
    let result = { msg: 'notLoggedIn', token: null }
    data = await loginUser(req.body)
    if (data) {
      const token = generateAccessToken({ username: data.userName })
      result = { msg: 'loggedIn', token: token }
    }
    res.json(result)
  })
  app.get('/me', authenticateToken, (req, res) => res.json({ msg: 'This is a protected route' }))

  app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`))
}
  
startServer()
