const { selectArticleById } = require("../models/articles-models");

exports.getArticleById = (req, res, next) => {
  selectArticleById(req.params.article_id)
    .then(([article]) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

// delete = res.sendStatus(204)
