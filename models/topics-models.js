const database = require("../db/connection");

exports.selectTopics = () => {
  return database.select("*").from("topics");
};
