const express = require("express");
const app = express();
const apiRouter = require("./routers/api-router");

app.use(express.json());

app.use("/api/", apiRouter);

// psql error handler
app.use((err, req, res, next) => {
  // console.log("INSIDE ERROR HANDLER", err);
  // console.log(err);
  const psqlErrors = {
    22003: "Bad Request - number out of range",
    "22P02": "Bad Request"
  };
  if (err.code) {
    res.status(400).send({ msg: psqlErrors[err.code] });
  } else {
    next(err);
  }
});

// custom errors
app.use((err, req, res, next) => {
  res.status(err.status).send({ msg: err.msg });
});

// psql errors

// custom errors

module.exports = app;
