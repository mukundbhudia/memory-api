const auth = require('./auth')
const { 
  connectDB,
  getDBClient,
  getClient,
  disconnectDB,
} = require('./dbClient')

let session
let dbClient  // TODO Move DB operations later

const registerUser = async (user) => {
  await connectDB()
  dbClient = getDBClient()
  session = getClient().startSession()

  let result = { msg: '', registered: false, userData: null, token: null }
  await session.withTransaction(async () => {
    let existingUsers = []
    const cursor = await dbClient.collection('users').find({userName: user.userName})
    existingUsers = await cursor.toArray()
    if (existingUsers.length > 0) {
      result.msg = 'userAlreadyExists'
    } else {
      user.password = await auth.generatePassword(user.password)
      result.msg = 'userRegistered'
      result.registered = true
      const insertUser = await dbClient.collection('users').insertOne(user)
      result.userData = {
        id: insertUser.ops[0]._id.toString(),
        userName: insertUser.ops[0].userName,
        firstName: insertUser.ops[0].firstName,
        lastName: insertUser.ops[0].lastName,
      }
      const regUserToken = auth.generateAccessToken({ username: insertUser.ops[0].userName })
      result.token = regUserToken
    }
  })

  await session.endSession()
  await disconnectDB()
  return result
}
  
const loginUser = async (user) => {
  await connectDB()
  dbClient = getDBClient()
  session = getClient().startSession()

  let result = { loggedIn: false, userData: null }
  await session.withTransaction(async () => {
    result.userData = await dbClient.collection('users').findOne({ userName: user.userName })
    if (result.userData) {
      const isPasswordValid = await auth.checkPassword(user.password, result.userData.password)
      if (isPasswordValid) {
        result.loggedIn = true
      }
    }
  })

  await session.endSession()
  await disconnectDB()
  return result
}

module.exports = {
  registerUser,
  loginUser,
}
