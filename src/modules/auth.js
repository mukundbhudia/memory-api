const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const saltRounds = 10

const generatePassword = async (password) => {
  try {
    return await bcrypt.hash(password, saltRounds)
  } catch (err) {
    console.error(err)
    return err
  }
}

const checkPassword = async (candidatePassword, existingHashedPassword) => {
  try {
    return await bcrypt.compare(candidatePassword, existingHashedPassword)
  } catch (err) {
    console.error(err)
    return err
  }
}

const generateAccessToken = (username) => {
  return jwt.sign(username, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1800s' })
}

const verifyAccessToken = (tokenToVerify) => {
  let result = null
  
  jwt.verify(tokenToVerify, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
    if (err) {
      console.error(err)
    } else {
      result = decodedToken
    }
  })
  return result
}

module.exports = {
  generatePassword,
  checkPassword,
  generateAccessToken,
  verifyAccessToken,
}
