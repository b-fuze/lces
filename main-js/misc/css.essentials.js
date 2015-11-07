lces.rc[10] = function() {
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
  lces.css.colorize = function(css, r, g, b) {
    var hexNum = function(n) {return (parseInt(n, 16) < 17 ? "00".substr(n.length) : "") + n + (parseInt(n, 16) > 16 ? "00".substr(n.length) : "");};
    var hex = "#" + hexNum(r.toString(16)) + hexNum(g.toString(16)) + hexNum(b.toString(16));
    
    // Filter and dump CSS
    css = css.replace(/rgb(a?)\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*((?:,\s*\d{1}(?:\.\d+)?\s*)?)\)/gi, "rgb$1(" + r + ", " + g + ", " + b + "$2)");
    return css.replace(/:\s*#(?:[\d\w]{3}|[\d\w]{6})\s*;/gi, ": " + hex + ";");
  }

  // Appends css animation transition properties for color properties
  // in the provided CSS string
  lces.css.appendTransition = function(css, duration, timingFunction) {
    duration       = duration ? duration : "250ms";
    timingFunction = timingFunction ? timingFunction : "ease-out";
    
    return css.replace(/\n(\s*)([a-z\-]+):\s*(rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\.\d+)?\s*\)|#[a-z0-9]{3,6})\s*;/gi, "\n$1$2: $3;\n$1transition: $2 " + duration + " " + timingFunction + ";");
  }
}
