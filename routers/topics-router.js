const topicsRouter = require("express").Router();
const { getTopics } = require("../controllers/topics-controllers");
const { send405Error } = require("../errors");

// api/topics
topicsRouter
  .route("/")
  .get(getTopics)
  .all(send405Error);

module.exports = topicsRouter;
