const bcrypt = require("bcrypt");
const saltRounds = 10;

const users = [];

const signup = async (username, password) => {
  if (users.findIndex((user) => user.username === username) !== -1) {
    return `用户名 ${username} 已被占用，请换一个！`;
  }
  const passwordHash = await bcrypt.hash(password, saltRounds);
  users.push({
    username,
    passwordHash,
  });
};

const login = async (username, password) => {
  const user = users.find((user) => user.username === username);
  if (!user) return `不存在的用户名 ${username}`;
  if (!(await bcrypt.compare(password, user.passwordHash))) {
    return `用户名 (${username}) 或密码 (${password}) 错误`;
  }
};

module.exports = { signup, login };
