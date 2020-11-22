require("dotenv").config();
const express = require("express");
const debug = require("debug")("hn");
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const user = require("./user.js");
const Post = require("./post.js");
const Comment = require("./comment.js");
const util = require("./util.js");
const fs = require("fs");

const loadData = () => {
  const dbfile = "data.json";
  if (!fs.existsSync(dbfile)) {
    debug(`${dbfile} does not exist, will create on exit`);
    return;
  }
  const data = JSON.parse(fs.readFileSync(dbfile, "utf8"));
  let { users, posts, comments } = data;
  if (users !== undefined) {
    user.users.push(...users);
  }
  if (posts !== undefined) {
    posts = posts.map((post) => {
      post.createdAt = new Date(post.createdAt);
      return post;
    });
    Post.posts.push(...posts);
  }
  if (comments !== undefined) {
    comments = comments.map((comment) => {
      comment.createdAt = new Date(comment.createdAt);
      return comment;
    });
    Comment.comments.push(...comments);
  }
  debug("Data loaded: %O", data);
};

const saveData = () => {
  const dbfile = "data.json";
  const data = {
    users: user.users,
    posts: Post.posts,
    comments: Comment.comments,
  };
  debug("Write data: %O", data);
  fs.writeFileSync(dbfile, JSON.stringify(data, null, 2), "utf8");
  debug("Wrote data to %s", dbfile);
};

loadData();
const app = express();

app.set("view engine", "pug");
app.set("x-powered-by", false);
app.set("trust proxy", 1);

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    secret: process.env.COOKIE_SECRET || util.generatePassword(),
    sameSite: true,
    secure: true,
  })
);

app.locals.sitename = "HN 临摹项目";
app.locals.siteBuiltDate = new Date();
app.locals.datefns = require("date-fns");

// https://stackoverflow.com/questions/47626768/globally-set-dynamic-pug-variables
app.use((req, res, next) => {
  res.locals.session = req.session;
  // res.locals.goto = req.url;
  next();
});

app.get("/", (req, res) => {
  const username = req.session.username;
  if (username) {
    debug(`这是已登陆用户 ${username} 发送的请求`);
  }
  res.render("index", { username, posts: Post.posts });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/submit", (req, res) => {
  if (!req.session.username) {
    res.render("login", { errMessage: "You have to be logged in to submit." });
    return;
  }
  res.render("submit");
});

app.get("/post", (req, res) => {
  let { id } = req.query;
  if (!id) {
    res.status(400).send("Missing post id");
    return;
  }
  id = parseInt(id);
  const post = Post.posts.find((post) => post.id === id);
  if (!post) {
    res.status(400).send(`No such post id: ${id}`);
    return;
  }
  const comments = Comment.comments.filter((comment) => comment.postId == id);
  res.render("post", { post, comments });
});

// TODO /signup /login /logout /submit /vote 实现 ?goto=/

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!(username && password)) {
    res.render("login", { errMessage: "无法注册，缺少 username/password" });
    return;
  }
  const errMessage = await user.signup(username, password);
  if (errMessage) {
    res.render("login", { errMessage });
    return;
  }
  debug("注册成功");
  req.session = { username };
  res.redirect("/");
  debug("users after signup: %o", user.users);
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!(username && password)) {
    res.render("login", { errMessage: "无法登陆，缺少 username/password" });
    return;
  }
  const errMessage = await user.login(username, password);
  if (errMessage) {
    res.render("login", { errMessage });
    return;
  }
  debug("登陆成功");
  req.session = { username };
  res.redirect("/");
});

app.get("/logout", async (req, res) => {
  req.session = null;
  res.redirect("/");
});

app.post("/submit", (req, res) => {
  const username = req.session.username;
  if (!username) {
    res.render("login", { errMessage: "You have to be logged in to submit." });
    return;
  }
  const { title, url } = req.body;
  const errMessage = Post.create({ username, title, url });
  if (errMessage) {
    res.status(400).send(errMessage);
    return;
  }
  res.redirect("/");
});

app.post("/comment", (req, res) => {
  const username = req.session.username;
  if (!username) {
    res.render("login", { errMessage: "You have to be logged in to comment." });
    return;
  }
  const { postId, content } = req.body;
  const errMessage = Comment.createComment({ username, postId, content });
  if (errMessage) {
    res.status(400).send(errMessage);
    return;
  }
  res.redirect("/post?id=" + postId);
});

app.get("/vote", (req, res) => {
  const username = req.session.username;
  if (!username) {
    res.render("login", { errMessage: "You have to be logged in to vote." });
    return;
  }
  const id = req.query.id;
  if (!id) {
    res.status(400).send("Missing id");
    return;
  }
  const errMessage = Post.vote({ username, id });
  if (errMessage) {
    res.status(400).send(errMessage);
    return;
  }
  res.redirect("/");
});

app.get("/db", (req, res) => {
  const data = {
    users: user.users,
    posts: Post.posts,
    comments: Comment.comments,
  };
  res.json(data);
});

const server = app.listen(
  process.env.PORT || 3000,
  process.env.HOST || "localhost",
  () => {
    const { address, port } = server.address();
    console.log(`Listening at http://${address}:${port}/`);
  }
);

process.on("SIGTERM", () => {
  debug("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    debug("HTTP server closed");
    saveData();
  });
});
