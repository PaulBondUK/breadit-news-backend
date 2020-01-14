const topicsRouter = require("express").Router();
const { getTopics } = require("../controllers/topics-controllers");

topicsRouter.route("/").get(getTopics);
// topicsRouter.use("/.", () => {
//   res.status(404).send({ msg: "Not Found" });
// });
// .route.get.delete etc etc

module.exports = topicsRouter;
