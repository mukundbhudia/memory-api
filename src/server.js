const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 4000

const { connectDB, getDBClient, getClient, disconnectDB } = require('../src/dbClient')

require('dotenv').config()

const bodyParserOptions = {
  inflate: true,
}

const registerUser = async (user) => {
  let result
  await connectDB()
  const dbClient = getDBClient()
  const session = getClient().startSession()
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
  await session.endSession()
  await disconnectDB()
  return result
}

const loginUser = async (user) => {
  let result
  await connectDB()
  const dbClient = getDBClient()
  const session = getClient().startSession()
  await session.withTransaction(async () => {
    result = await dbClient.collection('users').findOne({userName: user.userName, password: user.password})
  })
  await session.endSession()
  await disconnectDB()
  return result
}

const startServer = async () => {
  await connectDB()
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
      result = { msg: 'notLoggedIn', token: data._id.toString() }
    }
    res.json(result)
  })
  app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`))
}
  
startServer()