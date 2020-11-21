const express = require("express");
const debug = require("debug")("hn");
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const user = require("./user.js");
const Post = require("./post.js");
const util = require("./util.js");

require("dotenv").config();
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

// TODO /signup /login /logout /submit 实现 ?goto=/

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
  });
});
