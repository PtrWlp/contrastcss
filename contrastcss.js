var parseCss = require('css-parse');
var stringifyCss = require('css-stringify');

module.exports = function(css) {
  var i, intervalRules, len, m, media, mediaRules, medias, onlyMaxRules, onlyMinRules, otherRules, parsed, ref, rootRules, rule, rules;
  parsed = parseCss(css);
  medias = {};
  rootRules = [];
  ref = parsed.stylesheet.rules;
  for (i = 0, len = ref.length; i < len; i++) {
    rule = ref[i];
    if (rule.type === 'media') {
      if (!medias[rule.media]) {
        medias[rule.media] = [];
      }
      medias[rule.media] = medias[rule.media].concat(rule.rules);
    } else {
      rootRules.push(rule);
    }
  }
  mediaRules = [];
  for (media in medias) {
    rules = medias[media];
    rule = {
      type: "media",
      media: media,
      rules: rules
    };
    if (media.indexOf("min-width") !== -1) {
      m = media.match(/min-width:\s*([1-9][0-9]*)px/);
      if (m && m[1]) {
        rule.minWidth = parseInt(m[1]);
      }
    }
    if (media.indexOf("max-width") !== -1) {
      m = media.match(/max-width:\s*([1-9][0-9]*)px/);
      if (m && m[1]) {
        rule.maxWidth = parseInt(m[1]);
      }
    }
    mediaRules.push(rule);
  }
  onlyMinRules = mediaRules.filter(function(rule) {
    return rule.minWidth && !rule.maxWidth;
  });
  onlyMaxRules = mediaRules.filter(function(rule) {
    return rule.maxWidth && !rule.minWidth;
  });
  intervalRules = mediaRules.filter(function(rule) {
    return rule.minWidth && rule.maxWidth;
  });
  otherRules = mediaRules.filter(function(rule) {
    return indexOf.call(onlyMinRules.concat(onlyMaxRules).concat(intervalRules), rule) < 0;
  });
  onlyMinRules.sort(function(a, b) {
    return a.minWidth - b.minWidth;
  });
  onlyMaxRules.sort(function(a, b) {
    return b.maxWidth - a.maxWidth;
  });
  parsed.stylesheet.rules = rootRules.concat(onlyMinRules).concat(onlyMaxRules).concat(intervalRules).concat(otherRules);
  return stringifyCss(parsed);
};


