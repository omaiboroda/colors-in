Extract colors from your source files

#### Installation

    $ npm i -g colors-in

#### Usage

    $ colors-in src/

    Colors found: 8:
    [ [ '#333', 24 ],
      [ '#fff', 4 ],
      [ '#454b54', 3 ],
      [ '#84868e', 3 ],
      [ '#000000', 1 ],
      [ '#3793d1', 1 ],
      [ '#cdcfd4', 1 ],
      [ '#83868d', 1 ] ]

You can exclude some files with `--exclude` option:

    $ colors-in src/ --exclude snap,svg

Regular expressions, used for colors lookup:

    {
      hex: /(#(?:[0-9a-fA-F]{3}){1,2})/gm,
      rgba: /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s\*(\d+(?:\.\d+)?))?\)/gm,
    }
