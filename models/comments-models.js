const database = require("../db/connection");

exports.insertCommentByArticleId = (articleId, { username, body }) => {
  return database("comments")
    .insert({ author: username, article_id: articleId, body })
    .returning("*")
    .then(([postedComment]) => {
      return postedComment;
    });
};
