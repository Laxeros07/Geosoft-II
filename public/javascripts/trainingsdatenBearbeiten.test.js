const getTest = require("./trainingsdatenBearbeitenTest");

test("Test getTest", () => {
  expect(getTest("DiesIstEinTestLayer")).toBe("Layer: DiesIstEinTestLayer");
});
