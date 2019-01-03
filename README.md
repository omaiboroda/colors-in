Extract colors from your source files

#### Installation

    $ npm i -g colors-in

#### Usage

    $ colors-in src/

You can exclude some files with `--exclude` option:

    $ colors-in src/ --exclude snap,svg

Example of the output:

![Example](./screenshot.png)

Regular expressions, used for colors lookup:

    {
      hex: /(#(?:[0-9a-fA-F]{3}){1,2})/gm,
      rgba: /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s\*(\d+(?:\.\d+)?))?\)/gm,
    }
