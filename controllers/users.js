const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')


usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (password.length < 3) {
    return response.status(400).json({ error: 'Password is too short (minimum length is 3 characters)' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
  try {
    const users = await User.find({})
    const usersWithBlogs = await Promise.all(users.map(async (user) => {
      const blogs = await Blog.find({ user: user._id })
      return {
        username: user.username,
        name: user.name,
        id: user._id,
        blogs: blogs
      }
    }))
    response.json(usersWithBlogs)
  } catch (error) {
    response.status(500).json({ error: 'Something went wrong' })
  }
})

module.exports = usersRouter