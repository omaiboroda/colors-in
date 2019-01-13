#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const walk = require("walk");
const yargs = require("yargs");
const chalk = require("chalk");
const { isBinaryFileSync } = require("isbinaryfile");
const { findColors, sort, group } = require("./index");

const { argv } = yargs
  .usage("Usage: colors-in <folder> [options]")
  .option("i", {
    alias: "include",
    requiresArg: true,
    describe: "RegExp to include files",
    type: "string"
  })
  .option("e", {
    alias: "exclude",
    requiresArg: true,
    describe: "RegExp to exclude files",
    type: "string"
  })
  .option("f", {
    alias: "flat",
    describe: "Disable grouping by file extension",
    type: "boolean"
  })
  .example("colors-in src/ --exclude 'snap|svg' --include js");

const [pathArg] = argv._;
const { exclude, include, flat } = argv;

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

const groupByExtension = stat =>
  stat.reduce((prev, cur) => {
    prev[cur.extension] = prev[cur.extension]
      ? [...prev[cur.extension], cur]
      : [cur];
    return prev;
  }, {});

const groupFlat = stat => ({
  [destination]: stat
});

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
    if (!isBinaryFileSync(path.join(root, fileStats.name))) {
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
        return next();
      });
    } else {
      next();
    }
  });

  walker.on("errors", (root, nodeStatsArray, next) => {
    console.error(nodeStatsArray);
    next();
  });

  walker.on("end", () => {
    const groupedColors = flat ? groupFlat(colors) : groupByExtension(colors);

    Object.keys(groupedColors).forEach(extension => {
      const stats = sort(group(groupedColors[extension]));
      logBlock(stats, extension);
    });
  });
})(destination);
