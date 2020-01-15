const { insertCommentByArticleId } = require("../models/comments-models");

exports.postComment = (req, res, next) => {
  insertCommentByArticleId(req.params.article_id, req.body)
    .then(postedComment => {
      res.status(201).send({ comment: postedComment });
    })
    .catch(next);
};
