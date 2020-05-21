const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 4000

const { connectDB, getDBClient, getClient } = require('../src/dbClient')

require('dotenv').config()

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
      result = { msg: 'notLoggedIn', token: data._id.toString() }
    }
    res.json(result)
  })
  app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`))
}
  
startServer()