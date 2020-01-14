const express = require("express");
const app = express();

const apiRouter = require("./routers/api-router");

app.use("/api/", apiRouter);

// error handler
app.use((err, req, res, next) => {
  console.log("INSIDE ERROR HANDLER", err);
  res.status(err.status).send({ msg: err.msg });
});

// psql errors

// custom errors

module.exports = app;
