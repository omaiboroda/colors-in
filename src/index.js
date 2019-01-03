const patterns = {
  hex: /(#(?:[0-9a-fA-F]{3}){1,2})/gm,
  rgb: /rgb\(\s*(-?\d+|-?\d*\.\d+(?=%))(%?)\s*,\s*(-?\d+|-?\d*\.\d+(?=%))(\2)\s*,\s*(-?\d+|-?\d*\.\d+(?=%))(\2)\s*\)/gm,
  rgba: /rgba\(\s*(-?\d+|-?\d*\.\d+(?=%))(%?)\s*,\s*(-?\d+|-?\d*\.\d+(?=%))(\2)\s*,\s*(-?\d+|-?\d*\.\d+(?=%))(\2)\s*,\s*(-?\d+|-?\d*.\d+)\s*\)/gm
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

const findColors = (str, colorPatterns = patterns) =>
  Object.keys(colorPatterns).reduce((prev, cur) => {
    const res = iterate(colorPatterns[cur], str);
    return [...prev, ...res];
  }, []);

const sort = colors => {
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

module.exports = {
  findColors,
  sort
};
