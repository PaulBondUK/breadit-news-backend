const database = require("../db/connection");

exports.selectTopics = () => {
  return database
    .select("*")
    .from("topics")
    .then(topics => {
      if (topics.length === 0) {
        return Promise.reject({
          msg: "No articles found",
          status: 404
        });
      } else return topics;
    });
};

exports.emptyArrayIfTopicExists = topic => {
  return database
    .select("*")
    .from("topics")
    .where("slug", topic)
    .then(topics => {
      if (topics.length === 0) {
        return Promise.reject({
          msg: "Topic not found",
          status: 404
        });
      } else return [];
    });
};
