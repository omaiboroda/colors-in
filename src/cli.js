#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const walk = require("walk");
const { argv } = require("yargs");
const { lookInFile, makeStats } = require("./index");

const [pathArg] = argv._;
const { exclude } = argv;

const destination = path.join(process.cwd(), pathArg);

const lookInFolder = pathToDirectory => {
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
