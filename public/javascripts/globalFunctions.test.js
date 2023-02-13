const getDateityp = require("./globalFunctions");

test("Test getDateityp", () => {
  expect(getDateityp("hallo.gpkg")).toBe("gpkg");
});
