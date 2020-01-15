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
    describe("GET", () => {
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
  });

  describe("/users", () => {
    describe("GET", () => {
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
    describe("ERRORS", () => {
      it("GET:404 /:username responds status 404 and an appropriate error message when given a valid username that doesn't exist", () => {
        return request(server)
          .get("/api/users/margarine_bridge")
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal("Username not found");
          });
      });
    });
  });

  describe("/articles", () => {
    describe("GET", () => {
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
              "votes",
              "comment_count"
            );
            expect(res.body.article.comment_count).to.equal(13);
          });
      });
    });
    describe("PATCH", () => {
      it("PATCH:200 /:article_id responds status 200 and the updated article object when sent an object with a positive vote increment", () => {
        return request(server)
          .patch("/api/articles/1")
          .send({ inc_votes: 1 })
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
            expect(res.body.article.votes).to.equal(101);
          });
      });
      it("PATCH:200 /:article_id responds status 200 and the updated article object when sent an object with a negative vote increment", () => {
        return request(server)
          .patch("/api/articles/1")
          .send({ inc_votes: -1 })
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
            expect(res.body.article.votes).to.equal(99);
          });
      });
      it("PATCH:200 /:article_id responds status 200 and the updated article object when sent an object containing a valid vote increment and an extra property", () => {
        return request(server)
          .patch("/api/articles/1")
          .send({ animal: "dog", inc_votes: 1 })
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
            expect(res.body.article.votes).to.equal(101);
          });
      });
    });
    describe("ERRORS", () => {
      it("GET:400 /:article_id responds status 400 when given an article_id integer outside of the range", () => {
        return request(server)
          .get("/api/articles/9999999999")
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal("Bad Request - number out of range");
          });
      });
      it("GET:400 /:article_id responds status 400 when given an invalid article_id", () => {
        return request(server)
          .get("/api/articles/hello")
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal("Bad Request");
          });
      });
      it("GET:404 /:article_id responds status 404 when given a valid article_id that doesn't exist", () => {
        return request(server)
          .get("/api/articles/999999999")
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal("Article not found");
          });
      });
      it("PATCH:400 /:article_id responds status 400 when given an invalid vote increment", () => {
        return request(server)
          .patch("/api/articles/1")
          .send({ inc_votes: "hello" })
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal("Bad Request");
          });
      });
      it("PATCH:400 /:article_id responds status 400 when no vote increment is given", () => {
        return request(server)
          .patch("/api/articles/1")
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal("Bad Request");
          });
      });
      it("PATCH:400 /:article_id responds status 400 when given an invalid article_id", () => {
        return request(server)
          .get("/api/articles/hello")
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal("Bad Request");
          });
      });
      it("PATCH:404 /:article_id responds status 404 when given a valid article_id that doesn't exist", () => {
        return request(server)
          .patch("/api/articles/999999999")
          .send({ inc_votes: 1 })
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal("Article not found");
          });
      });
    });
    describe("/:article_id", () => {
      describe("POST", () => {
        it("POST:201 /comments responds status 201 and the posted comment when given an object containing a new comment", () => {
          const newComment = {
            username: "butter_bridge",
            body: "Great article!"
          };
          return request(server)
            .post("/api/articles/1/comments")
            .send(newComment)
            .expect(201)
            .then(res => {
              const returnedComment = res.body.comment;
              expect(returnedComment).to.contain.keys(
                "comment_id",
                "author",
                "article_id",
                "votes",
                "created_at",
                "body"
              );
              expect(returnedComment.author).to.equal(newComment.username);
              expect(returnedComment.body).to.equal(newComment.body);
              expect(returnedComment.votes).to.equal(0);
            });
        });
        it("POST:201 /comments responds status 201 and the posted comment when given an object containing a new comment and an extra property", () => {
          const newComment = {
            username: "butter_bridge",
            body: "Great article!",
            animal: "dog"
          };
          return request(server)
            .post("/api/articles/1/comments")
            .send(newComment)
            .expect(201)
            .then(res => {
              const returnedComment = res.body.comment;
              expect(returnedComment).to.contain.keys(
                "comment_id",
                "author",
                "article_id",
                "votes",
                "created_at",
                "body"
              );
              expect(returnedComment.author).to.equal(newComment.username);
              expect(returnedComment.body).to.equal(newComment.body);
              expect(returnedComment.votes).to.equal(0);
            });
        });
      });
      describe("ERRORS", () => {
        it.only("POST:400 /comments responds status 400 when no comment is given", () => {
          return request(server)
            .post("/api/articles/1/comments")
            .expect(400)
            .then(res => {
              expect(res.body.msg).to.equal("Bad Request");
            });
        });
      });
    });
  });
});

// ## Relevant HTTP Status Codes

// - 200 OK
// - 201 Created
// - 204 No Content
// - 400 Bad Request
// - 404 Not Found
// - 405 Method Not Allowed
// - 418 I'm a teapot
// - 422 Unprocessable Entity
// - 500 Internal Server Error
