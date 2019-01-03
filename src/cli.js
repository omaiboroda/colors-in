#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const walk = require("walk");
const { argv } = require("yargs");
const { findColors, sort } = require("./index");

const [pathArg] = argv._;
const { exclude } = argv;

const destination = path.join(process.cwd(), pathArg);

(pathToDirectory => {
  const walker = walk.walk(pathToDirectory);
  let colors = [];

  walker.on("file", (root, fileStats, next) => {
    if (exclude) {
      const excludeRegex = new RegExp(exclude.split(",").join("|"));
      if (excludeRegex.test(fileStats.name)) {
        next();
        return;
      }
    }
    fs.readFile(path.join(root, fileStats.name), "utf8", (err, contents) => {
      const colorsInFile = findColors(contents);
      colors = [...colors, ...colorsInFile];
      next();
    });
  });

  walker.on("errors", (root, nodeStatsArray, next) => {
    console.error(nodeStatsArray);
    next();
  });

  walker.on("end", () => {
    const stats = sort(colors);
    console.log(`Colors found: ${stats.length}: \n`, stats);
  });
})(destination);
