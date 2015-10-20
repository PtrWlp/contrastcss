var parseCss = require('css-parse');
var stringifyCss = require('css-stringify');

module.exports = function (css, options) {

    function unifyColor(color){
        function componentToHex(c) {
            if (!c && c !== 0) {
                return null;
            }
            var hex = c.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }

        var c = color, r, g, b;

        // basic colors to their hash value
        var textColors = {
                aliceblue: "#F0F8FF", antiquewhite: "#FAEBD7", aqua: "#00FFFF", aquamarine: "#7FFFD4", azure: "#F0FFFF",
                beige: "#F5F5DC", bisque: "#FFE4C4", black: "#000000", blanchedalmond: "#FFEBCD", blue: "#0000FF", blueviolet: "#8A2BE2", brown: "#A52A2A", burlywood: "#DEB887",
                cadetblue: "#5F9EA0", chartreuse: "#7FFF00", chocolate: "#D2691E", coral: "#FF7F50", cornflowerblue: "#6495ED", cornsilk: "#FFF8DC", crimson: "#DC143C", cyan: "#00FFFF",
                darkblue: "#00008B", darkcyan: "#008B8B", darkgoldenrod: "#B8860B", darkgray: "#A9A9A9", darkgrey: "#A9A9A9", darkgreen: "#006400", darkkhaki: "#BDB76B",
                darkmagenta: "#8B008B", darkolivegreen: "#556B2F", darkorange: "#FF8C00", darkorchid: "#9932CC", darkred: "#8B0000", darksalmon: "#E9967A",
                darkseagreen: "#8FBC8F", darkslateblue: "#483D8B", darkslategray: "#2F4F4F", darkslategrey: "#2F4F4F", darkturquoise: "#00CED1", darkviolet: "#9400D3",
                deeppink: "#FF1493", deepskyblue: "#00BFFF", dimGray: "#696969", dimgrey: "#696969", dodgerblue: "#1E90FF",
                firebrick: "#B22222", floralwhite: "#FFFAF0", forestgreen: "#228B22", fuchsia: "#FF00FF",
                gainsboro: "#DCDCDC", ghostWhite: "#F8F8FF", gold: "#FFD700", goldenrod: "#DAA520", gray: "#808080", grey: "#808080", green: "#008000", greenyellow: "#ADFF2F",
                honeydew: "#F0FFF0", hotpink: "#FF69B4", indianred : "#CD5C5C", indigo : "#4B0082", ivory: "#FFFFF0", khaki: "#F0E68C",
                lavender: "#E6E6FA", lavenderblush: "#FFF0F5", lawngreen: "#7CFC00", lemonchiffon: "#FFFACD",  lightblue: "#ADD8E6", lightcoral: "#F08080", lightcyan: "#E0FFFF",
                lightgoldenrodyellow: "#FAFAD2", lightgray: "#D3D3D3", lightgrey: "#D3D3D3", lightgreen: "#90EE90", lightpink: "#FFB6C1", lightsalmon: "#FFA07A",
                lightseagreen: "#20B2AA", lightskyblue: "#87CEFA", lightslategray: "#778899", lightslategrey: "#778899",
                lightsteelblue: "#B0C4DE", lightyellow: "#FFFFE0", lime: "#00FF00", limegreen: "#32CD32", linen: "#FAF0E6",
                magenta: "#FF00FF", maroon: "#800000", mediumaquamarine: "#66CDAA", mediumblue: "#0000CD", mediumorchid: "#BA55D3",  mediumpurple: "#9370D8",
                mediumseagreen: "#3CB371", mediumslateblue: "#7B68EE", mediumspringgreen: "#00FA9A", mediumTurquoise: "#48D1CC", mediumvioletred: "#C71585",
                midnightblue: "#191970", mintcream: "#F5FFFA", mistyrose: "#FFE4E1", moccasin: "#FFE4B5", navajowhite: "#FFDEAD", navy: "#000080",
                oldlace: "#FDF5E6", olive: "#808000", olivedrab: "#6B8E23", orange: "#FFA500", orangered: "#FF4500", orchid: "#DA70D6",
                palegoldenrod: "#EEE8AA", palegreen: "#98FB98", paleturquoise: "#AFEEEE", palevioletred: "#D87093", papayawhip: "#FFEFD5", peachpuff: "#FFDAB9", peru: "#CD853F",
                pink: "#FFC0CB", plum: "#DDA0DD", powderblue: "#B0E0E6", purple: "#800080", red: "#FF0000", rosybrown: "#BC8F8F", royalblue: "#4169E1",
                saddlebrown: "#8B4513", salmon: "#FA8072", sandybrown: "#F4A460", seagreen: "#2E8B57", seashell: "#FFF5EE", sienna: "#A0522D", silver: "#C0C0C0", skyblue: "#87CEEB", slateblue: "#6A5ACD",
                slategray: "#708090", slategrey: "#708090", snow: "#FFFAFA", springgreen: "#00FF7F", steelblue: "#4682B4", tan: "#D2B48C", teal: "#008080", thistle: "#D8BFD8", tomato: "#FF6347", turquoise: "#40E0D0",
                violet: "#EE82EE", wheat: "#F5DEB3", white: "#FFFFFF", whitesmoke: "#F5F5F5", yellow: "#FFFF00", yellowgreen: "#9ACD32"
        };

        if (textColors[color.toLowerCase()]) {
            c = textColors[color.toLowerCase()];
        }


        if (c.charAt(0) === "#") {
            // Hex Color, either short or long
            if (c.length === 7) {
                r = parseInt(c.substr(1,2),16);
                g = parseInt(c.substr(3,2),16);
                b = parseInt(c.substr(5,2),16);
                return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
            } else if (c.length === 4 ) {
                r = parseInt(c.substr(1,1) + '' + c.substr(1,1),16);
                g = parseInt(c.substr(2,1) + '' + c.substr(2,1),16);
                b = parseInt(c.substr(3,1) + '' + c.substr(3,1),16);
                return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
            } else {
                return null;
            }


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
              return null;
            }

        } else {
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

        if (unmatchedColors.indexOf(unified) === -1) {
          unmatchedColors.push(unified);
        }
    }

    function clone(src) {
        var ret=(src instanceof Array ? [] : {});

        for(var key in src) {
            if(!src.hasOwnProperty(key)) { continue; }
            if(key === 'position') { continue; }

            var val=src[key];

            if(val && typeof(val)=='object') {
                if     (val instanceof Boolean) { val=Boolean(val);        }
                else if(val instanceof Number ) { val=Number (val);        }
                else if(val instanceof String ) { val=String (val);        }
                else                            { val=clone(val); }
                }
            ret[key]=val;
            }
        return ret;
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

    function enhanceSelectors(selectors) {
        for (var i = 0; i < selectors.length; ++i) {
            if (selectors[i] === 'html') {
                selectors[i] = selectors[i] + ' .' + bodyprefix; // all classes within html
            } else if (selectors[i] === 'body' || selectors[i] === '.g-root') {
                selectors[i] = selectors[i] + '.' + bodyprefix; // all body having class. Freak adds g-root to body
            } else {
                selectors[i] = '.' + bodyprefix + ' ' + selectors[i]; // all other, under body tag
            }
        }
        return selectors;
    }

    function isolateColorFromDeclaration(declaration) {
        var color = unifyColor(declaration.value);

        if (color !== null) {
            // done. The declaration only held a valid color.
            return declaration.value;
        }

        if (declaration.value.indexOf('url') !== -1) {
            return null;
        }

        // maybe shorthand or with !important declaration.
        var declarationParts = declaration.value.split(' ');
        for (var i = 0; i < declarationParts.length; ++i) {
            color = unifyColor(declarationParts[i]);
            if (color !== null) {
                // Found a valid color in the list of declarations. Bail out.
                return declarationParts[i];
            }
        }

        return null;
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
        var declarationsThatHaveColor = ['color',
                                         'background',
                                         'background-color',
                                         'font-color',
                                         'border',
                                         'border-color',
                                         'border-top',
                                         'border-left',
                                         'border-bottom',
                                         'border-right'];
        return (declarationsThatHaveColor.indexOf(property) !== -1);
    }

    function leaveOnlyColorDeclarations(declarations) {
        var copyDeclarations = [], declaration;
        var isThisChanged = false;
        var isolatedColor, alternativeColor, colorMappedTo;

        for (var i = 0; i < declarations.length; ++i) {
            declaration = clone(declarations[i]);

            if (doesPropertyHaveColor(declaration.property) &&
                ['transparent', 'none', 'inherit', 'initial'].indexOf(declaration.value.toLowerCase()) === -1 &&
                declaration.value !== '0') {

                isolatedColor = isolateColorFromDeclaration(declaration);

                if (isolatedColor !== null) {

                    colorMappedTo = colorMapped(isolatedColor);
                    if (colorMappedTo === 'unknown') {
                        // unknown colour encounterd
                        // if (luminosity(unifyColor(declaration.value)) <= 112) {
                        //     declaration.value = options.downColor;
                        //  } else {
                        //     declaration.value = options.topColor;
                        //  }
                        //copyDeclarations.push(declaration);
                        //isThisChanged = true;
                        addUnmatchedColor(declaration.value);
                        continue; // Abandon processing this iteration
                    }

                    // here, the colorMappedTo is either top or down
                    if (colorMappedTo === 'top') {
                        alternativeColor = options.topColor;
                    } else {
                        alternativeColor = options.downColor;
                    }

                    // Selector that holds inverted colors should be coded here TODO

                    if (isolatedColor !== declaration.value) {
                        // Complex color, maybe shorthand or linear-gradient
                        if (declaration.value.indexOf('linear-gradient') !== -1) {
                            declaration.value = 'none';
                        } else {
                            var re = new RegExp(isolatedColor, 'i');
                            declaration.value = declaration.value.replace(re, alternativeColor);
                        }
                    } else {
                        declaration.value = alternativeColor;
                    }

                    copyDeclarations.push(declaration);
                    isThisChanged = true;

                }
            }
        }
        return  {isChanged : isThisChanged,
                declarations : copyDeclarations
                };
    }

    function leaveOnlyColorRules(rules, isRecursive) {
        var copyRules = [], rule;
        var rulesObj = {}, mediaRulesObj = {}, declarationsObj = {};
        var isThisChanged = false;

        for (var i = 0; i < rules.length; ++i) {

            isThisChanged = false;
            rule = clone(rules[i]);

            if (isRecursive !== true) {
                logRequired = (i===LogRuleNr || LogRuleNr===-1);
            }


            if (rule.type === 'media') {
                mediaRulesObj = leaveOnlyColorRules(rule.rules, true); //recursive
                if (mediaRulesObj.isChanged) {
                    isThisChanged = true;
                    rule.rules = mediaRulesObj.rules;
                }
            } else if (rule.type === 'rule') {
                declarationsObj = leaveOnlyColorDeclarations(rule.declarations);
                if (declarationsObj.isChanged) {
                    rule.selectors = enhanceSelectors(rule.selectors);
                    rule.declarations = declarationsObj.declarations;
                    isThisChanged = true;
                }
            }

            if (isThisChanged && rule.type !== 'comment') {
                copyRules.push(rule);
            }
        }

        return {isChanged : isThisChanged,
                rules : copyRules
                };
    }

    // Here is the start of the actual process
    var parsed = parseCss(css);
    var rules = parsed.stylesheet.rules;

    var rulesObj = leaveOnlyColorRules(rules);

    parsed.stylesheet.rules = rulesObj.rules;

    var cssOutput = stringifyCss(parsed, {compress: true});
    // Add extra lines for readability
    cssOutput = cssOutput.replace(/(})/gm,'}\n'); // '}' is the end of a line
    cssOutput = cssOutput.replace(/(;})/gm,'}\n');  // ';}' semicolon needless

    var commentLine =  '/* These are highcontrast additions for duotone:' + options.topColor + "/" + options.downColor + ' */\n';

    return commentLine + cssOutput;
};
