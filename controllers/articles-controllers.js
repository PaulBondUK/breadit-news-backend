const {
  selectArticles,
  selectArticleById,
  updateArticleById,
  countArticles
} = require("../models/articles-models");
const { checkIfTopicExists } = require("../models/topics-models");
const { checkIfAuthorExists } = require("../models/users-models");

exports.getArticles = (req, res, next) => {
  const { sort_by, order, author, topic, limit, p } = req.query;
  const articles = selectArticles(sort_by, order, author, topic, limit, p);
  const total_count = countArticles(author, topic);
  Promise.all([articles, total_count])
    .then(([articles, total_count]) => {
      res.status(200).send({ articles, total_count });
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
