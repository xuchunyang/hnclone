const express = require("express");
const debug = require("debug")("hn");
const morgan = require("morgan");

const app = express();

app.set("view engine", "pug");
app.set("x-powered-by", false);

app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.render("index");
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
