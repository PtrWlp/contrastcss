var parseCss = require('css-parse');
var stringifyCss = require('css-stringify');

module.exports = function (css, options) {

    var parsed = parseCss(css);
    var rules = parsed.stylesheet.rules;

    var bodyprefix = options.bodyprefix;
    var colorsToTopColor = options.colorsToTopColor[0];
    var colorsToDownColor = options.colorsToDownColor[0];

    var unmatchedColors = [];

    function addUnmatchedColor(color) {
        if (unmatchedColors.indexOf(color) === -1) {
          unmatchedColors.push(color);
        }
    }

    function clone(source) {
        var destination = {}
        for (var property in source) {
            if (typeof source[property] === "object" && source[property] !== null && destination[property]) {
                destination[property] = clone(source[property]);  // recursive
            } else {
                destination[property] = source[property];
            }
        }
        return destination;
    }

    function compareColors(left, right) {

        function parseColor(color){
            if (color.toLowerCase() === 'white' ) {
                color = '#000';
            }
            if (color.toLowerCase() === 'black' ) {
                color = '#fff';
            }
            // More colors? Nah.

            if (color.charAt(0) === "#") {
                // Hex Color, either short or long
                if (color.length === 7) {
                    color =  color.substring(1,6);
                }
                if (color.length === 4 ) {
                    color = color.substring(1,1) + color.substring(1,1) +
                            color.substring(2,1) + color.substring(2,1) +
                            color.substring(3,1) + color.substring(3,1);
                }
                return {r:parseInt(color.substring(0,2),16),
                        g:parseInt(color.substring(2,4),16),
                        b:parseInt(color.substring(4,6),16)};
            } else if(color.toLowerCase().indexOf('rgb') > -1) {
                var re = /\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*/gmi;
                var m;
                var splitm;

                if ((m = re.exec(color)) !== null) {
                    if (m.index === re.lastIndex) {
                        re.lastIndex++;
                    }
                    splitm = m[0].split(',');
                    return {r: parseInt(splitm[0].trim()),
                            g: parseInt(splitm[1].trim()),
                            b: parseInt(splitm[2].trim())};
                } else {
                  return null;
                }

            } else {
                return null;
            }
        }

        var l = parseColor(left);
        var r =parseColor(right);
        if(l !=null && r!=null){
           return l.r === r.r && l.g === r.g && l.b === r.b;
        } else {
            return false;
        }
    }

    function enhanceSelectors(selectors) {
        for (var i = 0; i < selectors.length; ++i) {
            if (selectors[i] === 'html') {
                selectors[i] = selectors[i] + ' .' + bodyprefix; // all classes within html
            } else if (selectors[i] === 'body') {
                selectors[i] = selectors[i] + '.' + bodyprefix; // all body having class
            } else {
                selectors[i] = '.' + bodyprefix + ' ' + selectors[i]; // all other, under body tag
            }
        }
        return selectors;
    }

    function isTopColor(color) {
        return isColorInList(color, options.colorsToTopColor);
    }

    function isDownColor(color) {
        return isColorInList(color, options.colorsToDownColor);
    }

    function isColorInList(color, listOfColors) {
        for (var i = 0; i < listOfColors.length; ++i) {
            if (compareColors(color, listOfColors[i])) {
                return true;
            }
        }
        return false;
    }

    function leaveOnlyColorDeclarations(declarations) {
        var copyDeclarations = [], declaration;
        for (var i = 0; i < declarations.length; ++i) {
            declaration = clone(declarations[i]);

            if (['color', 'background', 'font-color', 'border-color'].indexOf(declaration.property) !== -1) {
                if (isTopColor(declaration.value)) {
                    declaration.value = options.topColor;
                    copyDeclarations.push(declaration);
                } else if (isDownColor(declaration.value)) {
                    declaration.value = options.downColor;
                    copyDeclarations.push(declaration);
                } else {
                    // unknown colour encounterd
                    addUnmatchedColor(declaration.value);
                }
            }
        }
        return copyDeclarations;
    }

    function leaveOnlyColorRules(rules) {
        var copyRules = [], rule;
        var rulesObj = {}, mediaRulesObj = {};
        var isThisChanged = false;

        for (var i = 0; i < rules.length; ++i) {

            rule = clone(rules[i]);
            if (rule.type === 'media') {
                mediaRulesObj = leaveOnlyColorRules(rule.rules); //recursive
                if (mediaRulesObj.isChanged) {
                    isThisChanged = true;
                    rule.rules = mediaRulesObj.rules;
                }
            } else if (rule.type === 'rule') {
                rule.selectors = enhanceSelectors(rule.selectors);
                rule.declarations = leaveOnlyColorDeclarations(rule.declarations);
            }

            if (['media', 'rule'].indexOf(rule.type) != -1) {
                copyRules.push(rule);
            }
        }
        return {isChanged : isThisChanged,
                rules : copyRules
                };
    }

    rulesObj = leaveOnlyColorRules(rules);

    var commentRule = {};
    commentRule.type = 'comment';
    commentRule.comment = ' Colors encountered without mapping: ' + unmatchedColors.join(' ');
    rulesObj.rules.push(commentRule);

    parsed.stylesheet.rules = rulesObj.rules;

    return stringifyCss(parsed);
};
