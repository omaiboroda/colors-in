#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const walk = require("walk");
const { argv } = require("yargs");
const chalk = require("chalk");
const { findColors, sort } = require("./index");

const [pathArg] = argv._;
const { exclude, include } = argv;

const destination = path.join(process.cwd(), pathArg);

(pathToDirectory => {
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
    if (include) {
      const includeRegex = new RegExp(include);
      if (!includeRegex.test(fileStats.name)) {
        next();
        return;
      }
    }
    fs.readFile(path.join(root, fileStats.name), "utf8", (err, contents) => {
      const colorsInFile = findColors(contents);
      const extension = fileStats.name.split(".").pop();
      colors = [
        ...colors,
        ...colorsInFile.map(c => ({
          color: c,
          extension
        }))
      ];
      next();
    });
  });

  walker.on("errors", (root, nodeStatsArray, next) => {
    console.error(nodeStatsArray);
    next();
  });

  walker.on("end", () => {
    const groupByExtension = colors =>
      colors.reduce((prev, cur) => {
        prev[cur.extension] = prev[cur.extension]
          ? [...prev[cur.extension], cur]
          : [cur];
        return prev;
      }, {});
    const byExtension = groupByExtension(colors);
    Object.keys(byExtension).forEach(extension => {
      const stats = sort(byExtension[extension].map(byEx => byEx.color));
      logBlock(stats, extension);
    });
  });
})(destination);

const logBlock = (stats, extension) => {
  console.log(`${stats.length} colors found in ${extension}:`);
  stats.forEach(stat => {
    console.log(
      " ",
      chalk`${chalk.bgHex(stat[0])("   ")}`,
      chalk.green(stat[0]),
      chalk.yellow(stat[1])
    );
  });
  console.log("---------------------------------");
};
