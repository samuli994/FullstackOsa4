const dummy = (blogs) => {
    return 1
  }
  
  const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
  }

  const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
      return null
    }
  
    return blogs.reduce((favorite, blog) => {
      return (favorite.likes > blog.likes) ? favorite : blog;
    })
  }

  const mostBlogs = (blogs) => {
    if (blogs.length === 0) {
        return null
      }
      const authorCounts = blogs.reduce((counts, blog) => {
        counts[blog.author] = (counts[blog.author] || 0) + 1
        return counts
      }, {})
      const mostProlificAuthor = Object.keys(authorCounts).reduce((most, author) => {
        return (authorCounts[author] > authorCounts[most]) ? author : most
      })
      return {
        author: mostProlificAuthor,
        blogs: authorCounts[mostProlificAuthor]
      }
    }

    const mostLikes = (blogs) => {
        if (blogs.length === 0) {
          return null
        }
      
        const authorLikes = blogs.reduce((likes, blog) => {
          likes[blog.author] = (likes[blog.author] || 0) + blog.likes
          return likes
        }, {})
      
        const mostLikedAuthor = Object.keys(authorLikes).reduce((most, author) => {
          return (authorLikes[author] > authorLikes[most]) ? author : most
        })
      
        return {
          author: mostLikedAuthor,
          likes: authorLikes[mostLikedAuthor]
        }
      }

  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}