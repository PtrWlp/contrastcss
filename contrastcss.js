var parseCss = require('css-parse');
var stringifyCss = require('css-stringify');

module.exports = function (css, options) {
    var parsed, rules;

    parsed = parseCss(css);
    //colorRules = [];
    rules = parsed.stylesheet.rules;
console.log(options);
console.log('-------------');

var LogRuleNr = 0;
var logThis = false;

    var bodyprefix = options.bodyprefix;
    var colorsToTopColor = options.colorsToTopColor[0];
    var colorsToBottomColor = options.colorsToBottomColor[0];


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

    function isBottomColor(color) {
        return isColorInList(color, options.colorsToBottomColor);
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
            declaration = declarations[i];
if (logThis) {
    console.log('Declaration: ', declaration);
}
            if (['color', 'background', 'font-color', 'border-color'].indexOf(declaration.property) !== -1) {
                if (isTopColor(declaration.value)) {
if (logThis) {
    console.log('topcolor: ', declaration.value);
}
                    declaration.value = options.topColor;
                    copyDeclarations.push(declaration);

                } else if (isTopColor(declaration.value)) {
if (logThis) {
    console.log('bottomcolor: ', declaration.value);
}
                    declaration.value = options.bottomColor;
                    copyDeclarations.push(declaration);
                }
            }
        }
if (logThis) {
    console.log('Altered Declaration: ', copyDeclarations);
}
        return copyDeclarations;
    }

    function leaveOnlyColorRules(rules) {
        var copyRules = [];
        var copyRule = {};

        for (var i = 0; i < rules.length; ++i) {
logThis = (i===LogRuleNr);
if (logThis) {
    console.log('Rule selectors: ', rules[i].selectors);
}
            if (rules[i].type === 'media') {
                copyRule = {};
                copyRule.type = 'media';
                copyRule.media = rules[i].media;
                copyRule.rules = leaveOnlyColorRules(rules[i].rules); //recursive
            } else {
                copyRule = {};
                copyRule.type = 'rule';
                copyRule.selectors = enhanceSelectors(rules[i].selectors);

                copyRule.declarations = leaveOnlyColorDeclarations(rules[i].declarations);
            }
            copyRules.push(copyRule);
        }
        return copyRules;
    }

    parsed.stylesheet.rules = leaveOnlyColorRules(rules);
    return stringifyCss(parsed);
};
