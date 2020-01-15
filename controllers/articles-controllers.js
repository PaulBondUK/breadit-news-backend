const {
  selectArticleById,
  updateArticleById
} = require("../models/articles-models");

exports.getArticleById = (req, res, next) => {
  selectArticleById(req.params.article_id)
    .then(article => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.patchArticleById = (req, res, next) => {
  updateArticleById(req.params.article_id, req.body.inc_votes)
    .then(patchedArticle => {
      res.status(200).send({ article: patchedArticle });
    })
    .catch(next);
};

// delete = res.sendStatus(204)

// join / inner join > gets all items that are in both the primary and secondary tables
// left join > gets all items from primary table even if they have no entry in the secondary table
// right join > gets all items from secondary table even if they don't have a reference in the primary table
