const bcrypt = require('bcrypt')

const saltRounds = 10

module.exports = {
  generatePassword: async (password) => {
    try {
      return await bcrypt.hash(password, saltRounds)
    } catch (err) {
      console.error(err)
      return err
    }
  },
  checkPassword: async (candidatePassword, existingHashedPassword) => {
    try {
      return await bcrypt.compare(candidatePassword, existingHashedPassword)
    } catch (err) {
      console.error(err)
      return err
    }
  }
}
