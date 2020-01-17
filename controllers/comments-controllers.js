const {
  insertCommentByArticleId,
  selectCommentsByArticleId,
  updateCommentById,
  deleteCommentById
} = require("../models/comments-models");

exports.getCommentsByArticleId = (req, res, next) => {
  selectCommentsByArticleId(
    req.params.article_id,
    req.query.sort_by,
    req.query.order
  )
    .then(comments => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  insertCommentByArticleId(
    req.params.article_id,
    req.body.username,
    req.body.body
  )
    .then(postedComment => {
      res.status(201).send({ comment: postedComment });
    })
    .catch(next);
};

exports.patchCommentById = (req, res, next) => {
  updateCommentById(req.params.comment_id, req.body.inc_votes)
    .then(comment => {
      res.status(200).send({ comment });
    })
    .catch(next);
};

exports.removeCommentById = (req, res, next) => {
  deleteCommentById(req.params.comment_id)
    .then(() => res.sendStatus(204))
    .catch(next);
};
