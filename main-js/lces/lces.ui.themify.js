function lcesAppendCSS(className, css, before) {
  var head  = document.getElementsByTagName("head")[0];
  var style = document.createElement("style");
  
  style.className = className;
  style.appendChild(document.createTextNode(css));
  
  if (!before || !(before instanceof Node))
    head.appendChild(style);
  else
    head.insertBefore(style, before);
  
  return style;
}

// Will be amended by LCES builder
lcesAppendCSS("lces-core-styles", "LCES_STYLES_CORE", document.getElementsByClassName("lces-themify-styles")[0]);
lcesAppendCSS("lces-responsive-styles", "LCES_STYLES_RESPONSIVE", document.getElementsByClassName("lces-themify-styles")[0]);

if (lces.appendColorize !== false)
  lcesAppendCSS("lces-themify-styles lces-ui-colorize-src", "LCES_STYLES_THEMIFY");

lces.themify = {
  colorize: function(r, g, b) {
    var quit;
    
    // Validate color values
    var values = [r, g, b].map(function(value) {
      if (typeof value !== "number" || isNaN(value) || value < 0 || value > 255)
        quit = true;
      
      return Math.round(value);
    });
    
    // Check for invalid color value flag
    if (quit)
      return false;
    
    var css = jSh(".lces-themify-styles")[0];
    
    // Check for lces themify
    if (!css)
      return false;
    
    // Colorize CSS
    cssStr = lces.css.colorize(css, values[0], values[1], values[2]);
    
    // Add new color
    css.removeChild(css.childNodes[0]);
    css.appendChild(jSh.t(cssStr));
  }
};

lces.themify.colorize.compile = function compile() {
  var styles = jSh.toArr(document.getElementsByClassName("lces-ui-colorize-src"));
  
  styles.forEach(function(st) {
    st.lcesColorizeSrc = st.childNodes[0].nodeValue;
    st.removeChild(st.childNodes[0]);
    
    var compiled = compile.compileSrc(st.lcesColorizeSrc);
    
    var compiledStyles = document.createTextNode(compiled);
    st.appendChild(compiledStyles);
  });
}

lces.themify.colorize.compile.compileSrc = function(src) {
  src = src.replace(/lc-rgbhsv\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+\s*\)/g, "rgb($1,$2,$3)");
  src = src.replace(/lc-rgbahsv\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+(\.\d+)?)\s*,\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+\s*\)/g, "rgba($1,$2,$3,$4)");
  
  return src;
}

// Hide all ugly things till lces comes to.
var lcesHiddenStuff = lcesAppendCSS("lces-hidden-stuff", lces.preHideThemify !== false ? ".lces-themify{opacity:0;}" : "");
  
lces.rc[50] = function() {
  lces.addInit(function() {
    lcesHiddenStuff.disabled = "disabled";
    
    // Compile lcesColorizeSources
    lces.themify.colorize.compile();
  });
}
  
