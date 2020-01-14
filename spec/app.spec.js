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
    it("GET:404 /:username responds status 404 with an appropriate error message when given a valid username that doesn't exist", () => {
      return request(server)
        .get("/api/users/margarine_bridge")
        .expect(404)
        .then(res => {
          expect(res.body.msg).to.equal("Username does not exist");
        });
    });
    // it("GET:400 /:username responds status 400 with an appropriate error message when given an invalid username", () => {
    //   return request(server)
    //     .get("/api/users/??????")
    //     .expect(400)
    //     .then(res => {
    //       expect(res.body.msg).to.equal("Invalid username");
    //     });
    // });
  });
});
