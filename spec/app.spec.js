process.env.NODE_ENV = "test";
const chai = require("chai");
const expect = chai.expect;
chai.should();
chai.use(require("sams-chai-sorted"));
chai.use(require("chai-things"));
const request = require("supertest");
const app = require("../app");
const connection = require("../db/connection.js");

describe("/api", () => {
  after(() => connection.destroy());
  describe("/topics", () => {
    it("GET:200 / responds status 200", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(res => {
          expect(res.body.topics).to.be.an("array");
          expect(res.body.topics[0]).to.contain.keys("slug", "description");
        });
    });
  });
  describe("/topics errors", () => {});
});
