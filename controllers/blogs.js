const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { tokenExtractor, userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

blogsRouter.post('/', tokenExtractor, userExtractor, async (request, response) => {
  const body = request.body

  const token = request.token

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)
    
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'Token invalid or missing' })
    }

    const user = await User.findById(decodedToken.id)

    if (!user) {
      return response.status(404).json({ error: 'User not found' })
    }

    const blog = new Blog({
      title: body.title,
      author: body.author || '',
      url: body.url,
      likes: body.likes !== undefined ? body.likes : 0,
      user: user._id
    })

    const savedBlog = await blog.save()
    
    if (user.blogs) {
      user.blogs = user.blogs.concat(savedBlog._id)
    } else {
      user.blogs = [savedBlog._id]
    }

    await user.save()

    response.status(201).json(savedBlog)
  } catch (error) {
    console.error('Token verification error:', error.message)
    return response.status(401).json({ error: 'Token invalid or missing' })
  }
})

blogsRouter.delete('/:id', tokenExtractor, userExtractor, async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const blog = {
    likes: body.likes,
  }
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog)
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter