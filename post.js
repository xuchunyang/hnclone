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

const vote = (option) => {
  const {username, id} = option;
  if (!(username && id)) {
    return "Can't vote, missing argument";
  }
  const post = posts.find(post => post.id == id);
  if (!post) {
    return "No such post with id: " + id;
  }
  post.voters.push(username);
}

module.exports = { create, posts, vote };
