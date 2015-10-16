var parseCss = require('css-parse');
var stringifyCss = require('css-stringify');

module.exports = function (css, options) {

var LogRuleNr = 10000;
var logRequired = false;
function logThis(label, log, always) {
    if (logRequired || always) {
        console.log(label + ": ", log);
    }
}

    var parsed = parseCss(css);
    var rules = parsed.stylesheet.rules;

logThis('Selected rule for logging', LogRuleNr, true);
logThis('options', options, true);
logThis('----------', '', true);

    function unifyColor(color){
        function componentToHex(c) {
            if (!c) {
                return null;
            }
            var hex = c.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }

        var c = color, r, g, b;

        // basic colors to their hash value
        var textColors = {
           white: "#000",
           black: "#fff",
           red: "#f00"
        };

        if (textColors[color.toLowerCase()]) {
            c = textColors[color.toLowerCase()];
        }

        if (c.charAt(0) === "#") {
            // Hex Color, either short or long
            if (c.length === 7) {
                r = parseInt(c.substr(1,2),16);
                g = parseInt(c.substr(3,2),16);
                b = parseInt(c.substr(6,2),16);
            }
            if (c.length === 4 ) {
                r = parseInt(c.substr(1,1) + '' + c.substr(1,1),16);
                g = parseInt(c.substr(2,1) + '' + c.substr(2,1),16);
                b = parseInt(c.substr(3,1) + '' + c.substr(3,1),16);
            }
            return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);

        } else if(c.toLowerCase().indexOf('rgb') > -1) {
            var re = /\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*/gmi;
            var m;
            var splitm;

            if ((m = re.exec(c)) !== null) {
                if (m.index === re.lastIndex) {
                    re.lastIndex++;
                }
                splitm = m[0].split(',');
                r = parseInt(splitm[0].trim());
                g = parseInt(splitm[1].trim());
                b = parseInt(splitm[2].trim());

               return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);

            } else {
console.log('weird color foud', color);
              return null;
            }

        } else {
console.log('weird color foud', color);
            return null;
        }
    }

    function unifyColorList(listOfColors) {
        var unifiedList = [];
        for (var i = 0; i < listOfColors.length; ++i) {
            unifiedList.push(unifyColor(listOfColors[i]));
        }
        return unifiedList;
    }

    var bodyprefix = options.bodyprefix;
    var colorsToTopColor = unifyColorList(options.colorsToTopColor);
    var colorsToDownColor = unifyColorList(options.colorsToDownColor);
    var unifiedTopColor = unifyColor(options.topColor);
    var unifiedDownColor = unifyColor(options.downColor);

    var unmatchedColors = [];

    function addUnmatchedColor(color) {
        var unified = unifyColor(color);

        if (unified.r === unifiedTopColor.r && unified.g === unifiedTopColor.g && unified.b === unifiedTopColor.b) {
            return;
        }

        if (unified.r === unifiedDownColor.r && unified.g === unifiedDownColor.g && unified.b === unifiedDownColor.b) {
            return;
        }

        if (unmatchedColors.indexOf(color) === -1) {
          unmatchedColors.push(color);
        }
    }

    function clone(source) {
        var destination = {};
        for (var property in source) {
            if (typeof source[property] === "object" && source[property] !== null && destination[property]) {
                destination[property] = clone(source[property]);  // recursive
            } else {
                destination[property] = source[property];
            }
        }
        return destination;
    }

    function luminosity(color) {
        // Accepts only unified colors
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
        if (result) {
            // Luminosity. (approximate)
            var lum = 0.375*parseInt(result[1], 16) +
                      0.5*parseInt(result[2], 16) +
                      0.125*parseInt(result[3], 16);
            return lum;
        }
        return null;
    }

    function compareColors(left, right) {

        var l = unifyColor(left);
        var r =unifyColor(right);

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

    function isComplex(color) {
        var result = false;
        if (color.indexOf('linear-gradient') !== -1) {
            result = true;
        }
        if (color.indexOf('url') !== -1) {
            result = true;
        }

        return result;
    }

    function colorMapped(color) {
        var unifiedColor = unifyColor(color);
        if (colorsToTopColor.indexOf(unifiedColor) !== -1) {
            return 'top';
        }
        if (colorsToDownColor.indexOf(unifiedColor) !== -1) {
            return 'down';
        }
        return 'unknown';
    }

    function doesPropertyHaveColor(property) {
        var declarationsThatHaveColor = ['color', 'background', 'font-color', 'border-color'];
        return (declarationsThatHaveColor.indexOf(property) !== -1);
    }

    function leaveOnlyColorDeclarations(declarations) {
        var copyDeclarations = [], declaration;
        var isThisChanged = false;

        for (var i = 0; i < declarations.length; ++i) {
            declaration = clone(declarations[i]);

            if (doesPropertyHaveColor(declaration.property) &&
                declaration.value.toLowerCase() !== 'transparent' &&
                declaration.value.toLowerCase() !== 'none') {

                if (isComplex(declaration.value)) {
                    // do nothning for now
                } else if (colorMapped(declaration.value) === 'top') {
                    declaration.value = options.topColor;
                    copyDeclarations.push(declaration);
                    isThisChanged = true;
                } else if (colorMapped(declaration.value) === 'down') {
                    declaration.value = options.downColor;
                    copyDeclarations.push(declaration);
                    isThisChanged = true;
                } else {
                    // unknown colour encounterd
                    if (luminosity(unifyColor(declaration.value)) <= 127) {
                        declaration.value = options.downColor;
                     } else {
                        declaration.value = options.topColor;
                     }
                    //copyDeclarations.push(declaration);
                    //isThisChanged = true;
                    addUnmatchedColor(declaration.value);
                }
            }
        }
        return  {isChanged : isThisChanged,
                declarations : copyDeclarations
                };
    }

    function leaveOnlyColorRules(rules) {
        var copyRules = [], rule;
        var rulesObj = {}, mediaRulesObj = {}, declarationsObj = {};
        var isThisChanged = false;

        for (var i = 0; i < rules.length; ++i) {

logRequired = (i===LogRuleNr || LogRuleNr===-1);
            rule = clone(rules[i]);
logThis('Rule', rule);
            if (rule.type === 'media') {
                mediaRulesObj = leaveOnlyColorRules(rule.rules); //recursive
                if (mediaRulesObj.isChanged) {
                    isThisChanged = true;
                    rule.rules = mediaRulesObj.rules;
                }
            } else if (rule.type === 'rule') {
                declarationsObj = leaveOnlyColorDeclarations(rule.declarations);
                if (declarationsObj.isChanged) {
                    rule.selectors = enhanceSelectors(rule.selectors);
                    rule.declarations = declarationsObj.declarations;
                }
                isThisChanged = declarationsObj.isChanged;
            }

            if (isThisChanged && rule.type !== 'comment') {
                copyRules.push(rule);
            }
        }
        return {isChanged : isThisChanged,
                rules : copyRules
                };
    }

    var rulesObj = leaveOnlyColorRules(rules);

    parsed.stylesheet.rules = rulesObj.rules;

    var cssOutput = stringifyCss(parsed, {compress: true});
    // Add extra lines for readability
    cssOutput = cssOutput.replace(/(})/gm,'}\n');
    cssOutput = cssOutput.replace(/(\){)/gm,'){\n');
//    console.log(cssOutput);

    console.log(unmatchedColors.length + ' Colors encountered without mapping: ' + unmatchedColors.join(' '));

    var commentLine =  '/* These are highcontrast additions for duotone:' + options.topColor + "/" + options.downColor + ' */\n';

    return commentLine + cssOutput;
};
