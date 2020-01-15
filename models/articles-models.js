const database = require("../db/connection");

exports.selectArticleById = article_id => {
  return database("articles")
    .select("articles.*")
    .where("articles.article_id", article_id)
    .leftJoin("comments", "articles.article_id", "comments.article_id")
    .groupBy("articles.article_id")
    .count({ comment_count: "comment_id" })
    .then(([article]) => {
      // if article returned is blank, sends an error
      if (!article) {
        return Promise.reject({
          msg: "Article not found",
          status: 404
        });
      } else {
        // spreads article to an object, changes comment_count to a string
        return { ...article, comment_count: +article.comment_count };
      }
    });
};

exports.updateArticleById = (articleId, voteIncrement) => {
  return database("articles")
    .where("article_id", articleId)
    .increment({ votes: voteIncrement })
    .returning("*")
    .then(([article]) => {
      if (!article) {
        // if article returned is blank, sends an error
        return Promise.reject({
          msg: "Article not found",
          status: 404
        });
      } else return article;
    });
};

// exports.selectArticleById = (article_id, article_name) => {
//     .modify(currentQuery => {
//       if (article_name) {
//         currentQuery.where("articles.article_id", article_id);
//       }
//     })
//     .then(([article]) => {
//       return article;
//     });
// };
