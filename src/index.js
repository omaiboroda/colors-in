#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const walk = require("walk");
const { argv } = require("yargs");

const [pathArg] = argv._;
const { exclude } = argv;

const destination = path.join(process.cwd(), pathArg);

const patterns = {
  hex: /(#(?:[0-9a-fA-F]{3}){1,2})/gm,
  rgba: /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/gm
};

const iterate = (regexp, str) => {
  let match = regexp.exec(str);
  const result = [];
  while (match != null) {
    result.push(match[0]);
    match = regexp.exec(str);
  }
  return result;
};

const findColors = (colorPatterns, str) =>
  Object.keys(colorPatterns).reduce((prev, cur) => {
    const res = iterate(colorPatterns[cur], str);
    return [...prev, ...res];
  }, []);

const lookInFile = pathToFile =>
  new Promise((resolve, reject) => {
    fs.readFile(pathToFile, "utf8", (err, contents) => {
      if (err) {
        console.error(err);
        return reject(err);
      }
      return resolve(findColors(patterns, contents));
    });
  });

const makeStats = colors => {
  // { "#454b54": 1, "#000000": 3, ... }
  const count = colors.reduce((sum, color) => {
    color = color.toLowerCase();
    sum[color] = sum[color] ? sum[color] + 1 : 1;
    return sum;
  }, {});
  // [ '#333', 39 ], [ '#fff', 34 ],
  const sorted = Object.keys(count)
    .map(color => [color, count[color]])
    .sort((a, b) => b[1] - a[1]);
  return sorted;
};

const lookInFolder = pathToDirectory => {
  const walker = walk.walk(pathToDirectory);
  let colors = [];

  walker.on("file", (root, fileStats, next) => {
    if (exclude) {
      const excludeRegex = new RegExp(exclude);
      if (excludeRegex.test(fileStats.name)) {
        next();
        return;
      }
    }
    fs.readFile(fileStats.name, async () => {
      const colorsInFile = await lookInFile(path.join(root, fileStats.name));
      colors = [...colors, ...colorsInFile];
      next();
    });
  });

  walker.on("errors", (root, nodeStatsArray, next) => {
    console.error(nodeStatsArray);
    next();
  });

  walker.on("end", () => {
    const stats = makeStats(colors);
    console.log(`Colors found: ${stats.length}: \n`, stats);
  });
};

lookInFolder(destination);
