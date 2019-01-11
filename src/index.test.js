const { findColors, group, sort } = require("./index");

describe("Color extracting behavior", () => {
  it("Can find colors in a string", () => {
    const str =
      '#ff "#ffffff,"#FFFFFF" #asdf RGBA(1,1,1), rgba(345,543,3455) rgb(1,1,1) rgba(2,2,3, 0.7#address';
    const expected = ["#ffffff", "#ffffff", "rgb(1,1,1)"];
    expect(findColors(str)).toEqual(expected);
  });

  it("Can group by usage number and file", () => {
    const stats = [
      { color: "#ffffff", files: ["index.js"] },
      { color: "rgb(1,1,1)", files: ["index.js"] },
      { color: "#ffffff", files: ["magic.js"] },
      { color: "#333", files: ["colors.css"] },
      { color: "rgb(1,1,2)", files: ["colors.css"] }
    ];

    const expected = [
      { color: "#ffffff", count: 2, files: ["index.js", "magic.js"] },
      { color: "rgb(1,1,1)", count: 1, files: ["index.js"] },
      { color: "#333", count: 1, files: ["colors.css"] },
      { color: "rgb(1,1,2)", count: 1, files: ["colors.css"] }
    ];
    expect(group(stats)).toEqual(expected);
  });

  it("Can sort by usage number", () => {
    const stats = [
      { color: "#ffffff", count: 2, files: ["index.js", "magic.js"] },
      { color: "rgb(1,1,1)", count: 3, files: ["index.js"] },
      { color: "#333", count: 1, files: ["colors.css"] }
    ];

    const expected = [
      { color: "rgb(1,1,1)", count: 3, files: ["index.js"] },
      { color: "#ffffff", count: 2, files: ["index.js", "magic.js"] },
      { color: "#333", count: 1, files: ["colors.css"] }
    ];
    expect(sort(stats)).toEqual(expected);
  });
});
