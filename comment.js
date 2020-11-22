const comments = [];

const createComment = (option) => {
  const { username, postId, content } = option;
  if (!(username && postId && content)) {
    return "Can't create comment, missing argument";
  }
  const createdAt = new Date();
  comments.push({
    username,
    postId,
    content,
    createdAt,
  });
};

module.exports = { comments, createComment };
