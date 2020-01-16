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
      it("GET:200 / responds with an array of topic objects", () => {
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
      it("GET:200 /:username responds with a user object when given a valid username that exists", () => {
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
      it("GET:404 /:username responds status 404 when given a valid username that doesn't exist", () => {
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
      it("GET:200 / responds with an array of article objects with a comment_count property", () => {
        return request(server)
          .get("/api/articles")
          .expect(200)
          .then(res => {
            expect(res.body.articles).to.all.have.keys(
              "author",
              "title",
              "article_id",
              "body",
              "topic",
              "created_at",
              "votes",
              "comment_count"
            );
            expect(res.body.articles[0].comment_count).to.be.a("number");
          });
      });
      it("GET:200 / responds with an array of article objects sorted descendingly by 'created_by' by default", () => {
        return request(server)
          .get("/api/articles")
          .expect(200)
          .then(res => {
            expect(res.body.articles).to.be.descendingBy("created_at");
          });
      });
      it("GET:200 / responds with an array of article objects sorted descendingly by any column when given any valid column name as a sort_by query", () => {
        const queries = [
          "author",
          "title",
          "article_id",
          "body",
          "topic",
          "created_at",
          "votes",
          "comment_count"
        ];
        const testPromises = queries.map(query => {
          return request(server)
            .get(`/api/articles?sort_by=${query}`)
            .expect(200)
            .then(res => {
              expect(res.body.articles).to.be.descendingBy(query);
            });
        });
        return Promise.all(testPromises);
      });
      it("GET:200 / responds with an array of article objects sorted ascendingly by 'created_by' when given an 'asc' order query", () => {
        return request(server)
          .get("/api/articles?order=asc")
          .expect(200)
          .then(res => {
            expect(res.body.articles).to.be.ascendingBy("created_at");
          });
      });
      it("GET:200 /:article_id responds with an article object with a comment_count property when given a valid article_id that exists in the database", () => {
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
      it("PATCH:200 /:article_id responds with the updated article object when sent an object with a positive vote increment", () => {
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
      it("PATCH:200 /:article_id responds with the updated article object when sent an object with a negative vote increment", () => {
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
      it("PATCH:200 /:article_id responds with the updated article object when sent an object containing a valid vote increment and an extra property", () => {
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
      it("GET:404 /:article_id responds status 404 when given a valid article_id that doesn't exist in the database", () => {
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
      it("PATCH:404 /:article_id responds status 404 when given a valid article_id that doesn't exist in the database", () => {
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
      describe("GET", () => {
        it("GET:200 /comments responds with an array of comment objects", () => {
          return request(server)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(res => {
              const comments = res.body.comments;
              expect(comments).to.be.an("array");
              expect(comments.length).to.equal(13);
              expect(comments).to.all.have.keys(
                "comment_id",
                "author",
                "votes",
                "created_at",
                "body"
              );
            });
        });
        it("GET:200 /comments responds with an empty array of comment objects when given a valid article_id that has no comments", () => {
          return request(server)
            .get("/api/articles/2/comments")
            .expect(200)
            .then(res => {
              const comments = res.body.comments;
              expect(comments).to.be.an("array");
              expect(comments.length).to.equal(0);
            });
        });
        it("GET:200 /comments responds with an array of comment objects sorted descendingly by 'created_by' by default", () => {
          return request(server)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(res => {
              expect(res.body.comments).to.be.descendingBy("created_at");
            });
        });
        it("GET:200 /comments responds with an array of comment objects sorted descendingly by 'created_by' when given a 'desc' order query", () => {
          return request(server)
            .get("/api/articles/1/comments?order=desc")
            .expect(200)
            .then(res => {
              expect(res.body.comments).to.be.descendingBy("created_at");
            });
        });
        it("GET:200 /comments responds with an array of comment objects sorted descendingly by any column when given any valid column name as a sort_by query", () => {
          const queries = [
            "comment_id",
            "author",
            "votes",
            "created_at",
            "body"
          ];
          const testPromises = queries.map(query => {
            return request(server)
              .get(`/api/articles/1/comments?sort_by=${query}`)
              .expect(200)
              .then(res => {
                expect(res.body.comments).to.be.descendingBy(query);
              });
          });
          return Promise.all(testPromises);
        });
        it("GET:200 /comments responds with an array of comment objects sorted ascendingly by 'created_by' when given an 'asc' order query", () => {
          return request(server)
            .get("/api/articles/1/comments?order=asc")
            .expect(200)
            .then(res => {
              expect(res.body.comments).to.be.ascendingBy("created_at");
            });
        });
        it("GET:200 /comments responds with an array of comment objects sorted ascendingly by any column when given any valid column name as a sort_by query and an 'asc' order query", () => {
          const queries = [
            "comment_id",
            "author",
            "votes",
            "created_at",
            "body"
          ];
          const testPromises = queries.map(query => {
            return request(server)
              .get(`/api/articles/1/comments?sort_by=${query}&order=asc`)
              .expect(200)
              .then(res => {
                expect(res.body.comments).to.be.ascendingBy(query);
              });
          });
          return Promise.all(testPromises);
        });
      });
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
        it("GET:400 /comments responds status 400 when given an invalid article_id", () => {
          return request(server)
            .get("/api/articles/hello/comments")
            .expect(400)
            .then(res => {
              expect(res.body.msg).to.equal("Bad Request");
            });
        });
        it("GET:400 /comments responds status 400 when given when given an invalid column name as a 'sort_by' query", () => {
          return request(server)
            .get("/api/articles/1/comments?sort_by=hello")
            .expect(400)
            .then(res => {
              expect(res.body.msg).to.equal("Bad Request");
            });
        });
        it("GET:400 /comments responds status 400 when given when given an invalid 'order' query", () => {
          return request(server)
            .get("/api/articles/1/comments?order=disc")
            .expect(400)
            .then(res => {
              expect(res.body.msg).to.equal("Bad Request");
            });
        });
        it("GET:400 /comments responds status 400 when given when given an invalid column name as a 'sort_by' query and a valid 'order' query", () => {
          return request(server)
            .get("/api/articles/1/comments?sort_by=hello&?order=asc")
            .expect(400)
            .then(res => {
              expect(res.body.msg).to.equal("Bad Request");
            });
        });
        it("GET:400 /comments responds status 400 when given when given a valid 'sort_by' query and an invalid 'order' query", () => {
          return request(server)
            .get("/api/articles/1/comments?sort_by=votes&order=disc")
            .expect(400)
            .then(res => {
              expect(res.body.msg).to.equal("Bad Request");
            });
        });
        it("GET:404 /comments responds status 404 when given an valid article_id that doesn't exist in the database", () => {
          return request(server)
            .get("/api/articles/999999999/comments")
            .expect(404)
            .then(res => {
              expect(res.body.msg).to.equal("Article not found");
            });
        });
        it("POST:400 /comments responds status 400 when no comment object is given", () => {
          return request(server)
            .post("/api/articles/1/comments")
            .expect(400)
            .then(res => {
              expect(res.body.msg).to.equal("Bad Request");
            });
        });
        it("POST:400 /comments responds status 400 when given an invalid comment object", () => {
          const newComment = {
            author: "butter_bridge",
            body: "Great article!"
          };
          return request(server)
            .post("/api/articles/1/comments")
            .send(newComment)
            .expect(400)
            .then(res => {
              expect(res.body.msg).to.equal("Bad Request");
            });
        });
        it("POST:400 /comments responds status 400 when given an invalid article_id", () => {
          const newComment = {
            username: "butter_bridge",
            body: "Great article!"
          };
          return request(server)
            .post("/api/articles/hello/comments")
            .send(newComment)
            .expect(400)
            .then(res => {
              expect(res.body.msg).to.equal("Bad Request");
            });
        });
        it("POST:404 /comments responds status 404 when given a valid article_id that doesn't exist in the database", () => {
          const newComment = {
            username: "butter_bridge",
            body: "Great article!"
          };
          return request(server)
            .post("/api/articles/999999999/comments")
            .send(newComment)
            .expect(404)
            .then(res => {
              expect(res.body.msg).to.equal("Article not found");
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
