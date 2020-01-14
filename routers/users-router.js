const usersRouter = require("express").Router();
const { getUserById } = require("../controllers/users-controllers");

usersRouter.route("/:username").get(getUserById);

module.exports = usersRouter;
