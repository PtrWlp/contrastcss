var parseCss = require('css-parse');
var stringifyCss = require('css-stringify');

module.exports = function (css) {
  var i, len, parsed, rules, colorRules, rule;
  parsed = parseCss(css);
  colorRules = [];
  rules = parsed.stylesheet.rules;
  for (i = 0, len = rules.length; i < len; i++) {
    rule = rules[i];
    if (rule.indexOf("#") !== -1) {
      colorRules.push(rule);
    }
  }
  parsed.stylesheet.rules = colorRules;
  return stringifyCss(parsed);
};


