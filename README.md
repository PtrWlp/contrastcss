### What is this for?
Postprocessing CSS file to create high-contrast style addon. For accessibility.
Not Nearly Finished. Sorry. 
Todo: 
- Make it work under postcss
- convert "border: 1px solid #111111" into "border-color: #000"
- figure out how to drop gradients and boxshadows etc.

### Usage
- Install it: `npm install`
- Execute: `npm run contrastcss input.css output.css` ( with a config. tbd, describe how to do so)   
  This generates a file with only the css rules about color, prefixed with a body-class.

### Notes
Configure your colors with a hightcontrast replacement. 
'''js
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
 '''

  
