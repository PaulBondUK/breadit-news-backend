const database = require("../db/connection");
const { commentCountToNumber } = require("../db/utils/utils.js");
const { emptyArrayIfAuthorExists } = require("./users-models");
const { emptyArrayIfTopicExists } = require("./topics-models");

exports.selectArticles = (sortBy, order, author, topic, limit = 10, page) => {
  return database("articles")
    .select("articles.*")
    .limit(limit)
    .offset(page ? (page - 1) * limit : 0)
    .orderBy(sortBy || "created_at", order || "desc")
    .leftJoin("comments", "articles.article_id", "comments.article_id")
    .groupBy("articles.article_id")
    .count({ comment_count: "comment_id" })
    .modify(currentQuery => {
      if (author) {
        currentQuery.where("articles.author", author);
      }
      if (topic) {
        currentQuery.where("articles.topic", topic);
      }
    })
    .then(articles => {
      if (articles.length === 0 && author) {
        return emptyArrayIfAuthorExists(author);
      } else return articles;
    })
    .then(articles => {
      if (articles.length === 0 && topic) {
        return emptyArrayIfTopicExists(topic);
      } else return commentCountToNumber(articles);
    });
};

exports.selectArticleById = articleId => {
  return database("articles")
    .select("articles.*")
    .where("articles.article_id", articleId)
    .leftJoin("comments", "articles.article_id", "comments.article_id")
    .groupBy("articles.article_id")
    .count({ comment_count: "comment_id" })
    .then(([article]) => {
      if (!article) {
        return Promise.reject({
          msg: "Article not found",
          status: 404
        });
      } else {
        return commentCountToNumber(article);
      }
    });
};

exports.checkIfArticleExists = articleId => {
  return database("articles")
    .select("*")
    .where("article_id", articleId)
    .then(([article]) => {
      if (!article) {
        return Promise.reject({
          msg: "Article not found",
          status: 404
        });
      } else return [];
    });
};

exports.updateArticleById = (articleId, voteIncrement) => {
  return database("articles")
    .where("article_id", articleId)
    .increment({ votes: voteIncrement || 0 })
    .returning("*")
    .then(([article]) => {
      if (!article) {
        return Promise.reject({
          msg: "Article not found",
          status: 404
        });
      } else return article;
    });
};

// function checkIfArticlesPageExists(limit, page) {
//   const numberOfArticlesNeeded = limit * (page - 1);
//   return database("articles").select("*").then(articles => {
//     if (articles.length > numberOfArticlesNeeded)
//   });
// }
