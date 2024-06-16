const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')


const initialBlogs = [
    {
    title: 'BlogTitle1',
    author: 'BlogAuthor1',
    url: 'BlogURL1',
    likes: 5
    },
    {
    title: 'BlogTitle2',
    author: 'BlogAuthor2',
    url: 'BlogURL2',
    likes: 8
    },
  ]
  
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are two blogs', async () => {
    const response = await api.get('/api/blogs')
  
    assert.strictEqual(response.body.length, initialBlogs.length)
  })
  
  test('the first blog is BlogTitle1', async () => {
    const response = await api.get('/api/blogs')
    assert(response.body.some(blog => blog.title === 'BlogTitle1'))
  })

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'testAuthor',
      url: 'testURL',
      likes: 12
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length + 1) // blogien maara kasvaa yhdella
  })
  
  test('blog without title is not added', async () => {
    const newBlog = {
      author: 'notitleAuthor',
      url: 'notitleURL',
      likes: 12
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  
    const response = await api.get('/api/blogs')
  
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('blog without url is not added', async () => {
    const newBlog = {
      title: 'noUrlTitle',
      author: 'noUrlAuthor',
      likes: 12
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  
    const response = await api.get('/api/blogs')
  
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()
  
    const blogToView = blogsAtStart[0]
  
    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    assert.deepStrictEqual(resultBlog.body, blogToView)
  })

  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
  
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    const contents = blogsAtEnd.map(r => r.title)
    assert(!contents.includes(blogToDelete.title))
  
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
  })

  test('blogs have id field instead of _id', async () => {
    const response = await api.get('/api/blogs')
    const blogs = response.body
  
    blogs.forEach(blog => {
      assert(blog.id)
      assert(!blog._id)
    })
  })
  
  test('blog with no set likes is set to zero likes', async () => {
    const newBlog = {
      title: 'nolikesTITLE',
      author: 'nolikesAUTHOR',
      url: 'nolikesURL',
      }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const response = await api.get('/api/blogs')
    const addedBlog = response.body.find(blog => blog.title === 'nolikesTITLE')

    assert.strictEqual(addedBlog.likes || 0, 0)
    assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
  })

  test('updating blog likes', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
  
    const updatedBlog = { ...blogToUpdate, likes: blogToUpdate.likes + 1 }
  
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)
  
    const response = await api.get(`/api/blogs/${blogToUpdate.id}`)
    assert.strictEqual(response.body.likes, blogToUpdate.likes + 1)
  })

  after(async () => {
    await User.deleteMany({})
    await mongoose.connection.close()
  })