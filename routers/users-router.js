const usersRouter = require("express").Router();
const { getUserById } = require("../controllers/users-controllers");

// api/users/:username
usersRouter.route("/:username").get(getUserById);

module.exports = usersRouter;
