process.env.NODE_ENV = "test";
const chai = require("chai");
const expect = chai.expect;
chai.should();
chai.use(require("sams-chai-sorted"));
chai.use(require("chai-things"));
const request = require("supertest");
const server = require("../app");
const database = require("../db/connection.js");

describe("/api", () => {
  beforeEach(() => database.seed.run());
  after(() => database.destroy());
  describe("/topics", () => {
    it("GET:200 / responds status 200 and an array of topic objects", () => {
      return request(server)
        .get("/api/topics")
        .expect(200)
        .then(res => {
          expect(res.body.topics).to.be.an("array");
          expect(res.body.topics[0]).to.contain.keys("slug", "description");
        });
    });
  });
  describe("/users", () => {
    it("GET:200 /:username responds status 200 and a user object when given a valid username that exists", () => {
      return request(server)
        .get("/api/users/butter_bridge")
        .expect(200)
        .then(res => {
          expect(res.body.user).to.contain.keys(
            "username",
            "avatar_url",
            "name"
          );
        });
    });
  });
  describe("/users errors", () => {
    it("GET:404 /:username responds status 404 and an appropriate error message when given a valid username that doesn't exist", () => {
      return request(server)
        .get("/api/users/margarine_bridge")
        .expect(404)
        .then(res => {
          expect(res.body.msg).to.equal("Username not found");
        });
    });
  });
  describe("/articles", () => {
    it("GET:200 /:article_id responds status 200 and an article object when given a valid article_id that exists", () => {
      return request(server)
        .get("/api/articles/1")
        .expect(200)
        .then(res => {
          expect(res.body.article).to.contain.keys(
            "author",
            "title",
            "article_id",
            "body",
            "topic",
            "created_at",
            "votes"
          );
        });
    });
    it("PATCH:201 /:article_id responds status 201 and ", () => {});
  });
  describe("/articles errors", () => {
    it("GET:404 /:article_id responds status 404 and an appropriate error message when given a valid article_id that doesn't exist", () => {
      return request(server)
        .get("/api/articles/999999999")
        .expect(404)
        .then(res => {
          expect(res.body.msg).to.equal("Article not found");
        });
    });
    it("GET:400 /:article_id responds status 400 and an appropriate error message when given an article_id integer outside of the range", () => {
      return request(server)
        .get("/api/articles/9999999999")
        .expect(400)
        .then(res => {
          expect(res.body.msg).to.equal("Invalid ID - number out of range");
        });
    });
    it("GET:400 /:article_id responds status 400 and an appropriate error message when given an invalid article_id", () => {
      return request(server)
        .get("/api/articles/hello")
        .expect(400)
        .then(res => {
          expect(res.body.msg).to.equal("Invalid ID - should be a number");
        });
    });
  });
});
