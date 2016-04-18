#! /usr/local/bin/node

// LCES Builder - Based off of AUR's builder

// Require deps
var fs       = require("fs");
var path     = require("path");
var uglifyjs = require("uglify-js");
var babel    = require("babel-core");

// CD to the current dir
process.chdir(path.dirname(process.argv[1]));

// Current time
var time = (new Date()).toGMTString().replace(/ GMT|,/ig,"").replace(/:/g,".").replace(/\s/g,"-").toLowerCase();

function multipleArg(i, arr, dump, comma) {
  i++;
  var arg     = arr[i];
  var nextArg = arr[i + 1];
  
  var following = true;
  var follow    = /^(?!\-)(?:[a-z\d\-]+,)+$/i;
  var followcap = /^(?:[a-z\d\-]+,)*[a-z\d\-]+$/i;
  var stoploop;
  
  while (!stoploop && (!comma || (nextArg && (follow.test(arg) || following && followcap.test(arg))))) {
    if (comma)
      dump.push.apply(dump, arg.trim().toLowerCase().split(/\s*,\s*/).filter(s => !!s.trim()));
    else
      dump.push(arg);
    
    // Set follow flag to continue to next argument
    following = follow.test(arg);
    
    i++;
    arg       = nextArg;
    nextArg   = arr[i];
    
    if (!comma && (!nextArg || nextArg.trim()[0] === "-"))
      stoploop = true;
  }
  
  return i;
}

// Arguments
var out   = null;
var cat   = null;
var debug = null;
var excl  = ["lces.ui.themify.js", "lces.core.js"];
var incl  = [];

// Loop arguments
var args = process.argv.slice(2);

for (var i=0,l=args.length; i<l; i++) {
  var arg = args[i];
  
  if (arg[0] === "-") {
    switch (arg.toLowerCase()) {
      case "-cat":
        cat = true;
      break;
      
      case "-debug":
        debug = true;
      break;
      
      case "-excl":
        i = multipleArg(i, args, excl);
      break;
      
      case "-add":
        i = multipleArg(i, args, incl);
      break;
    }
  } else {
    out = arg;
  }
}

// Get paths
var LCPATH = path.dirname(process.argv[1]) + "/";
var LCOUT  = out || `${LCPATH}build/bleeding/lces.build.${time}.js`;

// LCES uncompliled source cram
var LCSRC = "";

// LCES Special Source
var special = {
  "lces.ui.themify.js": function(src) {
    var coreStyles  = srcEscape(getFile(LCPATH + "main-css/lces.core.min.css", true));
    var respStyles  = srcEscape(getFile(LCPATH + "main-css/lces.responsive.min.css", true));
    var themeStyles = srcEscape(getFile(LCPATH + "main-css/lces.themify.css", true));
    
    src = src.replace(/LCES_STYLES_CORE/, coreStyles);
    src = src.replace(/LCES_STYLES_RESPONSIVE/, coreStyles);
    src = src.replace(/LCES_STYLES_THEMIFY/, themeStyles);
    
    return src;
  }
};

// Source fetching functions
function srcEscape(src) {
  src = src.replace(/\\/g, "\\\\");
  src = src.replace(/\$/g, "\\$");
  src = src.replace(/`/g, "\\`");
  src = src.replace(/"/g, "\\\"");
  src = src.replace(/'/g, "\\'");
  src = src.replace(/\n/g, "\\n");
  
  return src;
}

function getFile(fpath, ret) {
  var src   = fs.readFileSync(fpath, {encoding: "utf8"});
  var fname = path.basename(fpath);
  
  // Check for special handlers
  if (special[fname])
    src = special[fname](src);
  
  if (ret)
    return src;
  
  LCSRC += "\n\n" + src;
}

function getFolder(fpath) {
  var files = fs.readdirSync(fpath);
  
  function addFile(src, file) {
    var push = excl.every(n => file.toLowerCase().indexOf(n.toLowerCase()) === -1);
    
    if (push) {
      var fsrc = getFile(fpath + "/" + file, true);
      
      return src + fsrc;
    } else
      return src;
  }
  
  files[0] = addFile("", files[0]);
  LCSRC += files.reduce(addFile);
}

function uglify(src) {
  return uglifyjs.minify(src, {
    fromString: true,
    compress: {
      sequences     : true,  // join consecutive statemets with the “comma operator”
      properties    : true,  // optimize property access: a["foo"] → a.foo
      dead_code     : true,  // discard unreachable code
      drop_debugger : true,  // discard “debugger” statements
      unsafe        : false, // some unsafe optimizations (see below)
      conditionals  : true,  // optimize if-s and conditional expressions
      comparisons   : true,  // optimize comparisons
      evaluate      : true,  // evaluate constant expressions
      booleans      : true,  // optimize boolean expressions
      loops         : true,  // optimize loops
      unused        : true,  // drop unused variables/functions
      hoist_funs    : true,  // hoist function declarations
      hoist_vars    : false, // hoist variable declarations
      if_return     : true,  // optimize if-s followed by return/continue
      join_vars     : true,  // join var declarations
      cascade       : true,  // try to cascade `right` into `left` in sequences
      side_effects  : true,  // drop side-effect-free statements
      warnings      : true   // warn about potentially dangerous optimizations/code
    },
    mangle: true
  }).code;
}

// Get core files
getFile(LCPATH + "main-js/misc/jShorts2.js");
getFile(LCPATH + "main-js/misc/css.essentials.js");
getFile(LCPATH + "main-js/lces/lces.core.js");
getFile(LCPATH + "main-js/lces/lces.ui.themify.js");

// Get core modules
getFolder(LCPATH + "main-js/lces");

// Get extra modules if any
incl.forEach(file => LCSRC += getFile(file));

// Transform to ES5.1
var result = cat ? LCSRC : babel.transform(LCSRC, {presets: ["es2015"]}).code;
// Uglify this shit
result = cat ? result : uglify(result);

// Concat everything
result = `${debug ? `try { ` : ""} ${result} ${debug ? ` } catch (e) { alert(e + "\\n\\n\\n" + e.stack); }` : ""}`;

// Write it out
fs.writeFileSync(LCOUT, result);
