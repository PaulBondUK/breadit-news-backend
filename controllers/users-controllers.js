const { selectUserById } = require("../models/users-models");

exports.getUserById = (req, res, next) => {
  selectUserById(req.params.username)
    .then(([user]) => {
      res.status(200).send({ user });
    })
    .catch(next);
};