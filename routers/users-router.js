const usersRouter = require("express").Router();
const { getUserById } = require("../controllers/users-controllers");
const { send405Error } = require("../errors");

// api/users/:username
usersRouter
  .route("/:username")
  .get(getUserById)
  .all(send405Error);

module.exports = usersRouter;
