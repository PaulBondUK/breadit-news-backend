const database = require("../db/connection");
const { commentCountToNumber } = require("../db/utils/utils.js");
const { emptyArrayIfAuthorExists } = require("./users-models");
const { emptyArrayIfTopicExists } = require("./topics-models");

exports.selectArticles = (sortBy, order, author, topic) => {
  return database("articles")
    .select("articles.*")
    .orderBy(sortBy || "created_at", order || "desc")
    .leftJoin("comments", "articles.article_id", "comments.article_id")
    .groupBy("articles.article_id")
    .count({ comment_count: "comment_id" })
    .modify(currentQuery => {
      // if author query is passed, this filters by author
      if (author) {
        currentQuery.where("articles.author", author);
      }
      // if topic query is passed, this filters by topic
      if (topic) {
        currentQuery.where("articles.topic", topic);
      }
    })
    .then(articles => {
      // if empty array and author query is passed, checks if author is valid
      if (articles.length === 0 && author) {
        return emptyArrayIfAuthorExists(author);
      } else if (articles.length === 0 && !topic) {
        return Promise.reject({
          msg: "No articles found",
          status: 404
        });
      } else return articles;
    })
    .then(articles => {
      // if empty array and topic query is passed, checks if topic is valid
      if (articles.length === 0 && topic) {
        return emptyArrayIfTopicExists(topic);
      } else if (articles.length === 0 && !author) {
        return Promise.reject({
          msg: "No articles found",
          status: 404
        });
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
      // if article returned is blank, sends an error
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
