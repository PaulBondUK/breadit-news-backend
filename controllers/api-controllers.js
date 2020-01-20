exports.getEndpoints = (req, res, next) => {
  const options = { root: "./" };
  res.sendFile("endpoints.json", options, err => {
    next(err);
  });
};
