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
  describe("INVALID METHODS", () => {
    it("STATUS:405 /:id responds status 405 when an invalid method is used", () => {
      const invalidMethods = ["get", "put", "post", "patch", "delete"];
      const methodPromises = invalidMethods.map(method => {
        return request(server)
          [method]("/api")
          .expect(405)
          .then(res => {
            expect(res.body.msg).to.equal("Method not allowed");
          });
      });
      return Promise.all(methodPromises);
    });
  });

  describe("/topics", () => {
    describe("GET", () => {
      it("GET:200 / responds with an array of topic objects", () => {
        return request(server)
          .get("/api/topics")
          .expect(200)
          .then(({ body: { topics } }) => {
            expect(topics).to.be.an("array");
            expect(topics).to.all.contain.keys("slug", "description");
          });
      });
    });
    describe("INVALID METHODS", () => {
      it("STATUS:405 / responds status 405 when an invalid method is used", () => {
        const invalidMethods = ["put", "patch", "post", "delete"];
        const methodPromises = invalidMethods.map(method => {
          return request(server)
            [method]("/api/topics")
            .expect(405)
            .then(res => {
              expect(res.body.msg).to.equal("Method not allowed");
            });
        });
        return Promise.all(methodPromises);
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
    describe("INVALID METHODS", () => {
      it("STATUS:405 / responds status 405 when an invalid method is used", () => {
        const invalidMethods = ["get", "put", "patch", "post", "delete"];
        const methodPromises = invalidMethods.map(method => {
          return request(server)
            [method]("/api/users")
            .expect(405)
            .then(res => {
              expect(res.body.msg).to.equal("Method not allowed");
            });
        });
        return Promise.all(methodPromises);
      });
      it("STATUS:405 /:username responds status 405 when an invalid method is used", () => {
        const invalidMethods = ["put", "patch", "post", "delete"];
        const methodPromises = invalidMethods.map(method => {
          return request(server)
            [method]("/api/users/1")
            .expect(405)
            .then(res => {
              expect(res.body.msg).to.equal("Method not allowed");
            });
        });
        return Promise.all(methodPromises);
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
      it("GET:200 / sorts descendingly by 'created_by' by default", () => {
        return request(server)
          .get("/api/articles")
          .expect(200)
          .then(res => {
            expect(res.body.articles).to.be.descendingBy("created_at");
          });
      });
      it("GET:200 /? sorts descendingly by 'created_by' when given a 'desc' order query", () => {
        return request(server)
          .get("/api/articles?order=desc")
          .expect(200)
          .then(res => {
            expect(res.body.articles).to.be.descendingBy("created_at");
          });
      });
      it("GET:200 /? sorts descendingly by any column when given any valid column name as a sort_by query", () => {
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
      it("GET:200 /? sorts descendingly by any column when given any valid column name as a sort_by query and a 'desc' order query", () => {
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
            .get(`/api/articles?sort_by=${query}&order=desc`)
            .expect(200)
            .then(res => {
              expect(res.body.articles).to.be.descendingBy(query);
            });
        });
        return Promise.all(testPromises);
      });
      it("GET:200 /? sorts ascendingly by 'created_by' when given an 'asc' order query", () => {
        return request(server)
          .get("/api/articles?order=asc")
          .expect(200)
          .then(res => {
            expect(res.body.articles).to.be.ascendingBy("created_at");
          });
      });
      it("GET:200 /? sorts ascendingly by any column when given any valid column name as a sort_by query and an 'asc' order query", () => {
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
            .get(`/api/articles?sort_by=${query}&order=asc`)
            .expect(200)
            .then(res => {
              expect(res.body.articles).to.be.ascendingBy(query);
            });
        });
        return Promise.all(testPromises);
      });
      it("GET:200 /? works with sort_by and order queries given in any order", () => {
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
            .get(`/api/articles?order=asc&sort_by=${query}`)
            .expect(200)
            .then(res => {
              expect(res.body.articles).to.be.ascendingBy(query);
            });
        });
        return Promise.all(testPromises);
      });
      it("GET:200 /? responds with articles by one author when given an author query", () => {
        return request(server)
          .get("/api/articles?author=butter_bridge")
          .expect(200)
          .then(res => {
            expect(res.body.articles).to.all.have.property(
              "author",
              "butter_bridge"
            );
            expect(res.body.articles.length).to.equal(3);
          });
      });
      it("GET:200 /? responds correctly when given an author query and a sort_by or order query, or both", () => {
        const authorQueryAndSortBy = request(server)
          .get("/api/articles?author=butter_bridge&sort_by=comment_count")
          .expect(200)
          .then(res => {
            expect(res.body.articles).to.all.have.property(
              "author",
              "butter_bridge"
            );
            expect(res.body.articles.length).to.equal(3);
            expect(res.body.articles).to.be.descendingBy("comment_count");
          });
        const authorQueryAndOrder = request(server)
          .get("/api/articles?author=butter_bridge&order=asc")
          .expect(200)
          .then(res => {
            expect(res.body.articles).to.all.have.property(
              "author",
              "butter_bridge"
            );
            expect(res.body.articles.length).to.equal(3);
            expect(res.body.articles).to.be.ascendingBy("created_at");
          });
        const authorQueryAndSortByAndOrder = request(server)
          .get("/api/articles?author=butter_bridge&sort_by=body&order=asc")
          .expect(200)
          .then(res => {
            expect(res.body.articles).to.all.have.property(
              "author",
              "butter_bridge"
            );
            expect(res.body.articles.length).to.equal(3);
            expect(res.body.articles).to.be.ascendingBy("body");
          });
        return Promise.all([
          authorQueryAndSortBy,
          authorQueryAndOrder,
          authorQueryAndSortByAndOrder
        ]);
      });
      it("GET:200 /? responds with an empty array when given a valid author query for an author that has no articles", () => {
        return request(server)
          .get("/api/articles?author=lurker")
          .expect(200)
          .then(res => {
            expect(res.body.articles).to.be.an("array");
            expect(res.body.articles).to.eql([]);
          });
      });
      it("GET:200 /? responds with articles belonging to one topic when given a topic query", () => {
        return request(server)
          .get("/api/articles?topic=mitch")
          .expect(200)
          .then(res => {
            expect(res.body.articles).to.all.have.property("topic", "mitch");
            expect(res.body.articles.length).to.equal(11);
          });
      });
      it("GET:200 /? responds correctly when given a topic query and a sort_by or order query, or both", () => {
        const topicQueryAndSortBy = request(server)
          .get("/api/articles?topic=mitch&sort_by=comment_count")
          .expect(200)
          .then(res => {
            expect(res.body.articles).to.all.have.property("topic", "mitch");
            expect(res.body.articles.length).to.equal(11);
            expect(res.body.articles).to.be.descendingBy("comment_count");
          });
        const topicQueryAndOrder = request(server)
          .get("/api/articles?topic=mitch&order=asc")
          .expect(200)
          .then(res => {
            expect(res.body.articles).to.all.have.property("topic", "mitch");
            expect(res.body.articles.length).to.equal(11);
            expect(res.body.articles).to.be.ascendingBy("created_at");
          });
        const topicQueryAndSortByAndOrder = request(server)
          .get("/api/articles?topic=mitch&sort_by=body&order=asc")
          .expect(200)
          .then(res => {
            expect(res.body.articles).to.all.have.property("topic", "mitch");
            expect(res.body.articles.length).to.equal(11);
            expect(res.body.articles).to.be.ascendingBy("body");
          });
        return Promise.all([
          topicQueryAndSortBy,
          topicQueryAndOrder,
          topicQueryAndSortByAndOrder
        ]);
      });
      it("GET:200 /? responds with an empty array when given a valid topic query for a topic that has no articles", () => {
        return request(server)
          .get("/api/articles?topic=paper")
          .expect(200)
          .then(res => {
            expect(res.body.articles).to.be.an("array");
            expect(res.body.articles).to.eql([]);
          });
      });
      it("GET:200 /? responds articles by one author and from one topic when given an author and topic query", () => {
        return request(server)
          .get("/api/articles?author=rogersop&topic=mitch")
          .expect(200)
          .then(res => {
            expect(res.body.articles).to.all.have.property(
              "author",
              "rogersop"
            );
            expect(res.body.articles).to.all.have.property("topic", "mitch");
            expect(res.body.articles.length).to.equal(2);
          });
      });
      it("GET:200 /? responds with an empty array when given an author and topic query with no matching articles", () => {
        return request(server)
          .get("/api/articles?author=butter_bridge&topic=cats")
          .expect(200)
          .then(res => {
            expect(res.body.articles).to.eql([]);
          });
      });
      it("GET:200 /:id responds with an article with a comment_count property when given a valid article_id that exists in the database", () => {
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
      it("GET:200 /:id responds with an article with a comment_count value of '0' when given an article_id that has no comments", () => {
        return request(server)
          .get("/api/articles/2")
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
            expect(res.body.article.comment_count).to.equal(0);
          });
      });
    });
    describe("PATCH", () => {
      it("PATCH:200 /:id responds with the updated article when sent a positive vote increment", () => {
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
      it("PATCH:200 /:id responds with the updated article when sent a negative vote increment", () => {
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
      it("PATCH:200 /:id works when the vote increment would take the vote count below zero", () => {
        return request(server)
          .patch("/api/articles/1")
          .send({ inc_votes: -101 })
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
            expect(res.body.article.votes).to.equal(-1);
          });
      });
      it("PATCH:200 /:id works when given a valid vote increment and an extra property", () => {
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
      it("PATCH:200 /:id responds with the article when no vote increment is given", () => {
        return request(server)
          .patch("/api/articles/1")
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
            expect(res.body.article.votes).to.equal(100);
          });
      });
    });
    describe("ERRORS", () => {
      it("GET:404 /? responds status 404 when given an author query that doesn't exist in the database", () => {
        return request(server)
          .get("/api/articles?author=hello")
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal("Author not found");
          });
      });
      it("GET:404 /? responds status 404 when given an topic query that doesn't exist in the database", () => {
        return request(server)
          .get("/api/articles?topic=hello")
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal("Topic not found");
          });
      });
      it("GET:404 /? responds status 404 when given an author or topic query and at least one doesn't exist in the database (or both)", () => {
        const validAuthorInvalidTopic = request(server)
          .get("/api/articles?author=butter_bridge&topic=hello")
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal("Topic not found");
          });
        const invalidAuthorValidTopic = request(server)
          .get("/api/articles?author=hello&topic=mitch")
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal("Author not found");
          });
        const invalidTopicValidAuthor = request(server)
          .get("/api/articles?topic=hello&author=butter_bridge")
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal("Topic not found");
          });
        const validTopicInvalidAuthor = request(server)
          .get("/api/articles?topic=mitch&author=hello")
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal("Author not found");
          });
        const invalidAuthorInvalidTopic = request(server)
          .get("/api/articles?author=hello&topic=hello")
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal(
              "Author not found" || "Topic not found"
            );
          });
        return Promise.all([
          validAuthorInvalidTopic,
          invalidAuthorValidTopic,
          invalidTopicValidAuthor,
          validTopicInvalidAuthor,
          invalidAuthorInvalidTopic
        ]);
      });
      it("GET:400 /:id responds status 400 when given an article_id integer outside of the range", () => {
        return request(server)
          .get("/api/articles/9999999999")
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal("Bad Request - number out of range");
          });
      });
      it("GET:400 /:id responds status 400 when given an invalid article_id", () => {
        return request(server)
          .get("/api/articles/hello")
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal("Bad Request");
          });
      });
      it("GET:404 /:id responds status 404 when given a valid article_id that doesn't exist in the database", () => {
        return request(server)
          .get("/api/articles/999999999")
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal("Article not found");
          });
      });
      it("PATCH:400 /:id responds status 400 when given an invalid vote increment", () => {
        return request(server)
          .patch("/api/articles/1")
          .send({ inc_votes: "hello" })
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal("Bad Request");
          });
      });
      it("PATCH:400 /:id responds status 400 when given an invalid article_id", () => {
        return request(server)
          .get("/api/articles/hello")
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.equal("Bad Request");
          });
      });
      it("PATCH:404 /:id responds status 404 when given a valid article_id that doesn't exist in the database", () => {
        return request(server)
          .patch("/api/articles/999999999")
          .send({ inc_votes: 1 })
          .expect(404)
          .then(res => {
            expect(res.body.msg).to.equal("Article not found");
          });
      });
      describe("INVALID METHODS", () => {
        it("STATUS:405 / responds status 405 when an invalid method is used", () => {
          const invalidMethods = ["put", "patch", "post", "delete"];
          const methodPromises = invalidMethods.map(method => {
            return request(server)
              [method]("/api/articles")
              .expect(405)
              .then(res => {
                expect(res.body.msg).to.equal("Method not allowed");
              });
          });
          return Promise.all(methodPromises);
        });
        it("STATUS:405 /:id responds status 405 when an invalid method is used", () => {
          const invalidMethods = ["put", "post", "delete"];
          const methodPromises = invalidMethods.map(method => {
            return request(server)
              [method]("/api/articles/1")
              .expect(405)
              .then(res => {
                expect(res.body.msg).to.equal("Method not allowed");
              });
          });
          return Promise.all(methodPromises);
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
        it("GET:200 /comments responds with an empty array when given a valid article_id that has no comments", () => {
          return request(server)
            .get("/api/articles/2/comments")
            .expect(200)
            .then(res => {
              expect(res.body.comments).to.eql([]);
            });
        });
        it("GET:200 /comments sorts descendingly by 'created_by' by default", () => {
          return request(server)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(res => {
              expect(res.body.comments).to.be.descendingBy("created_at");
            });
        });
        it("GET:200 /comments sorts descendingly by 'created_by' when given a 'desc' order query", () => {
          return request(server)
            .get("/api/articles/1/comments?order=desc")
            .expect(200)
            .then(res => {
              expect(res.body.comments).to.be.descendingBy("created_at");
            });
        });
        it("GET:200 /comments sorts descendingly by any column when given any valid column name as a sort_by query", () => {
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
        it("GET:200 /comments sorts ascendingly by 'created_by' when given an 'asc' order query", () => {
          return request(server)
            .get("/api/articles/1/comments?order=asc")
            .expect(200)
            .then(res => {
              expect(res.body.comments).to.be.ascendingBy("created_at");
            });
        });
        it("GET:200 /comments sorts ascendingly by any column when given any valid column name as a sort_by query and an 'asc' order query", () => {
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
        it("POST:201 /comments works when given an object containing a new comment and an extra property", () => {
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
        it("GET:400 /comments responds status 400 when given when given an invalid order query", () => {
          return request(server)
            .get("/api/articles/1/comments?order=disc")
            .expect(400)
            .then(res => {
              expect(res.body.msg).to.equal("Bad Request");
            });
        });
        it("GET:400 /comments responds status 400 when given when given an invalid column name as a sort_by query and a valid 'order' query", () => {
          return request(server)
            .get("/api/articles/1/comments?sort_by=hello&?order=asc")
            .expect(400)
            .then(res => {
              expect(res.body.msg).to.equal("Bad Request");
            });
        });
        it("GET:400 /comments responds status 400 when given when given a valid sort_by query and an invalid 'order' query", () => {
          return request(server)
            .get("/api/articles/1/comments?sort_by=votes&order=disc")
            .expect(400)
            .then(res => {
              expect(res.body.msg).to.equal("Bad Request");
            });
        });
        it("GET:404 /comments responds status 404 when given a valid article_id that doesn't exist in the database", () => {
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
      describe("INVALID METHODS", () => {
        it("STATUS:405 /comments responds status 405 when an invalid method is used", () => {
          const invalidMethods = ["put", "patch", "delete"];
          const methodPromises = invalidMethods.map(method => {
            return request(server)
              [method]("/api/articles/1/comments")
              .expect(405)
              .then(res => {
                expect(res.body.msg).to.equal("Method not allowed");
              });
          });
          return Promise.all(methodPromises);
        });
      });
    });
  });

  describe("/comments", () => {
    describe("/:comment_id", () => {
      describe("PATCH", () => {
        it("PATCH:200 /:id responds with the updated comment when sent a positive vote increment", () => {
          return request(server)
            .patch("/api/comments/1")
            .send({ inc_votes: 1 })
            .expect(200)
            .then(res => {
              expect(res.body.comment).to.have.keys(
                "comment_id",
                "author",
                "article_id",
                "body",
                "votes",
                "created_at"
              );
              expect(res.body.comment.votes).to.equal(17);
            });
        });
        it("PATCH:200 /:id responds with the updated comment when sent a negative vote increment", () => {
          return request(server)
            .patch("/api/comments/2")
            .send({ inc_votes: -1 })
            .expect(200)
            .then(res => {
              expect(res.body.comment).to.have.keys(
                "comment_id",
                "author",
                "article_id",
                "body",
                "votes",
                "created_at"
              );
              expect(res.body.comment.votes).to.equal(13);
            });
        });
        it("PATCH:200 /:id works when the vote increment would take the vote count below zero", () => {
          return request(server)
            .patch("/api/comments/3")
            .send({ inc_votes: -101 })
            .expect(200)
            .then(res => {
              expect(res.body.comment).to.have.keys(
                "comment_id",
                "author",
                "article_id",
                "body",
                "votes",
                "created_at"
              );
              expect(res.body.comment.votes).to.equal(-1);
            });
        });
        it("PATCH:200 /:id responds with the updated comment when sent an object containing a valid vote increment and an extra property", () => {
          return request(server)
            .patch("/api/comments/4")
            .send({ animal: "dog", inc_votes: 101 })
            .expect(200)
            .then(res => {
              expect(res.body.comment).to.have.keys(
                "comment_id",
                "author",
                "article_id",
                "body",
                "votes",
                "created_at"
              );
              expect(res.body.comment.votes).to.equal(1);
            });
        });
        it("PATCH:200 /:id responds with the comment when no vote increment is given", () => {
          return request(server)
            .patch("/api/comments/1")
            .expect(200)
            .then(res => {
              expect(res.body.comment).to.have.keys(
                "comment_id",
                "author",
                "article_id",
                "body",
                "votes",
                "created_at"
              );
              expect(res.body.comment.votes).to.equal(16);
            });
        });
      });
      describe("DELETE", () => {
        it("DELETE:204 /:id responds with status 204 and no content", () => {
          return request(server)
            .delete("/api/comments/1")
            .expect(204)
            .then(res => {
              expect(res.body).to.eql({});
            });
        });
        it("DELETE:204 /:id removes the comment from the database when given a valid comment_id", () => {
          return request(server)
            .delete("/api/comments/1")
            .expect(204)
            .then(res => {
              expect(res.body).to.eql({});
            })
            .then(() => {
              return request(server)
                .patch("/api/comments/1")
                .send({ inc_votes: 1 })
                .expect(404);
            })
            .then(res => {
              expect(res.body.msg).to.equal("Comment not found");
            });
        });
      });
      describe("ERRORS", () => {
        it("PATCH:400 /:id responds status 400 when given an invalid vote increment", () => {
          return request(server)
            .patch("/api/comments/1")
            .send({
              inc_votes: "hello"
            })
            .expect(400)
            .then(res => {
              expect(res.body.msg).to.equal("Bad Request");
            });
        });
        it("PATCH:400 /:id responds status 400 when given an invalid comment_id", () => {
          return request(server)
            .patch("/api/comments/hello")
            .send({ inc_votes: 1 })
            .expect(400)
            .then(res => {
              expect(res.body.msg).to.equal("Bad Request");
            });
        });
        it("PATCH:404 /:id responds status 404 when given a valid comment_id that doesn't exist in the database", () => {
          return request(server)
            .patch("/api/comments/999999999")
            .send({ inc_votes: 1 })
            .expect(404)
            .then(res => {
              expect(res.body.msg).to.equal("Comment not found");
            });
        });
        it("DELETE:400 /:id responds status 400 when given an invalid comment_id", () => {
          return request(server)
            .delete("/api/comments/hello")
            .expect(400)
            .then(res => {
              expect(res.body.msg).to.equal("Bad Request");
            });
        });
        it("DELETE:404 /:id responds status 404 when given a valid comment_id that doesn't exist in the database", () => {
          return request(server)
            .delete("/api/comments/999999999")
            .expect(404)
            .then(res => {
              expect(res.body.msg).to.equal("Comment not found");
            });
        });
      });
      describe("INVALID METHODS", () => {
        it("STATUS:405 /:id responds status 405 when an invalid method is used", () => {
          const invalidMethods = ["get", "put", "post"];
          const methodPromises = invalidMethods.map(method => {
            return request(server)
              [method]("/api/comments/1")
              .expect(405)
              .then(res => {
                expect(res.body.msg).to.equal("Method not allowed");
              });
          });
          return Promise.all(methodPromises);
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
