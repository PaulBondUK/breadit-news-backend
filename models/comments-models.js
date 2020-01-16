const database = require("../db/connection");
const {
  checkIfArticleExists,
  selectArticleById
} = require("./articles-models.js");

exports.selectCommentsByArticleId = (articleId, sortBy, order) => {
  // errors if order string exists but is not asc or desc
  if (order && order !== "asc" && order !== "desc") {
    return Promise.reject({
      msg: "Bad Request",
      status: 400
    });
  } else {
    return database("comments")
      .select("comment_id", "author", "votes", "created_at", "body")
      .where("article_id", articleId)
      .orderBy(sortBy || "created_at", order || "desc")
      .then(comments => {
        // if comments array is empty, checks to see if the article-id exists in the database
        if (comments.length === 0) {
          return checkIfArticleExists(articleId);
        } else return comments;
      });
  }
};

exports.insertCommentByArticleId = (articleId, author, body) => {
  return database("comments")
    .insert({ author, article_id: articleId, body })
    .returning("*")
    .then(([postedComment]) => {
      if (!postedComment) {
        // if article returned is blank, sends an error
        return Promise.reject({
          msg: "Article not found",
          status: 404
        });
      } else return postedComment;
    });
};
