const posts = [];

const create = (option) => {
  const { url, title, username } = option;
  if (!(url && title && username)) {
    return "Can't create post, missing argument";
  }
  const createdAt = new Date();
  const id = posts.length;
  posts.push({
    url,
    title,
    username,
    createdAt,
    id,
  });
};

module.exports = { create, posts };
