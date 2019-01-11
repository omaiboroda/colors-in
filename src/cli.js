#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const walk = require("walk");
const { argv } = require("yargs");
const chalk = require("chalk");
const { findColors, sort, group } = require("./index");

const [pathArg] = argv._;
const { exclude, include } = argv;

const destination = path.join(process.cwd(), pathArg);

const reportFiles = files => {
  const body = files.slice(0, 2).join(", ");
  let suffix;
  if (files.length > 3) {
    suffix = ` and other ${files.length - 2} files`;
  }
  return `${chalk.yellow(body)}${suffix || ""}`;
};

const logBlock = (stats, extension) => {
  console.log(`${stats.length} colors found in ${extension}:`);
  stats.forEach(stat => {
    console.log(
      " ",
      chalk`${chalk.bgHex(stat.color)("   ")}`,
      chalk.green(stat.color),
      chalk.red(stat.count),
      "usages in",
      chalk.white(reportFiles(stat.files))
    );
  });
  console.log("========================================");
};

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
          extension,
          files: [fileStats.name]
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
    const groupByExtension = stat =>
      stat.reduce((prev, cur) => {
        prev[cur.extension] = prev[cur.extension]
          ? [...prev[cur.extension], cur]
          : [cur];
        return prev;
      }, {});
    const byExtension = groupByExtension(colors);
    Object.keys(byExtension).forEach(extension => {
      const stats = sort(group(byExtension[extension]));
      logBlock(stats, extension);
    });
  });
})(destination);
