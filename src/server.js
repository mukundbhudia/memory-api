const express = require('express')
const bodyParser = require('body-parser')
const routes = require('../src/modules/routes')

const cors = require('cors')
require('dotenv').config()
const { logger } = require('./modules/logger')

const app = express()
const PORT = process.env.PORT || 4000

const bodyParserOptions = {
  inflate: true,
}

const startServer = async () => {
  app.use(cors())
  app.use(bodyParser.json(bodyParserOptions))
  app.get('/', routes.home)
  app.post('/auth/signup', routes.signUp)
  app.post('/auth/login', routes.logIn)
  // Any route after the below authenticateToken is protected
  app.use(routes.authenticateToken)
  app.get('/me', routes.me)

  app.listen(PORT, () => {
    const welcomeString = `Listening at http://localhost:${PORT}`
    console.log(welcomeString)
    logger.info(welcomeString)
  })
}
  
startServer()
