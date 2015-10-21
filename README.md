### What is this for?
Postprocessing CSS file to create high-contrast style addon. For accessibility.
Not final version yet. 
Todo: 
- Make it work under postcss
- figure out how to drop gradients and boxshadows etc.

### Usage
- Install it: `npm install`
- Execute: `npm run contrastcss input.css output.css` 
  This generates a file with only the css rules about color, prefixed with a body-class.

### Notes
Configure your colors with a hightcontrast replacement. 
```js
    contrastcss: {
        blackonwhite: {
            options: {
                bodyprefix : 'myproject-contrast-bow',
                colorsToTopColor: ['#00a1de','#003145'],
                colorsToDownColor: ['#fff', '#c9dde6'],
                selectorsWithTopDownSwapped: ['.g-btn-primary span'],
                topColor: '#000',
                downColor: '#fff'
            },
            files: {
                'target/css/myproject-bow.css': ['target/css/myproject.css'],
            },
        }
```

Configure options and autoIndexer. 
```js

  var colorsToTopColor = ['#000000', '#010101'];
  var colorsToDownColor = ['#fff', '#c9dde6'];
  var selectorsWithTopDownSwapped = ['.myproject-page-bow'];
  var selectorsUntouched = ['.please-leave-untouched span'];
  var autoIndexColorsByLuminosity = true;  // or false or omitted
  var autoIndexLuminosityBreakpoint = 112;  // between 1 and 225, hex representation of luminosity. Default is 112

  contrastcss: {
      blackonwhite: {
          options: {
              bodyprefix : 'myproject-contrast-bow',
              topColor: '#000',
              downColor: '#fff',
              colorsToTopColor: colorsToTopColor,
              colorsToDownColor: colorsToDownColor,
              selectorsUntouched: selectorsUntouched,
              selectorsWithTopDownSwapped: selectorsWithTopDownSwapped,
              autoIndexColorsByLuminosity: autoIndexColorsByLuminosity,
              autoIndexLuminosityBreakpoint: autoIndexLuminosityBreakpoint

          },
          files: {
                'target/css/myproject-bow.css': ['target/css/myproject.css'],
          },
      },
      yellowonblack: {
          options: {
              bodyprefix : 'myproject-contrast-yob',
              topColor: '#ff0', // yellow
              downColor: '#000', //black
              colorsToTopColor: colorsToTopColor.push('#020202'),
              colorsToDownColor: colorsToDownColor,
              selectorsUntouched: selectorsUntouched,
              selectorsWithTopDownSwapped: selectorsWithTopDownSwapped,
              autoIndexColorsByLuminosity: autoIndexColorsByLuminosity,
              autoIndexLuminosityBreakpoint: autoIndexLuminosityBreakpoint
          },
          files: {
                'target/css/myproject-yob.css': ['target/css/myproject.css'],
          },
    }});
```
  
