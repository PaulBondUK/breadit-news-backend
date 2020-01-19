const articlesRouter = require("express").Router();
const {
  getArticles,
  getArticleById,
  patchArticleById
} = require("../controllers/articles-controllers");
const {
  getCommentsByArticleId,
  postComment
} = require("../controllers/comments-controllers");
const { send405Error } = require("../errors");

// /api/articles
articlesRouter
  .route("/")
  .get(getArticles)
  .all(send405Error);

// /api/articles/:article_id
articlesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleById)
  .all(send405Error);

// /api/articles/:article_id/comments
articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postComment)
  .all(send405Error);

module.exports = articlesRouter;
