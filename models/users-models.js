const database = require("../db/connection");

exports.selectUserById = username => {
  return database
    .select("*")
    .from("users")
    .where("username", username)
    .then(username => {
      if (username.length === 0) {
        return Promise.reject({
          msg: "Username not found",
          status: 404
        });
      } else return username;
    });
};
