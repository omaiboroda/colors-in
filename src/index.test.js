const { findColors, sort } = require("./index");

describe("Color extracting behavior", () => {
  it("Can find colors in a string", () => {
    const str =
      "#ff #ffffff #asdf rgba(345,543,3455) rgb(1,1,1) rgba(2,2,3, 0.7";
    const expected = ["#ffffff", "rgb(1,1,1)"];
    expect(findColors(str)).toEqual(expected);
  });

  it("Can sort by usage number", () => {
    const colors = ["#ffffff", "rgb(1,1,1)", "#ffffff", "#333", "rgb(1,1,2)"];

    const expected = [
      ["#ffffff", 2],
      ["rgb(1,1,1)", 1],
      ["#333", 1],
      ["rgb(1,1,2)", 1]
    ];
    expect(sort(colors)).toEqual(expected);
  });
});
