const commentsRouter = require("express").Router();
const {
  patchCommentById,
  deleteCommentById,
  removeCommentById
} = require("../controllers/comments-controllers");
const { send405Error } = require("../errors");

// api/comments/:comment_id
commentsRouter
  .route("/:comment_id")
  .patch(patchCommentById)
  .delete(removeCommentById)
  .all(send405Error);

module.exports = commentsRouter;
