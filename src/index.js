const patterns = {
  hex: /#([a-f0-9]{3}|[a-f0-9]{4}(?:[a-f0-9]{2}){0,2})\b/gm,
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
    const res = iterate(colorPatterns[cur], str.toLowerCase());
    return [...prev, ...res];
  }, []);

const group = stats =>
  stats.reduce((sum, stat) => {
    stat.color = stat.color.toLowerCase();
    const existing = sum.find(exist => exist.color === stat.color);
    if (existing) {
      existing.count += 1;
      existing.files = existing.files.find(f => f === stat.files[0])
        ? existing.files
        : [...existing.files, stat.files[0]];
    } else {
      sum.push({ ...stat, count: 1 });
    }

    return sum;
  }, []);

const sort = stats => stats.sort((a, b) => b.count - a.count);
module.exports = {
  findColors,
  group,
  sort
};
