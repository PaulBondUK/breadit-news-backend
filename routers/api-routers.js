const apiRouter = require("express").Router();
const topicsRouter = require("./topics-router");

apiRouter.use("/topics", topicsRouter);
apiRouter.use("/*");

module.exports = apiRouter;
