const { logger } = require('./logger')
const auth = require('./auth')
const actions = require('./actions')

const authenticateToken = (req, res, next) => {
  const token = req.headers['x-access-token']

  if (!token) {
    // Send 401: Unauthorised when there's a non-existant token
    logger.debug('Auth token not found')
    return res.sendStatus(401)
  } else {
    const decodedToken = auth.verifyAccessToken(token)
    if (decodedToken === null) {
      // Send 403: Forbidden if token is invalid
      logger.debug('Auth token invalid')
      return res.status(403).json({ msg: 'Auth token invalid' })
    } else {
      req.user = decodedToken
      return next()
    }
  }
}

const home = (req, res) => {
  res.json({ msg: 'Welcome to the memory API!' })
}

const signUp = async (req, res) => {
  let data
  data = await actions.registerUser(req.body)
  logger.debug(`User signed up as ${data.userData.userName}`)
  res.json({ 
    msg: data.msg,
    registered:
    data.registered,
    userData: data.userData,
    token: data.token,
  })
}

const logIn = async (req, res) => {
  let data
  let result = { msg: 'notLoggedIn', token: null }
  data = await actions.loginUser(req.body)
  
  if (data && data.loggedIn === true && data.userData) {
    const token = auth.generateAccessToken({ username: data.userData.userName })
    result = {
      msg: 'loggedIn', token: token, user: {
        id: data.userData._id.toString(),
        userName: data.userData.userName,
        firstName: data.userData.firstName,
        lastName: data.userData.lastName,
      }
    }
    logger.info(`User ${data.userData.userName} logged in`)
  } else if (data && data.loggedIn === false) {
    logger.debug(`User with username '${req.body.userName}' not logged in`)
    result.msg = 'userOrPasswordIncorrect'
  }
  res.json(result)
}

const me = (req, res) =>  {
  res.json({ msg: 'This is a protected route' })
}

module.exports = {
  authenticateToken,
  home,
  signUp,
  logIn,
  me,
}
