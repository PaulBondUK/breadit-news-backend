const database = require("../db/connection");

exports.selectUserById = username => {
  return database
    .select("*")
    .from("users")
    .where("username", username)
    .then(user => {
      if (user.length === 0) {
        return Promise.reject({
          msg: "Username not found",
          status: 404
        });
      } else return user;
    });
};

exports.emptyArrayIfAuthorExists = username => {
  return database
    .select("*")
    .from("users")
    .where("username", username)
    .then(([username]) => {
      if (!username) {
        return Promise.reject({
          msg: "Author not found",
          status: 404
        });
      } else return [];
    });
};

exports.checkIfAuthorExists = author => {
  if (!author) return true;
  return database
    .select("*")
    .from("users")
    .where("username", author)
    .then(author => {
      if (author.length === 0) {
        return Promise.reject({
          msg: "Author not found",
          status: 404
        });
      } else return author;
    });
};
