lces.rc[9] = function() {
  // lces colorize global variable
  lces.css = {};

  // lces.css.colorize(css, r, g, b)
  //
  // css: String with CSS style rules
  // r, g, b: Red/Green/Blue Channel values with 0-255 range
  //
  // Takes the css rule string passed as the first argument
  // and scans and replaces the color values of properties,
  // be them a Hex, or rgba/rgba function value.
  //
  // Currently has no effect on HSV functions.
  // Later version: Supports lc-rgbhsv and lc-rgbahsv functions.
  lces.css.colorize = function(css, r, g, b) {
    var cssColorizeSrc = false;
    
    // Check for colorized CSS source
    if (typeof css !== "string") {
      cssColorizeSrc = css;
      
      css = css.lcesColorizeSrc;
    }
    
    var hexNum  = function(n) {return (parseInt(n, 16) < 17 ? "00".substr(n.length) : "") + n + (parseInt(n, 16) > 16 ? "00".substr(n.length) : "");};
    hexNum.full = function(r, g, b) {return "#" + hexNum(r.toString(16)) + hexNum(g.toString(16)) + hexNum(b.toString(16));}
    
    // For direct conversion
    var hex = hexNum.full(r, g, b);
    
    // Filter and dump CSS
    css = css.replace(/rgb(a?)\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*((?:,\s*\d{1}(?:\.\d+)?\s*)?)\)/gi, "rgb$1(" + r + ", " + g + ", " + b + "$2)");
    css = css.replace(/:\s*#(?:[\d\w]{3}|[\d\w]{6})\s*;/gi, ": " + hex + ";");
    
    // Check for lcesColorizeSource syntax
    if (cssColorizeSrc) {
      var rgbhsv  = /lc-rgbhsv\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+\s*\)/;
      var rgbahsv = /lc-rgbahsv\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(\d+(?:\.\d+)?)\s*,\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+\s*\)/;
      var bothhsv = /lc-rgba?hsv\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*\d+(?:\.\d+)?\s*)?,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/;
      
      // Get first lc-rgb(a)hsv(...) match
      var hsvOffset = css.match(bothhsv);
      var colorHSV  = lces.ui.RGB2HSV(r / 255, g / 255, b / 255);
      
      // Iterate rgbhsv functions
      while (hsvOffset) {
        var alpha   = hsvOffset[0].match(rgbahsv);
            alpha   = alpha ? alpha[1] : alpha;
        
        var isAlpha = isNaN(alpha) || !alpha && alpha !== 0 ? false : true;
        
        // Get HSV values
        var h = parseFloat(hsvOffset[1]);
        var s = parseFloat(hsvOffset[2]) / 100;
        var v = parseFloat(hsvOffset[3]) / 100;
        
        // Normalize Hue offset
        var hueOff = colorHSV.h + h;
            hueOff = Math.round(hueOff > 360 ? hueOff - 360 : hueOff < 0 ? hueOff + 360 : hueOff);
        
        var satOff = Math.max(Math.min(colorHSV.s + s, 1), 0);
        var valOff = Math.max(Math.min(colorHSV.v + v, 1), 0);
          
        // Make compiled rgb(a) function
        var rgb = lces.ui.HSV2RGB(hueOff, satOff, valOff).map(function(i) {return parseInt(i * 255);})
        var newProp = "rgb" + (isAlpha ? "a" : "") + "(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + (isAlpha ? "," + alpha : "") + ")";
        
        // Replace with compiled function
        css = css.slice(0, hsvOffset.index) + newProp + css.slice(hsvOffset.index + hsvOffset[0].length);
        
        // Next function
        hsvOffset = css.match(bothhsv);
      }
      
      // Add new CSS
      cssColorizeSrc.removeChild(cssColorizeSrc.childNodes[0]);
      cssColorizeSrc.appendChild(jSh.t(css));
    }
    
    return css;
  }

  // Appends css animation transition properties for color properties
  // in the provided CSS string
  lces.css.appendTransition = function(css, duration, timingFunction) {
    duration       = duration ? duration : "250ms";
    timingFunction = timingFunction ? timingFunction : "ease-out";
    
    return css.replace(/\n(\s*)([a-z\-]+):\s*(rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\.\d+)?\s*\)|#[a-z0-9]{3,6})\s*;/gi, "\n$1$2: $3;\n$1transition: $2 " + duration + " " + timingFunction + ";");
  }
}
