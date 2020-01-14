const database = require("../db/connection");

exports.selectArticleById = article_id => {
  return database("articles")
    .select("*")
    .where("article_id", article_id)
    .then(article => {
      if (article.length === 0) {
        return Promise.reject({
          msg: "Article not found",
          status: 404
        });
      } else return article;
    });
};

// exports.selectArticleById = article_id => {
//   return database("articles")
//     .select("*")
//     .where("article_id", article_id)
//     .count({ comment_count: "comment_id" })
//     .leftJoin("comments", "articles.article_id", "comments.article_id")
//     .groupBy("articles.article_id");
// };

// groupby + count, getArticleById

// exports.getDirectors = () => {
//   return connection
//     .select("directors.*")
//     .from("directors")
//     .count({ film_count: "film_id" })
//     .leftJoin("films", "directors.director_id", "films.director_id")
//     .groupBy("directors.director_id");
// };
