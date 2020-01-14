const { expect } = require("chai");
const {
  formatDates,
  makeRefObj,
  formatComments
} = require("../db/utils/utils");

describe("formatDates", () => {
  it("returns an empty array if given an empty array", () => {
    expect(formatDates([])).to.eql([]);
  });
  it("returns an array with an object with a created_at property converted from a unix timestamp to an sql timestamp when given an array with a single object", () => {
    const input = [{ created_at: 1542284514171 }];
    const expectedDate = new Date(1542284514171);
    expect(formatDates(input)).to.eql([
      {
        created_at: expectedDate
      }
    ]);
  });
  it("does not mutate the input array", () => {
    const input = [{ created_at: 1542284514171 }];
    const inputCopy = [{ created_at: 1542284514171 }];
    const output = formatDates(input);
    expect(input).to.eql(inputCopy);
    expect(output[0]).to.not.equal(input[0]);
  });
  it("works with an array containing multiple objects", () => {
    const input = [
      { created_at: 1542284514171 },
      { created_at: 1416140514171 }
    ];
    const expectedDate1 = new Date(1542284514171);
    const expectedDate2 = new Date(1416140514171);
    const output = [
      {
        created_at: expectedDate1
      },
      { created_at: expectedDate2 }
    ];
    expect(formatDates(input)).to.eql(output);
  });
  it("works with objects containing multiple properties", () => {
    const input = [
      {
        title: "Living in the shadow of a great man",
        created_at: 1542284514171,
        author: "butter_bridge"
      },
      {
        title: "Sony Vaio; or, The Laptop",
        created_at: 1416140514171,
        author: "icellusedkars"
      }
    ];
    const expectedDate1 = new Date(1542284514171);
    const expectedDate2 = new Date(1416140514171);
    const output = [
      {
        title: "Living in the shadow of a great man",
        created_at: expectedDate1,
        author: "butter_bridge"
      },
      {
        title: "Sony Vaio; or, The Laptop",
        created_at: expectedDate2,
        author: "icellusedkars"
      }
    ];
    expect(formatDates(input)).to.eql(output);
  });
});

describe("makeRefObj", () => {
  it("returns an empty object if given an empty array", () => {
    expect(makeRefObj([])).to.eql({});
  });
  it("returns an object containing a single key value pair (title: article_id) when given an array containing single object", () => {
    const input = [{ article_id: 12, title: "Moustache" }];
    const output = { Moustache: 12 };
    expect(makeRefObj(input)).to.eql(output);
  });
  it("does not mutate the input array", () => {
    const input = [{ article_id: 12, title: "Moustache" }];
    const inputCopy = [{ article_id: 12, title: "Moustache" }];
    makeRefObj(input);
    expect(input).to.eql(inputCopy);
  });
  it("works when given an array containing multiple objects", () => {
    const input = [
      {
        article_id: 12,
        title: "Moustache"
      },
      { article_id: 11, title: "Am I a cat?" }
    ];
    const output = { Moustache: 12, "Am I a cat?": 11 };
    expect(makeRefObj(input)).to.eql(output);
  });
  it("works with objects containing multiple properties", () => {
    const input = [
      {
        article_id: 12,
        votes: 0,
        title: "Moustache",
        author: "butter_bridge"
      },
      {
        author: "butter_bridge",
        article_id: 11,
        votes: 20,
        title: "Am I a cat?"
      }
    ];
    const output = { Moustache: 12, "Am I a cat?": 11 };
    expect(makeRefObj(input)).to.eql(output);
  });
});

describe("formatComments", () => {
  it("returns an empty array if given an empty array", () => {
    expect(formatComments([])).to.eql([]);
  });
  it("returns a single, corrected object when given a single object and a reference object", () => {
    const comments = [
      {
        belongs_to: "They're not exactly dogs, are they?",
        created_by: "butter_bridge"
      }
    ];
    const refObj = { "They're not exactly dogs, are they?": 9 };
    const output = [{ article_id: 9, author: "butter_bridge" }];
    expect(formatComments(comments, refObj)).to.eql(output);
  });
  it("does not mutate the original inputs", () => {
    const comments = [
      {
        belongs_to: "They're not exactly dogs, are they?",
        created_by: "butter_bridge"
      }
    ];
    const commentsCopy = [
      {
        belongs_to: "They're not exactly dogs, are they?",
        created_by: "butter_bridge"
      }
    ];
    const refObj = { "They're not exactly dogs, are they?": 9 };
    const refObjCopy = { "They're not exactly dogs, are they?": 9 };
    const output = formatComments(comments, refObj);
    expect(comments).to.eql(commentsCopy);
    expect(refObj).to.eql(refObjCopy);
    expect(output[0]).to.not.equal(comments[0]);
  });
  it("works with an array containing multiple objects", () => {
    const comments = [
      {
        belongs_to: "They're not exactly dogs, are they?",
        created_by: "butter_bridge"
      },
      {
        belongs_to: "Living in the shadow of a great man",
        created_by: "butter_bridge"
      }
    ];
    const refObj = {
      "They're not exactly dogs, are they?": 9,
      "Living in the shadow of a great man": 1
    };
    const output = [
      { article_id: 9, author: "butter_bridge" },
      { article_id: 1, author: "butter_bridge" }
    ];
    expect(formatComments(comments, refObj)).to.eql(output);
  });
  it("works with objects containing multiple properties", () => {
    const comments = [
      {
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        belongs_to: "They're not exactly dogs, are they?",
        created_by: "butter_bridge"
      },
      {
        body:
          "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
        belongs_to: "Living in the shadow of a great man",
        created_by: "butter_bridge"
      }
    ];
    const refObj = {
      "They're not exactly dogs, are they?": 9,
      "Living in the shadow of a great man": 1
    };
    const output = [
      {
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        article_id: 9,
        author: "butter_bridge"
      },
      {
        body:
          "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
        article_id: 1,
        author: "butter_bridge"
      }
    ];
    expect(formatComments(comments, refObj)).to.eql(output);
  });
});
