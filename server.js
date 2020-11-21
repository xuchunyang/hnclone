const express = require("express");
const debug = require("debug")("hn");
const morgan = require("morgan");
const user = require("./user.js");

const app = express();

app.set("view engine", "pug");
app.set("x-powered-by", false);

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/signup", async (req, res) => {
  const {username, password} = req.body;
  if (!(username && password)) {
    res.status(400).send("无法注册，缺少 username/password");
    return;
  }
  const errorMsg = await user.signup(username, password);
  if (errorMsg) {
    res.status(400).send(errorMsg);
    return;
  }
  debug("注册成功");
  res.redirect("/");
});

app.post("/login", async (req, res) => {
  const {username, password} = req.body;
  if (!(username && password)) {
    res.status(400).send("无法登陆，缺少 username/password");
    return;
  }
  const errorMsg = await user.login(username, password);
  if (errorMsg) {
    res.status(400).send(errorMsg);
    return;
  }
  debug("登陆成功");
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
