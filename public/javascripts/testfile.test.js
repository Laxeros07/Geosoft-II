//const getAboutUsLink = require("./testfile.js");
//const moin = require("./testfile.js");
var rewire = require("rewire");
var getAboutUsLink = rewire("../testfile.js").__get__("getAboutUsLink");
var moin = rewire("../testfile.js").__get__("moin");

test("Return about-us for english language", () => {
  expect(getAboutUsLink("en-UK")).toBe("/about-us");
});

test("Return ja for 1", () => {
  expect(moin(1)).toBe("ja");
});

test("Return nein for 2", () => {
  expect(moin(2)).toBe("nein");
});

/**import testfile from "./testfile.js";

describe("Test", () => {
  it("should parse textare value", () => {
    const test = new testfile();
    expect(test.moin(1)).toEqual("ja");
  });
});*/
