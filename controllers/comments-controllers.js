const {
  insertCommentByArticleId,
  selectCommentsByArticleId
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
