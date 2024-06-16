const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    minlength: 3,
    required: true,
  },
  name: String,
  passwordHash: {
    type: String,
    required: true,
  },
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash)
}

module.exports = mongoose.model('User', userSchema)