const database = require("../db/connection");
const { checkIfArticleExists } = require("./articles-models.js");

exports.selectCommentsByArticleId = (
  articleId,
  sortBy,
  order,
  limit = 10,
  page = 1
) => {
  if (order && order !== "asc" && order !== "desc") {
    return Promise.reject({
      msg: "Bad Request",
      status: 400
    });
  } else {
    return database("comments")
      .select("comment_id", "author", "votes", "created_at", "body")
      .limit(limit)
      .offset(page > 1 ? (page - 1) * limit : 1)
      .where("article_id", articleId)
      .orderBy(sortBy || "created_at", order || "desc")
      .then(comments => {
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
        return Promise.reject({
          msg: "Article not found",
          status: 404
        });
      } else return postedComment;
    });
};

exports.updateCommentById = (commentId, voteIncrement) => {
  return database("comments")
    .where("comment_id", commentId)
    .increment({ votes: voteIncrement || 0 })
    .returning("*")
    .then(([comment]) => {
      if (!comment) {
        return Promise.reject({
          msg: "Comment not found",
          status: 404
        });
      } else return comment;
    });
};

exports.deleteCommentById = commentId => {
  return database("comments")
    .where("comment_id", commentId)
    .del()
    .returning("*")
    .then(([comment]) => {
      if (!comment) {
        return Promise.reject({
          msg: "Comment not found",
          status: 404
        });
      } else return;
    });
};
