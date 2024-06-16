const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'BlogTitle1',
    author: 'BlogAuthor1',
    url: 'BlogURL1',
    likes: 5,
  },
  {
    title: 'BlogTitle2',
    author: 'BlogAuthor2',
    url: 'BlogURL2',
    likes: 8,
  },
]

const nonExistingId = async () => {
    const blog = new Blog({ title: 'willremovethissoon', url: 'willremovethissoon' })
    await blog.save()
    await blog.deleteOne()
  
    return blog._id.toString()
  }
  
  const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
  }

  const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
  }
   
  module.exports = {
    initialBlogs,
    nonExistingId,
    blogsInDb,
    usersInDb,
  }