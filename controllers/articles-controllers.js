const {
  selectArticles,
  selectArticleById,
  updateArticleById
} = require("../models/articles-models");
const { checkIfTopicExists } = require("../models/topics-models");
const { checkIfAuthorExists } = require("../models/users-models");

exports.getArticles = (req, res, next) => {
  selectArticles(
    req.query.sort_by,
    req.query.order,
    req.query.author,
    req.query.topic
  )
    .then(articles => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  selectArticleById(req.params.article_id)
    .then(article => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.patchArticleById = (req, res, next) => {
  updateArticleById(req.params.article_id, req.body.inc_votes)
    .then(article => {
      res.status(200).send({ article });
    })
    .catch(next);
};
