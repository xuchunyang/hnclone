const Post = require("./post.js");

const comments = [];

const createComment = (option) => {
  const { username, postId, content } = option;
  if (!(username && postId && content)) {
    return "Can't create comment, missing argument";
  }
  const createdAt = new Date();
  for (const post of Post.posts) {
    if (post.username === username) {
      post.comments = (post.comments || 0) + 1;
      break;
    }
  }
  comments.push({
    username,
    postId,
    content,
    createdAt,
  });
};

module.exports = { comments, createComment };
