const express = require("express");
const app = express();
const apiRouter = require("./routers/api-router");

app.use(express.json());

app.use("/api/", apiRouter);

// psql error handler
app.use((err, req, res, next) => {
  // console.log(err);
  const psqlErrors = {
    22003: [400, "Bad Request - number out of range"], // error: value is out of range for type integer
    "22P02": [400, "Bad Request"], // error: invalid input syntax for type integer
    23502: [400, "Bad Request"], // Failing row contains (****)
    23503: [404, "Article not found"], //  detail: 'Key (article_id)=(999999999) is not present in table "articles".',
    42703: [400, "Bad Request"] // error: column "hello" does not exist
  };
  if (err.code) {
    res.status(psqlErrors[err.code][0]).send({ msg: psqlErrors[err.code][1] });
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
