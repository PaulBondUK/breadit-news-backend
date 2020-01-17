exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status) res.status(err.status).send({ msg: err.msg });
  else next(err);
};

exports.handlePsqlErrors = (err, req, res, next) => {
  const psqlErrors = {
    22003: [400, "Bad Request - number out of range"], // error: value is out of range for type integer
    "22P02": [400, "Bad Request"], // error: invalid input syntax for type integer
    23502: [400, "Bad Request"], // Failing row contains (****)
    23503: [404, "Article not found"], //  detail: 'Key (article_id)=(999999999) is not present in table "articles".',
    42703: [400, "Bad Request"] // error: column "hello" does not exist
  };
  if (psqlErrors[err.code]) {
    res.status(psqlErrors[err.code][0]).send({ msg: psqlErrors[err.code][1] });
  } else next(err);
};

exports.handleServerErrors = (err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
};

exports.send405Error = (req, res, next) => {
  res.status(405).send({ msg: "Method not allowed" });
};
