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
// jShorts 2 Code
//
// Supposed to shorten my writing of vanilla JS, some quick shortcuts.

lces.rc[0] = function() {
  
  window.undf = undefined;

  // Quick console prone errors mitigation
  if (!window.console)
    Object.defineProperty(window, "console", {
      value: {
        log: function() {},
        error: function() {},
        table: {}
      },
      writable: false,
      configurable: false,
      enumerable: true
    });

  // Main DOM Manipulation function
  window.jSh = function jSh(src, first) {
    if (typeof src === "string") {
      // "Locate" mode
      
      var parent   = this === window ? document : (this instanceof Node || jSh.MockupElement && this instanceof jSh.MockupElement ? this : (lces && this instanceof lcWidget ? this.element : document));
      var selector = jSh.determineSelector(src);
      
      
      return jSh.shorten(jSh[selector](selector === "queryAll" || selector === "tag"? src : src.substr(1), parent, first));
    } else {
      // "Shorten" mode
      // In this mode «first» is referring to whether to enclose it in an lcWidget
      
      var e = jSh.determineType(src);
      
      if (!e)
        return false;
      
      if (first)
        new lcWidget(e);
      
      jSh.shorten(e);
      
      return e;
    }
  }


  // JS functions

  // Check something's type when typeof isn't reliable
  jSh.type = function(obj) {
    return Object.prototype.toString.call(obj).replace(/\[object\s([\w\d]+)\]/, "$1").toLowerCase();
  }

  jSh.pushItems = function(array) {
    var items = jSh.toArr(arguments).slice(1);
    
    items.forEach(function(i) {
      array.push(i);
    });
  }

  jSh.spliceItem = function(array) {
    var items = jSh.toArr(arguments).slice(1);
    
    items.forEach(function(i) {
      var index = array.indexOf(i);
      
      if (index !== -1)
        array.splice(index, 1);
    });
  }

  // Convert array-like object to an array
  jSh.toArr = function(arr) {
    return Array.prototype.slice.call(arr);
  }

  // Returns first item if array length is 1, otherwise the whole array
  jSh.oneOrArr = function(arr) {
    return arr.length === 1 ? arr[0] : arr;
  }

  // Check for multiple arguments or an array as the first argument for functions of single arity
  jSh.hasMultipleArgs = function(args, that) {
    var iterate = false;
    that = that || this;
    
    if (args.length > 1)
      iterate = jSh.toArr(args);
    if (jSh.type(args[0]) === "array")
      iterate = args[0];
    
    return iterate ? (iterate.forEach(function(i) {
      args.callee.call(that, i);
    }) ? true : true) : false;
  }

  // Extend the first object with the own properties of another, exclude is an array that contains properties to be excluded
  jSh.extendObj = function(obj, extension, exclude) {
    Object.getOwnPropertyNames(extension).forEach(function(i) {
      if (!exclude || exclude.indexOf(i) === -1)
        obj[i] = extension[i];
    });
    
    return obj;
  }

  // Make a function inherit another in the prototype chain
  jSh.inherit = function(child, parent) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
  }

  // Return string s multiplied 'n' integer times
  jSh.nChars = function(s, n) {
    s = s + "";
    n = isNaN(n) ? 1 : parseInt(n);
    
    var str = "";
    
    for (var i=0; i<n; i++) {
      str += s;
    }
    
    return str;
  }

  // To silently mitigate any JSON parse error exceptions to prevent the whole from self destructing
  jSh.parseJSON = function(jsonstr) {
    var result;
    
    try {
      result = JSON.parse(jsonstr);
    } catch (e) {
      console.warn(e);
      
      result = {error: "JSON parse failed.", data: null};
    }
    
    return result;
  }

  // DOM Creation Functions

  // Create HTML DOM Div elements with a flexible nesting system
  jSh.d = function node(className, text, child, attributes, properties, events) { // For creating an element
    var nsElm; // For things like SVG... Ugggh. :|
    
    if (!this.lcesElement){
      // Check if we need to make an element with a custom namespace URI
      if (this.lcesType) {
        var nsCheck = /^ns:[\w\d_]+:[^]+$/i.test(this.lcesType);
        
        if (!nsCheck)
          var n = jSh.e(this.lcesType);       // Create main element, if this isn't window, set to specified element.
        else {
          var nsURI = this.lcesType.replace(/^ns:[\w\d_]+:([^]+)$/i, "$1");
          var nsElm = this.lcesType.replace(/^ns:([\w\d_]+):[^]+$/i, "$1");
          
          var n = document.createElementNS(nsURI, nsElm);
        }
      } else {
        var n = jSh.e("div");
      }
    } else {
      // Element is already provided
      var n = this.lcesElement;
    }
    
    // Check if the args provided are all enclosed in an object
    if (typeof className == "object") {
      var args = className;

      className  = args.className || args.class;
      text       = args.text;
      child      = args.child || args.children;
      attributes = args.attributes || args.attr;
      properties = args.properties || args.prop || args.props;
      events     = args.events;
    }
    
    // Check for an arguments availability and apply it if detected
    
    // Check for special assignments in classname argument
    var id       = "";
    var newClass = "";
    
    if (className) {
      var validFormat = /^(?:#[a-zA-Z\d\-_]+)?(?:\.[a-zA-Z\d\-_]+)+$|^#[a-zA-Z\d\-_]+(?:\.[a-zA-Z\d\-_]+)*$/;
      var hasClass    = /\.([a-zA-Z\d\-_]+)/g;
      var hasId       = /#([a-zA-Z\d\-_]+)/;
      
      if (validFormat.test(className)) {
        if (hasClass.test(className))
          newClass = jSh.toArr(className.match(hasClass)).map(function(i){return i.substr(1);});
        
        if (hasId.test(className))
          id = className.match(hasId)[0].substr(1);
        
        if (newClass.length > 0) {
          // Workaround for things like SVG that don't have a simple .className property
          if (!nsElm)
            n.className = newClass.join(" ");
          else
            attributes["class"] = newClass.join(" ");
        }
      } else {
        if (!nsElm)
          n.className = className;
        else
          attributes["class"] = className;
      }
    }
    
    
    if (id)
      n.id = id;
    
    if (text) {
      n[text.t ? "innerHTML" : "textContent"] = (text.s ? text.s : text);
      n[text.t ? "_innerHTML" : "_textContent"] = (text.s ? text.s : text);
    }
    
    if (child) {
      if (jSh.type(child) === "array") {
        child.forEach(function (i) {
          n.appendChild(i);
        });
      } else
        n.appendChild(child);
    }
    
    
    var checkNSAttr = /^ns:[^:]+:[^]*$/i;
    
    if (attributes) {
      for (attr in attributes) {
        if (attributes.hasOwnProperty(attr)) {
          if (!checkNSAttr.test(attr))
            n.setAttribute(attr, attributes[attr]);
          else {
            var nsURI = attr.replace(/^ns:[^:]+:([^]*)$/i, "$1");
            var nsAttr = attr.replace(/^ns:([^:]+):[^]*$/i, "$1");
            
            n.setAttributeNS(nsURI ? nsURI : null, nsAttr, attributes[attr])
          }
        }
      }
    }

    if (properties) {
      for (prop in properties) {
        if (properties.hasOwnProperty(prop))
          n[prop] = properties[prop];
      }
    }
    
    if (events) {
      var evts = Object.getOwnPropertyNames(events);
      
      evts.forEach(function(i) {
        if (jSh.type(evts[i]) === "array") {
          events[i].forEach(function(j) {
            n.addEventListener(i, j);
          });
        } else {
          n.addEventListener(i, events[i]);
        }
      });
    }
    
    return jSh(n);
  };

  // Create a 'type' DOM element with flexible nesting system
  jSh.c = function nodeC(type, className, text, child, attributes, properties) { // Node Custom
    return jSh.d.call({lcesType: type}, className, text, child, attributes, properties);
  }

  // Create raw DOM element with no special features
  jSh.e = function(tag) {
    return document.createElement(tag);
  }

  // Create an HTML DOM text node
  jSh.t = function(t) {
    return document.createTextNode(t);
  }

  // Create SVG with path nesting feature
  jSh.svg = function(classname, width, height, paths) {
    return jSh.c("ns:svg:http://www.w3.org/2000/svg", classname, undf, paths, { // Attributes
      "version": "1.1",
      "width": width,
      "height": height
    });
  }

  // Create SVG path
  jSh.path = function(classname, points, style) {
    return jSh.c("ns:path:http://www.w3.org/2000/svg", classname, undf, undf, {
      "ns:d:": points,
      "ns:style:": style || ""
    });
  }

  // DOM Manipulation Functions

  jSh.getChild = function(off, length) {
    var children = jSh.toArr(this.childNodes).filter(function(i) {return i.nodeType === Node.ELEMENT_NODE ? (!jSh(i) || true) : false;});
    
    if (off < 0)
      off = children.length + off;
    
    if (!children[off])
      return null;
    
    if (typeof length === "number" && length > 1)
      return children.slice(off, off + length);
    else
      return children[off];
  }

  // Assert whether node 'e' is a child of node 'p'
  jSh.isDescendant = function(e, p) {
    var parent = e.parentNode;
    var assert = false;
    
    while (parent != document.body) {
      if (parent == p) {
        assert = true;
        break;
      }
      
      parent = parent.parentNode;
    }
    
    return assert;
  }

  jSh.onEvent = function(e, func, bubble) {
    this.addEventListener(e, func, bubble);
  }

  // Selector functions

  jSh.shorten = function(e) {
    var hasMultipleArgs = jSh.hasMultipleArgs(arguments);
    if (hasMultipleArgs)
      return arguments.length === 1 ? e : jSh.toArr(arguments);
    
    // Check if should shorten
    if (e && !e.getChild) {
      e.getChild = jSh.getChild;
      e.on = jSh.onEvent;
      e.jSh = jSh;
      
      // Improve append and removechild methods
      e.__apch = e.appendChild;
      e.__rmch = e.removeChild;
      
      e.appendChild = function(ch) {
        if (jSh.hasMultipleArgs(arguments, this))
          return undf;
        
        e.__apch(ch);
      }
      
      e.removeChild = function(ch) {
        if (jSh.hasMultipleArgs(arguments, this))
          return undf;
        
        e.__rmch(ch);
      }
    }
    
    return e;
  }

  jSh.id = function(id, parent) { // Compatible with MockupElement and normal # selection
    return (jSh.MockupElement && parent instanceof jSh.MockupElement ? parent : document).getElementById(id);
  }

  jSh.class = function(c, parent) {
    return jSh.toArr(parent.getElementsByClassName(c));
  }

  jSh.tag = function(tag, parent) {
    return jSh.toArr(parent.getElementsByTagName(tag));
  }

  jSh.name = function(name) {
    return jSh.toArr(document.getElementsByName(name));
  }

  jSh.placeholder = function(ph, parent) {
    return jSh.oneOrArr(jSh.toArr(parent.getElementsByTagName("lces-placeholder")).filter(function(i) {return i.phName && i.phName.toLowerCase() === ph.toLowerCase();}));
  }

  jSh.queryAll = function(query, parent, first) {
    return jSh.toArr(parent[first ? "querySelector" : "querySelectorAll"](query));
  }


  // Determine selector in the string
  jSh.isID    = /^#[^\s()\[\]*:{}]+$/i;
  jSh.isClass = /^\.[^\s()\[\]*:{}]+$/i;
  jSh.isTag   = /^[^\s()\[\]*:{}]+$/i;
  jSh.isPH    = /^~[^\s()\[\]*:{}]+$/i; // LCES Templating, placeholder element
  // If it doesn't pass any of these tests, then query selector is used.

  jSh.determineSelector = function(str) {
    if (jSh.isID.test(str)) {
      return "id";
    } else if (jSh.isClass.test(str)) {
      return "class";
    } else if (jSh.isPH.test(str)) {
      return "placeholder";
    } else if (jSh.isTag.test(str)) {
      return "tag";
    } else { // Must be rocket science queries, back to queryselectAll...
      return "queryAll";
    }
  }

  // For distinguishing between lcWidget and a Node instance
  jSh.determineType = function(obj) {
    if (!obj)
      return false;
    
    if (obj instanceof Node)
      return obj;
    
    // MockupElement
    if (jSh.MockupElement && obj instanceof jSh.MockupElement)
      return obj;
    
    if (obj instanceof lcWidget && obj.element instanceof Node)
      return obj.element;
    
    return null
  }


  // A quick typo-fill :D
  var jSH = jSh;

}
lces.rc[1] = function() {
  window.qsmoothp = function(f){var d=this;d.qsmoth={pro:0};d.qsmooth=function(a){if(void 0==a.pro){var c=a.n,b=a.n1,g=(b-c)*(void 0!=a.speed&&"number"==typeof a.speed?a.speed:.1),h=g+c;a.func(h);d.qsmoth.pro+=1;var k=d.qsmoth.pro;d.timeOut=setTimeout(function(){d.qsmooth({func:a.func,n:c,n1:b,pro:k,cur:h,off:g,end:a.end,endarg:a.endarg,noRound:a.noRound,checkIncr:a.checkIncr})},33)}else{if(a.pro!=d.qsmoth.pro)return!1;if (a.n!=a.n1) {var stop=false;var c=a.n,b=a.n1,f=a.off,l=-1*a.checkIncr,l=b<c?l:a.checkIncr,m=!1,n=!1,e=f*(1-(a.cur- c)/(b-c))+a.cur;b<c?l+e<=a.n1&&(m=!0):l+e>=a.n1&&(m=!0);b<c?e<=a.n1&&(n=!0):e>=a.n1&&(n=!0);} else var stop=true;if(stop||!a.noRound&&Math.round(e)==b||e==b||n||void 0!=a.checkIncr&&"number"==typeof a.checkIncr&&m)a.func((stop?a.n1:b)),"function"==typeof a.end&&(arguments=void 0!=a.endarg?a.endarg:void 0,a.end(arguments));else{if(isNaN(a.cur))return!1;a.func(e);d.timeOut=setTimeout(function(){d.qsmooth({func:a.func,pro:a.pro,cur:e,off:f,n:c,n1:b,end:a.end,endarg:a.endarg,noRound:a.noRound,checkIncr:a.checkIncr})},38)}}};this.timeOut=null; this.qsmooth(f)};window.qsFadein=function(f,d,a,c,b,g,h,k){return new qsmoothp({func:f,n:d,n1:a,off:g?g:.2,speed:c?c:.032,noRound:void 0!=h?h:!0,checkIncr:void 0!=k?k:.001,end:void 0!=b?b:void 0})};
  window.clearQS = function(qs) {
    if (qs&&qs.qsmoth)
      qs.qsmoth.pro = 0;
  }
}
function lcesAppendCSS(className, css) {
  var style = document.createElement("style");
  style.classList.add(className);
  style.appendChild(document.createTextNode(css));
  
  document.getElementsByTagName("head")[0].appendChild(style);
  
  return style;
}
lcesAppendCSS("lces-core-styles", ".lces-themify{font-family:Arial;}br2{position:relative;display:block;padding:0px;margin:0px;height:10px;}.lces-themify hr{border-top:0px;border-style:solid;opacity:0.75;}.lces-themify a{font-weight:normal;text-decoration:none;}.lces-themify label{font-weight:bold;}@font-face{font-family:\"CODE\";src:url(http://b-fuze.github.io/lces/main-css/codebold.otf);}@font-face{font-family:\"Lato\";src:url(http://b-fuze.github.io/lces/main-css/lato-reg.ttf);}@font-face{font-family:\"Righteous\";src:url(http://b-fuze.github.io/lces/main-css/righteous.ttf);}@font-face{font-family:\"Couture\";src:url(http://b-fuze.github.io/lces/main-css/couture-bld.otf);}.lces-themify h1,.lces-themify h2,.lces-themify h3,.lces-themify h4,.lces-themify h5,.lces-themify h6{margin:0px;margin-bottom:10px;font-family:Lato;font-weight:normal;}.lces-themify h1{font-size:2.25em;}.lces-themify h2{font-size:2em;}.lces-themify h3{font-size:1.75em;}.lces-themify h4{font-size:1.5em;}.lces-themify h5{font-size:1.25em;}.lces-themify h6{font-size:1.125em;}.lces-themify .lc-centertext{text-align:center;}.lces-themify .lc-indent{margin-left:15px;margin-right:15px;}.lces-themify .lc-inlineblock{display:inline-block;}lces-placeholder{display:none;}.lcescontrol{position:relative;opacity:1;transition:opacity 200ms ease-out;}.lcescontrol[disabled]{opacity:0.5;cursor:default !important;}.lcescontrol[disabled] *{cursor:default !important;}.lcescontrol .lcescontrolclick{position:absolute;left:0px;top:0px;right:0px;bottom:0px;z-index:1000;display:none;}.lces-notification>div{background:transparent;transition:height 400ms ease-out;overflow:hidden;}.lces-themify::-webkit-input-placeholder{color:#BFBFBF;font-style:italic;font-weight:normal;}.lces-themify:-moz-placeholder{color:#BFBFBF;font-style:italic;font-weight:normal;}.lces-themify::-moz-placeholder{color:#BFBFBF;font-style:italic;font-weight:normal;}.lces-themify:-ms-input-placeholder{color:#BFBFBF;font-style:italic;font-weight:normal;}.lces-numberfield::-webkit-input-placeholder{font-style:normal;}.lces-numberfield:-moz-placeholder{font-style:normal;}.lces-numberfield::-moz-placeholder{font-style:normal;}.lces-numberfield:-ms-input-placeholder{font-style:normal;}input.lces[type=\"text\"],input.lces[type=\"password\"],textarea.lces{padding:3px;min-width:150px;height:auto;outline:0px;border:2px solid #000;border-radius:3px;color:#262626;background-color:#fff;font-size:14px;font-family:\"Trebuchet MS\";resize:none;}input.lces[type=\"text\"]:disabled,input.lces[type=\"password\"]:disabled{background-color:#F2F2F2;}.numberfield-container{position:relative;display:inline-block;}input.lces.lces-numberfield{font-size:14px;font-weight:bold;text-align:center;border-right-width:16px;border-top-right-radius:4px;border-bottom-right-radius:4px;}.numberfield-container .arrow{width:16px;height:50%;position:absolute;right:0px;cursor:pointer;background:rgba(0,0,0,0);}.numberfield-container .arrow.active{background:rgba(0,0,0,0.1);}.numberfield-container .arrow svg{position:absolute;top:0px;right:0px;bottom:0px;left:0px;margin:auto auto;opacity:0.85;transition:opacity 200ms ease-out;}.numberfield-container .arrow:hover svg{opacity:1;}.numberfield-container .arrow.top{top:0px;border-top-right-radius:4px;}.numberfield-container .arrow.bottom{bottom:0px;border-bottom-right-radius:4px;}.lces-slider{position:relative;display:inline-block;border:2px solid #000;border-radius:5px;height:28px;width:138px;overflow:hidden;background:#fff;}.lces-slider-min,.lces-slider-max,.lces-slider-value{position:absolute;top:4px;font-family:Righteous;font-size:16px;color:#D9D9D9;}.lces-slider-min{left:5px;}.lces-slider-max{right:5px;}.lces-slider-value{right:0px;left:0px;text-align:center;color:#f00;opacity:0.25;}.lces-slider-scrubbar{position:absolute;top:0px;right:0px;bottom:0px;left:0px;}.lces-slider-scrubber{position:absolute;top:1px;left:0px;margin:0px 0px 0px 1px;width:15px;height:26px;border-radius:3.5px;background:#000;opacity:0.75;transition:opacity 250ms ease-out;}.lces-slider.animated .lces-slider-scrubber{transition:opacity 250ms ease-out,left 150ms cubic-bezier(.1,.41,0,.99);}.lces-slider-scrubbar:hover .lces-slider-scrubber,.lces-slider.scrubbing .lces-slider-scrubber{opacity:1;}.lces-colorchooser{position:relative;top:10px;display:inline-block;}.lces-colorchooser .lces-cc-display{display:inline-block;height:26px;width:46px;border-radius:4px;border:2px solid #000;}.lces-colorchooser .lces-cc-color{margin:4px;width:38px;height:18px;border-radius:1px;background:#000;cursor:pointer;}.lces-colorchooser-modal{position:absolute;z-index:20000000;top:0px;left:0px;margin:5px 0px 0px 0px;border-radius:5px;background:rgba(255,255,255,0.95);overflow:hidden;box-shadow:0px 2px 5px rgba(0,0,0,0.25);opacity:0;transform-origin:0% 0%;transform:scale(0.85);transition:transform 250ms ease-out,opacity 250ms ease-out;}.lces-colorchooser-modal.flipped{margin:0px;transform-origin:0% 100%;}.lces-colorchooser-modal.visible{opacity:1;transform:scale(1);}.lces-colorchooser-modal .lces-cc-section{padding:15px;}.lces-colorchooser-modal .lces-cc-section.lces-cc-controls{padding-top:0px;padding-bottom:0px;background:#F2F2F2;}.lces-colorchooser-modal .lces-cc-wheel{position:relative;width:180px;height:180px;border-radius:100%;background-color:#F2F2F2;background-size:100%;}.lces-colorchooser-modal .lces-cc-wheel-value{position:absolute;left:0px;top:0px;width:100%;height:100%;border-radius:100%;background:#000;opacity:0;}.lces-colorchooser-modal .lces-cc-cursor{position:absolute;width:10px;height:10px;border-radius:100%;background:#fff;border:1px solid #000;}.lces-colorchooser-modal .lces-cc-row{overflow:auto;}.lces-colorchooser-modal .lces-cc-label{float:left;display:block;width:16px;font-family:Couture;font-size:25px;color:#808080;background:#e5e5e5;padding:10px 7px 5px 7px;cursor:default;margin-right:10px;}.lces-colorchooser-modal .lces-slider{margin-top:7px;border-width:1px;}.lces-file input[type=\"file\"]{position:absolute;margin:0px;width:100%;height:100%;opacity:0;z-index:5;cursor:pointer !important;}.lces-file{position:relative;display:block; padding:0px 33px 0px 0px;height:36px;width:123px;border-radius:3px;background-color:#000;font-family:Arial;font-weight:bold;font-size:14px;cursor:pointer !important;}.lces-file>div{position:absolute;top:0px;left:0px;right:33px;bottom:0px;}.lces-file>div>div{display:table;width:100%;height:100%;}.lces-file>div>div>div{display:table-cell;vertical-align:middle;}.lces-file>div>div>div>div{text-align:center;color:#fff;}.lces-file>aside{position:absolute;right:0px;top:0px;bottom:0px;padding:8px;border-top-right-radius:3px;border-bottom-right-radius:3px;background:rgba(0,0,0,0.25);transition:background 200ms ease-out;}.lces-file:hover>aside{background:rgba(0,0,0,0.15);}.lces-file:active>aside{background:rgba(0,0,0,0.5);}.lces-themify button{position:relative;font-family:Arial;font-size:14px;font-weight:bold;outline:0px;border-radius:3px;margin:0px 10px 10px 0px;padding:5px 10px;border:0px;color:#fff;background:#000;cursor:pointer;}.lces-themify button:before,.lces-file:after{content:\"\";position:absolute;top:0px;left:0px;width:100%;height:100%;border-radius:3px;background:rgba(255,255,255,0);transition:background 100ms ease-out;}.lces-themify button:hover:before,.lces-file:hover:after{background:rgba(255,255,255,0.2);}.lces-themify button:active:before,.lces-file:active:after{background:rgba(0,0,0,0.075);transition:background 0ms ease-out !important;}.lcesradio{position:relative;top:1px;width:12px;height:11px;margin:2px;display:inline-block;}.lcesradio .radiobuttoncolor{fill:#000;}.lcesradio svg path:last-child{opacity:0;transition:opacity 150ms ease-out;}.lcesradio[checked] svg path:last-child{opacity:1;}.lcescheckbox{position:relative;top:1px;width:12px;height:11px;margin:2px;display:inline-block;}.lcescheckbox .checkboxcolor{fill:#000;}.lcescheckbox svg path:last-child{opacity:0;transition:opacity 150ms ease-out;}.lcescheckbox[checked] svg path:last-child{opacity:1;}.lcesdropdown{position:relative;display:inline-block;min-width:98px;padding:3px;border:2px solid #000;border-width:2px 27px 2px 2px;border-radius:3px;text-align:left;font-size:14px;font-weight:bold;line-height:1.2;background:#fff;cursor:default;margin:0px 0px 10px 0px;}.lcesdropdown .lcesdropdown-arrow{position:absolute;top:9px;right:-18px;height:6px;width:10px;}.lcesdropdown .lcesdropdown-arrow svg{transform:scaleY(1.2);}.lcesdropdown .lcesoptions{position:absolute;z-index:600000;top:100%;left:-2px;right:-27px;border:0px solid #000;border-width:2px;border-bottom-right-radius:3px;border-bottom-left-radius:3px;font-weight:bold;background:#fff;box-shadow:0px 2px 3px rgba(0,0,0,0.2);transform-origin:50% 0%;transform:scale(0.85);opacity:0;display:none;transition:transform 250ms ease-out,opacity 250ms ease-out;}.lcesdropdown.visible .lcesoptions{opacity:1;transform:scale(1);}.lcesdropdown.flipped .lcesoptions{transform-origin:50% 100%;top:auto;bottom:100%;border-radius:0px;border-top-right-radius:3px;border-top-left-radius:3px;}.lcesdropdown .lcesselected{}.lcesoption{position:relative;padding:3px;margin-bottom:1px;background:rgba(0,0,0,0);color:#484848;transition:background-color 200ms ease-out;}.lcesoption:after{position:absolute;content:\"\";top:100%;left:2px;right:2px;height:1px;background:#000;opacity:0.5;}.lcesoption:hover,.lcesoption[lces-selected]{background:rgba(0,0,0,0.05);}.lcesoption:last-child{margin-bottom:0px;}.lcesoption:last-child:after{height:0px;}.lces-themify table{border-spacing:0px;font-family:Arial;}table.lces thead th{position:relative;border:0px;border-top:3px solid #000;border-bottom:3px solid #000;padding:7px 10px;font-size:13px;}table.lces thead th:before{position:absolute;content:\"\";left:0px;top:10%;bottom:10%;width:1px;background:#000;}table.lces thead th:first-child:before{width:0px;}table.lces tr{padding:0px;margin:0px;border:0px;background:#fff;}table.lces tr[checker]{}table.lces tr td{border:0px;padding:10px;}.lces-window{position:fixed;z-index:1000000;top:0px;left:0px;opacity:0;color:#484848;line-height:1.6;transition:opacity 400ms ease-out;}.lces-window[visible]{opacity:1;}.lces-window[window-invisible]{margin-left:-9999999%;}.lces-window>div{padding:0px;}.lces-window>div>div{background:#fff;overflow:hidden;border-radius:4px;box-shadow:0px 2px 5px rgba(0,0,0,0.25);}.lces-window .lces-window-title{padding:15px 10px;font-family:Arial;font-size:14px;font-weight:bold;color:#000;background:rgba(0,0,0,0.1);cursor:default;}.lces-window .lces-window-contents{padding:25px 20px 30px 20px;}.lces-window .lces-window-buttonpanel{padding:10px;text-align:right;background:rgba(0,0,0,0.1);}.lces-window .lces-window-buttonpanel button{margin-bottom:0px;}.lces-window .lces-window-buttonpanel button:last-child,.lces-window .lces-window-buttonpanel div:last-child button{margin:0px;}.lces-notification{border-radius:3px;position:static;width:275px;box-shadow:0px 2px 3px rgba(0,0,0,0.2);cursor:default;}.lces-notification[visible]{opacity:0.9;}.lces-notification>div{padding:0px;margin:4px 0px;border:1px solid #000;border-radius:3px;background:#fff;overflow:hidden;}.lces-window.lces-notification>div>div{background:rgba(0,0,0,0.025);box-shadow:none;}.notification-alignment.notifi-relative .lces-notification>div{margin:0px !important;}.notification-alignment{position:fixed;z-index:1000000;}.notification-alignment.notifi-relative{position:static !important;}.notifi-top{top:5px;}.notifi-bottom{bottom:5px;}.notifi-middle{top:45%;}.notifi-right{right:5px;text-align:right;}.notifi-left{left:5px;}.notifi-center{left:5px;right:5px;text-align:center;}.notifi-center .lces-notification{margin-right:auto;margin-left:auto;}.lces-accordion{display:block;margin:0px 0px 10px 0px;}.lces-accordion .lces-acc-section{display:block;border:1px solid rgba(0,0,0,0.25);border-radius:3px;overflow:hidden;margin:0px 0px 5px 0px;}.lces-accordion .lces-acc-section .lces-acc-title{display:block;padding:5px;font-weight:bold;font-size:13px;background:rgba(0,0,0,0.25);border:0px;border-bottom:0px solid rgba(0,0,0,0.05);cursor:pointer;}.lces-accordion .lces-acc-section.lces-acc-open .lces-acc-title{border-bottom-width:1px;}.lces-accordion .lces-acc-section .lces-acc-title .lces-acc-arrow{position:relative;top:3px;display:inline-block;width:15px;height:15px;transform:rotate(0deg);padding:0px;margin:0px;margin-right:5px;transition:transform 500ms cubic-bezier(.1,.41,0,.99);}.lces-accordion .lces-acc-section.lces-acc-open .lces-acc-title .lces-acc-arrow{transform:rotate(90deg);}.lces-accordion .lces-acc-section .lces-acc-title .lces-acc-arrow svg{margin:0px;}.lces-accordion .lces-acc-section .lces-acc-contents>div{padding:10px;}.lces-accordion .lces-acc-section .lces-acc-contents{overflow:hidden;height:0px;transition:height 500ms cubic-bezier(.1,.41,0,.99);}.lces-accordion .lces-acc-section.lces-acc-open .lces-acc-contents{overflow:auto;}");
lcesAppendCSS("lces-responsive-styles", "@media screen and (max-width:560px){.no-mobile{display:none;}.lces-window:not(.lces-notification):not([window-invisible]){top:0px !important;bottom:0px ;left:0px !important;right:0px;margin:20px;}.lces-window:not(.lces-notification):not([window-invisible])>div{position:absolute;top:0px;right:0px;bottom:0px;left:0px;}.lces-window:not(.lces-notification):not([window-invisible])>div>div{position:relative;width:100% !important;height:100% !important;}.lces-window:not(.lces-notification):not([window-invisible])>div>div .lces-window-contents{}.lces-window:not(.lces-notification):not([window-invisible]) .lces-window-contents{position:absolute;top:0px;bottom:0px;right:0px;left:0px;width:auto !important;height:auto !important;overflow:auto;}.lces-window.lces-window-titlevisible:not(.lces-notification):not([window-invisible]) .lces-window-contents{top:52px;}.lces-window.lces-window-buttonsvisible:not(.lces-notification):not([window-invisible]) .lces-window-contents{bottom:46px;}.lces-window:not(.lces-notification):not([window-invisible]) .lces-window-buttonpanel{position:absolute;left:0px;right:0px;bottom:0px;}}");
lcesAppendCSS("lces-themify-styles" ,".lcesoption:after,.lces-file,.lces-themify button,table.lces thead th:before,.lces-slider-scrubber{background-color: #800070;}.lces-acc-arrow svg,.checkboxsvg .checkboxcolor,.radiobuttonsvg .radionbuttoncolor,.genreremovesvg .genreremovecolor{fill: #800070;}.lcesoption:hover,.lcesoption[lces-selected],table.lces tr{background-color:rgba(128, 0, 112,0.125);}hr.lces,input.lces[type=\"text\"],input.lces[type=\"password\"],textarea.lces,.lcesdropdown,.lcesdropdown .lcesoptions,table.lces thead th,.lces-slider,.lces-colorchooser .lces-cc-display,.lces-notification>div{border-color: #800070;}.lces-accordion .lces-acc-section .lces-acc-title,.lces-window .lces-window-title,.lces-window .lces-window-buttonpanel{background-color:rgba(128, 0, 112,0.1);}.lces-themify a,.lces-themify h1,.lces-themify h2,.lces-themify h3,.lces-themify h4,.lces-themify h5,.lces-themify h6,.lcesdropdown,table.lces tr,.lces-user-text-color,.lces-window .lces-window-title{color: #800070;}.lces-accordion .lces-acc-section{border-color:rgba(128, 0, 112,0.5);}table.lces tr[checker]{background-color:rgba(128, 0, 112,0.02);}");

var lcesHiddenStuff = lcesAppendCSS("lces-hidden-stuff", ".lces-themify{opacity: 0;}");
lces.rc[50] = function() {
  lces.addInit(function() {
    lcesHiddenStuff.disabled = "disabled";
  })
}

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
    
    var cssStr = css.childNodes[0].nodeValue;
    cssStr = lces.css.colorize(cssStr, values[0], values[1], values[2]);
    
    // Add new color
    css.removeChild(css.childNodes[0]);
    css.appendChild(jSh.t(cssStr));
  }
};
// LCES Core code, depends on jShorts2.js

lces.rc[2] = function() {
  
  // TODO: Wrap these for possible conflicts
  window.ih = function(s) {
    return {s: s, t: 1}  // Returns 1 for innerHTML
  };

  window.prefixEvent = function(event, element, callback) {
    if (jSh.type(event) != "array")
      event = [event];
    
    var prefixes = ["o", "webkit", ""];
    for (var i=0; i<event.length; i++) {
      for (var j=0; j<prefixes.length; j++) {
        element.addEventListener(prefixes[j] + event[i], callback);
      }
    }
    
  }

  window.onTransitionEnd = function(element, callback) {
    prefixEvent(["TransitionEnd", "transitionend"], element, callback);
  }


  // AUCP LCES JS code (Acronym Galore! :D)

  // Some handy tools first...

  // On another note, these *LV* things might be useless...

  window.LCESVar = function(n) {
    this.LCESVAR = true; // Might be needed in the future.
    this.id = n;
  }
  window.LV = function(n) {
    return new LCESVar(n);
  }
  window.isLV = function(v) {
    return v instanceof LCESVar;
  }

  window.LCES = {
    // Core things go here
    EXTENDED_COMPONENT: LV(5), // I'll start from 5 because 0 or 1 can mean anything...
    BASE_COMPONENT: LV(6),

    components: [],

    // Now the functions
    isExtended: function(args) {
      return isLV(args[args.length - 1]) && args[args.length - 1] === LCES.EXTENDED_COMPONENT;
    }

  }

  // ESSENTIAL COMPONENT METHODS

  window.lcComponentMethods = {
    setState: function(state, stateStatus, recurring, recurred) {
      if (!this.states[state]) {
        // Since we don't have it, we'll make it.

        this.states[state] = {
          component: this,
          name: state,
          set: function(stateStatus) {this.component.setState(state, stateStatus);},
          stateStatus: stateStatus,
          oldStateStatus: {nullStuff: null}, // Just to ensure that it doesn't match.
          get: function() {return this.stateStatus;},
          functions: [],
          conditions: [],
          getter: null,
          data: {},
          private: false, // If true then data links can't change it.
          flippedStateCall: false,
          linkedStates: {} // {state: "state", func: func}
        }

        var that = this;
        Object.defineProperty(this, state, {configurable: true, set: function(stateStatus) { that.setState(state, stateStatus); }, get: function() { return that.getState(state); } });
      }


      var stateObject = this.states[state];
      var canContinue = true;
      
      
      for (var i=0,l=stateObject.conditions.length; i<l; i++) {
        canContinue = stateObject.conditions[i].call(stateObject, stateStatus, recurred);
        
        if (!canContinue)
          return false;
      }
      
      
      if (stateObject.stateStatus === stateStatus && !recurring)
        return false;


      // If we're here then everything seems to be okay and we can move on.
      //
      // Firstly set the state.
      
      stateObject.oldStateStatus = stateObject.stateStatus;
      stateObject.stateStatus = stateStatus;

      // Now call listeners...


      for (var j=0,l2=stateObject.functions.length; j<l2; j++) {
        stateObject.functions[j].call(stateObject, stateStatus, recurring);
      }

      return true;
    },

    getState: function(state) {

      if (!this.states[state])
        return false;


      return typeof this.states[state].get === "function" ? this.states[state].get.call(this.states[state]) : this.states[state].stateStatus;
    },

    hasState: function(state, throwError) {
      if (!this.states[state] && throwError)
        throw ReferenceError("No such state");

      return !!this.states[state];
    },

    addStateListener: function(state, stateFunc) {
      if (!this.states[state]) {
        this.setState(state, undf);
        console.warn(state + " doesn't exist");
      }
      this.states[state].functions.push(stateFunc);
    },

    addStateCondition: function(state, conditionFunc) {
      if (this.states[state]) {
        this.states[state].conditions.push(conditionFunc);
      } else
        throw ReferenceError("No such state");
    },

    addGroupLink: function(group) {
      group.addMember(this);
    },

    removeGroupLink: function(group) {
      group.removeMember(this);
    },

    removeStateListener: function(state, listener) {
      if (!this.states[state])
        throw ReferenceError("No such state");

      var stateObject = this.states[state];
      for (var i=0,l=stateObject.functions.length; i<l; i++) {
        if (stateObject.functions[i] === listener) {
          stateObject.functions.splice(i, 1);
          return true;
        }
      }

      return false; // We failed it seems :/
    },

    removeAllStateListeners: function(state) {
      if (!this.states[state])
        throw ReferenceError("No such state");

      this.states[state].functions = [];
      return true;
    },

    removeAllStateConditions: function(state) {
      if (!this.states[state])
        throw ReferenceError("No such state");

      this.states[state].conditions = [];
      return true;
    },

    removeState: function(state) {
      if (jSh.hasMultipleArgs(arguments, this))
        return;
      
      if (!this.states[state])
        throw ReferenceError("No such state");


      var that = this;

      for (linkedState in this.states[state].linkedStates) {
        if (this.states[state].linkedStates.hasOwnProperty(linkedState))
          that.unlinkStates(state, linkedState);
      }

      delete this.states[state];
      delete this[state];
    },

    linkStates: function(state1, state2, callback) {
      var that = this;
      if (!this.states[state1])
        this.setState(state1, "");

      if (!this.states[state2])
        this.setState(state2, "");

      // First check if they're already linked.
      if (this.states[state1].linkedStates[state2] || this.states[state2].linkedStates[state1])
        this.unlinkStates(state1, state2);


      function listener(state) {
        if (!callback && that.getState(state1) === that.getState(state2))
          return true;
        
        
        // Now to set the state in question
        if (state === state2)
          that.setState(state1, callback ? callback(that.getState(state2)) : that.getState(state2));
        else if (state === state1 && !callback)
          that.setState(state2, that.getState(state1));
      };

      this.states[state1].linkedStates[state2] = listener;
      this.states[state2].linkedStates[state1] = listener;

      this.setState(state2, this.getState(state1));
      this.addStateListener("statechange", listener);
    },

    unlinkStates: function(state1, state2) {
      if (!this.states[state1] || !this.states[state1])
        throw ReferenceError("No such state");

      if (!this.states[state1].linkedStates[state2])
        throw TypeError("[" + state1 + "] isn't linked to [" + state2 + "]");


      this.removeStateListener("statechange", this.states[state1].linkedStates[state2]);
      delete this.states[state1].linkedStates[state2];
      delete this.states[state2].linkedStates[state1];

      return true;
    },

    hardLinkStates: function(state1, state2) { // State1 will be considered nonexistant.. And if it exists it'll be deleted.
      if (!this.states[state2])
        throw ReferenceError("No such state");

      if (this.states[state1])
        removeState(state1);
      
      var that = this;

      this.states[state1] = this.states[state2];
      Object.defineProperty(this, state1, {configurable: true, set: function(stateStatus) { that.setState(state1, stateStatus); }, get: function() { return that.getState(state1); } });
    },
    
    copyState: function(state1, state2) {
      if (!this.states[state1])
        throw ReferenceError("No such state");
      if (this.states[state2])
        this.removeState(state2);
      
      
      this.setState(state2, null);
      
      // NOTICE: Object.create(o) isn't supported in IE8!!! But ofc, Idc.
      
      var newStateObj = Object.create(this.states[state1]);
      this.states[state2] = newStateObj;
    },

    extend: function(component) { // TODO: Check this, it might be useless
      var args = [];
      for (var i=1,l=arguments.length; i<l; i++) {
        args.push(arguments[i]);
      }

      var data = {
        component: this
      };
      this.extensionData.push(data);


      component.apply(this, args.concat([data, LCES.EXTENDED_COMPONENT]));
    },

    dataSetState: function(state, stateStatus, recurring) {
      this._setState(state, stateStatus, recurring);
    },
    
    // Event system
    addEvent: function(event) {
      if (!event || jSh.type(event) !== "string" || this.events[event])
        return false; // TODO: Fix this, it repeats too much... DRY!!!!!!!!!
      
      this.events[event] = {
        name: event,
        listeners: []
      };
    },
    
    removeEvent: function(event) {
      if (!event || jSh.type(event) !== "string" || !this.events[event])
        return false;
      
      this.events[event] = undf;
    },
    
    triggerEvent: function(event, evtObj) {
      if (!event || jSh.type(event) !== "string" || !this.events[event])
        return false;
      
      if (!evtObj || jSh.type(evtObj) !== "object")
        throw Error(event + " cannot be triggered without an EventObject");
      
      this.events[event].listeners.forEach(function(func) {
        try {
          func(evtObj);
        } catch (e) {
          console.error(e);
        }
      });
    },
    
    on: function(event, listener) {
      // Check the listener
      if (typeof listener !== "function")
        return false;
      
      // Check for the event
      if (!this.events[event])
        this.addEvent(event);
      
      var evtObj = this.events[event];
      
      evtObj.listeners.push(listener);
    },
    
    removeListener: function(event, listener) {
      if (!event || jSh.type(event) !== "string" || !this.events[event])
        return false;
      
      var index = this.events[event].listeners.indexOf(listener);
      
      if (index !== -1)
        this.events[event].listeners.splice(index, 1);
    }
  }






  // AUCP LCES Constructors

  window.lcComponent = function() {
    // This should be the fundamental building block
    // of the AUCP component linked event system. I can't
    // come up with something better to call it so just
    // AUCP Linked Component Event System I guess.
    // I like thinking up weird names, LCES is pronounced "Elsis" btw...

    if (this.type)
      return true;

    this.type = "LCES Component";
    this.isLCESComponent = true;

    // Use this to distinguish between instanced LCES components
    this.LCESID = LCES.components.length;
    
    // If noReference is on then it just appends null
    LCES.components.push(lces.noReference ? null : this);

    this.states = {};

    this.dataLinks = [];

    this.extensionData = []; // Data for extensions

    var that = this;

    // Add our important methods...
    jSh.extendObj(this, lcComponentMethods);

    // Add our LCESName for easy access via global lces() function

    this.setState("LCESName", "");
    this.addStateListener("LCESName", function(LCESName) {
      if (LCESName)
        LCES.components[LCESName] = that;
    });
    this.addStateCondition("LCESName", function(LCESName) {
      if (this.get()) {
        if (this.get() === LCESName)
          return false;
        
        LCES.components[this.get()] = undefined;
      }

      return true;
    });

    // Now setup some important things beforehand...

    this.setState("statechange", "statechange");
    this.setState("newstate", "newstate");


    this._setState = this.setState;
    this.setState = function(state, stateStatus, recurring) {
      if (!recurring && this.states[state] && this.states[state].stateStatus === stateStatus) {
        this._setState(state, stateStatus, recurring, true);
        return false;
      }
        
      var newstate = false;
      if (!this.states[state])
        newstate = true;

      if (!this.states[state] || !this.states[state].flippedStateCall) {
        this._setState(state, stateStatus, recurring);
        
        if (this.states[state].oldStateStatus !== this.states[state].stateStatus)
          this._setState("statechange", state, true);
      } else {
        if (this.states[state].oldStateStatus !== this.states[state].stateStatus)
          this._setState("statechange", state, true);
        
        this._setState(state, stateStatus, recurring);
      }

      if (newstate)
        this._setState("newstate", state, true);
    }
    
    this.groups = [];
    
    // Add the event array
    this.events = [];
    
    return false; // Not being extended or anything, a new component.
  }

  var lcGroupMethods = {
    addMember: function(component) {
      var that = this;
      var args = arguments;
      
      if (jSh.type(component) == "array")
        return component.forEach(function(i) {args.callee.call(that, i);});

      if (jSh.toArr(arguments).length > 1)
        return jSh.toArr(arguments).forEach(function(i) {args.callee.call(that, i);});


      this.members.push(component);
      component.groups.push(this);
      component.addStateListener("statechange", this.memberMethod);
      
      this.setState("newmember", component, true); // I might not need that dangerous recurring, we'll see.
    },

    removeMember: function(component) {
      component.groups.splice(component.groups.indexOf(this), 1);
      this.members.splice(this.members.indexOf(component), 1);
      
      component.removeStateListener("statechange", this.memberMethod);
    },
    
    
    addExclusiveListener: function(state, listener) {
      if (!this.states[state])
        throw ReferenceError("No such state");
      if (jSh.type(listener) !== "function")
        throw TypeError("Listener " + listener + " not of type 'function'");
      
      this.states[state].exclusiveFunctions.push(listener);
    },
    
    removeExclusiveListener: function(state, listener) {
      if (!this.states[state])
        throw ReferenceError("No such state");
      
      if (this.states[state].exclusiveFunctions.indexOf(listener) !== -1)
        this.states[state].splice(this.states[state].exclusiveFunctions.indexOf(listener), 1);
    }
  }

  lcComponent.prototype = {
    __lcComponent__: 1
  }
  lcComponent.prototype.constructor = lcComponent;


  window.lcGroup = function() {
    var extended = lcComponent.call(this);
    if (!extended)
      this.type = "LCES Group";
    
    
    var that = this;
    this.members = [];
    this.lastTrigger = {}; // lastTrigger[state] = LastTriggeringMember
    
    
    // Add our main stuffs.
    jSh.extendObj(this, lcGroupMethods);
    
    
    this.recurring = true;
    this.recurringMemberTrigger = true;
    this.memberMethod = function(state) {
      if (that.states[state] && state !== "LCESName") {
        // Now to tell everyone else the news...

        that.lastTrigger[state] = this.component;
        that.setState(state, that.states[state].isExclusive ? that.getState(state) : this.component.getState(state), that.recurringMemberTrigger);
      }
    }
    
    this.setState("newmember", null);

    this.addStateListener("statechange", function(state) {

      for (var i=0,l=that.members.length; i<l; i++) {
        if (that.members[i].states[state] && !that.exclusiveMembers[state]) {
          that.members[i]._setState(state, that.getState(state));
          that.members[i]._setState("statechange", state, true);
        } else if (that.members[i].states[state] && that.exclusiveMembers[state]) {
          that.members[i]._setState(state, that.isExclusiveMember(state, that.members[i]) ? !that.getState(state) : that.getState(state));
          that.members[i]._setState("statechange", state, true);
        }
      }
    });
    
    
    
    
    
    this.addStateListener("newstate", function(state) {
      that.states[state].isExclusive = false;
      that.states[state].exclusiveFunctions = [];
    });

    this.onExclusiveStateChange = function() {
      var that2 = this;
      
      var exclusiveMembers = that.exclusiveMembers[this.name];
      
      if (exclusiveMembers.indexOf(that.lastTrigger[this.name]) === -1) {
        if (exclusiveMembers.length === exclusiveMembers.memberLimit) {
          exclusiveMembers[exclusiveMembers.length - 1]._setState(this.name, this.get());
          exclusiveMembers.splice(exclusiveMembers.length - 1, 1);
        }

        exclusiveMembers.splice(0, 0, that.lastTrigger[this.name]);
      }
      
      // Call the functions if any.
      this.exclusiveFunctions.forEach(function(i) {
        i.call(that2, that.lastTrigger[that2.name]);
      });
    }

    this.setExclusiveState = function(state, exclusiveState, memberLimit) {
      this.states[state].isExclusive = true;

      this.exclusiveMembers[state] = [];
      this.exclusiveMembers[state].memberLimit = memberLimit;

      this.setState(state, !exclusiveState);
      this.addStateListener(state, this.onExclusiveStateChange);
    }

    this.exclusiveMembers = {};

    this.isExclusiveMember = function(state, member) {
      if (!this.hasState(state, true) || !this.exclusiveMembers[state])
        return false;

      return this.exclusiveMembers[state].indexOf(member) !== -1;
    }
  }

  jSh.inherit(lcGroup, lcComponent);

  // lcGroup.prototype = new lcComponent(); // This won't do I think, I'll just stick with the .call() method.



  // LCES Server Related Components

  window.lcData = function() { // This should be for stuff that is shared with the server's DB

    var extended = lcComponent.call(this);
    if (!extended)
      this.type = "LCES Data Link";

    var that = this;


    this.onchange = function(state) {
      var query = {};
      query[state] = this.get();

      var req = new lcRequest({
        method: "post",
        uri: "/action",
        query: query,
        form: true
      });
      req.send();
    }

    this.addStateListener("newstate", function(state) {
      that.addStateListener(state, function() {
        that.onchange.call(this, state);
      });
    });
  }

  window.lcRequest = function(args) { // args: {method, uri | url, callback, query, formData, async}


    var extended = lcComponent.call(this);
    if (!extended)
      this.type = "LCES Request";

    var that = this;


    this.xhr = new XMLHttpRequest();
    var xhr = this.xhr;

    this.abort = xhr.abort.bind(xhr);

    xhr.onreadystatechange = args.callback;

    if (args.setup && typeof args.setup === "function")
      args.setup.call(xhr);


    if (args.query) {
      var queryString = "";

      function recursion(obj) {
        if (jSh.type(obj) === "array")
          return encodeURIComponent(obj.join(","));
        if (jSh.type(obj) !== "object")
          return encodeURIComponent(obj.toString());


        var qs = "";

        for (prop in obj) {
          if (obj.hasOwnProperty(prop)) {

            switch (jSh.type(obj[prop])) {
              case "string":
                qs += "&" + prop + "=" + encodeURIComponent(obj[prop]);
              break;
              case "number":
                qs += "&" + prop + "=" + obj[prop];
              break;
              case "array":
                qs += "&" + prop + "=" + encodeURIComponent(obj[prop].join(";"));
              break;
              case "object":
                qs += "";
              break;
              case "null":
                qs += "&" + prop + "=null";
              break;
              case "undefined":
                qs += "";
              break;
              default:
                qs += "";

            }
          }
        }

        return qs;
      }

      queryString = recursion(args.query).substr(1);
    } else {
      queryString = args.formData || "";
    }


    var method = !args.method || args.method.toLowerCase().indexOf("get") != -1 ? "GET" : "POST";

    xhr.open(method, (args.uri || args.url) + (method == "GET" ? (queryString ? "?" + queryString : "") : ""), args.async !== undf ? args.async : true);

    if (args.form)
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    this.send = function() {
      xhr.send(method == "POST" ? queryString : undf)
    }
  }

  jSh.inherit(lcRequest, lcComponent);


  // LCES Main functions

  if (!window.lces)
    window.lces = function(lcesname) {
      return LCES.components[lcesname];
    }

  // Global container of all lces.types
  lces.types = {
  }

  // lces.noReference = Bool
  //
  // Description: If true LCES won't save any reference to any components created
  // it's set. But if set back to false LCES will store a refernce for every component.
  lces.noReference = false;

  // lces.new(type, arg)
  //
  // type: Optional. String. The LCESType of the new component
  // arg: Optional. Any type. The argument to pass to the constructor
  //
  // Returns a new lces component instance of specified type if specified.
  lces.new = function(type, arg) {
    var componentType = type && lces.types[type.toLowerCase()] ? type.toLowerCase() : null;
    
    var component = componentType ? new lces.types[componentType](arg) : new lcComponent(arg);
    return component;
  }


  // Initiation functions system
  lces.initSystem = function() {
    var that = this;
    
    // Arrays that contain all the init functions. DO NOT MUTATE THESE ARRAYS DIRECTLY, use the LCES methods provided instead
    //
    // PRIORITY SYSTEM:
    //  0: Pre-initiation:  Functions that have things to do before Initiation starts.
    //  1: Initiation:      Functions that get everything into a running state.
    //  2: Post-initiation: Functions that tidy up everything after Initiation is complete.
    this.preInitFunctions = [];
    this.initFunctions = [];
    this.postInitFunctions = [];
    
    // Priority array mapping
    this.initPriority = {
      "0": this.preInitFunctions,
      "1": this.initFunctions,
      "2": this.postInitFunctions
    };
    
    // Add initSystem methods
    jSh.extendObj(this, lces.initSystem.methods);
    
    // After initiation completes will be set to true
    this.initiated = null;
    
    // Main LCES init function
    this.init = function() {
      if (this.initiated)
        return false;
      
      // Prevent any conflicts from a possible secondary call to lces.init()
      this.initiated = true;
      
      var priorityArrays = Object.getOwnPropertyNames(this.initPriority);
      
      // Loop all priority arrays and their functions cautiously
      priorityArrays.forEach(function(i) {
        var pArray = that.initPriority[i];
        
        pArray.forEach(function(i) {
          try {
            i(); // Covers ears and hopes nothing blows up
          } catch (e) {
            // Ehhh, so, what happened????
            console.error(e);
          }
        });
      });
    };
  }

  // Contain all the
  lces.initSystem.methods = {
    // LCES Initiation sequence manipulation methods internal mechanism for validating/determining the priority
    getInitPriority: function(priority) {
      return !isNaN(priority) && this.initPriority[priority] ?
                this.initPriority[priority] :
                this.initPriority[1];
    },
    
    // The init priority system manipulation functions
    
    // lces.addInit(initFunc, priority)
    //
    // func: Function. Function to be added to the initiation sequence
    // priority: Integer. Possible value: 0-2 Default: 1 It determines which priority stack the function gets allocated to
    //
    // Description: Adds func to the LCES initiation sequence of priority <priority>. The function will be called
    //              when it's priority is running after lces.init() is invoked.
    addInit: function(func, priority) {
      priority = this.getInitPriority(priority);
      
      if (jSh.type(func) !== "function")
        throw TypeError("LCES Init: Init Function isn't a function");
      
        priority.push(func);
    },
    
    removeInit: function(func, priority) {
      priority = this.getInitPriority(priority);
      
      var index = priority.indexOf(func);
      
      if (index >= 0)
        priority.splice(index, 1);
    },
    
    insertInit: function(newFunc, oldFunc, priority) {
      priority = this.getInitPriority(priority);
      
      if (jSh.type(newFunc) !== "function")
        throw TypeError("LCES Init: Init function provided isn't a function");
      
      var index = priority.indexOf(func);
      
      if (index >= 0)
        priority.splice(index, 0, newFunc);
    },
    
    replaceInit: function(newFunc, oldFunc, priority) {
      priority = this.getInitPriority(priority);
      
      if (jSh.type(newFunc) !== "function")
        throw TypeError("LCES Init: Init function provided isn't a function");
      
      var index = priority.indexOf(func);
      
      if (index >= 0)
        priority.splice(index, 1, newFunc);
    }
  };

  // Add initSystem to lces
  lces.initSystem.call(lces);
}
lces.rc[7] = function() {

  // Conversion functions

  lces.ui.RGB2HSV = function(r, g, b) {
    // Check if a greyscale color
    if (r === g && g === b)
      return {h: 0, s: 0, v: r};
    
    var names = [r + "r", g + "g", b + "b"];
    
    // Sort for biggest channel
    var sortn = [names[0], names[1], names[2]].sort(function(a, b) {return parseFloat(a) < parseFloat(b) ? 1 : -1;});
    var sort  = sortn.map(function(i){return parseFloat(i);});
    sortn = sortn.map(function(i){return i.substr(-1);});
    
    var saturation = (sort[0] - sort[2]) / sort[0];
    var value = sort[0] / 1;
    
    var chroma = sort[0] - sort[2];
    var hue = 60;
    
    switch (sortn[0]) {
      case "r":
        hue *= ((g - b) / chroma) % 6;
      break;
      case "g":
        hue *= (b - r) / chroma + 2;
      break;
      case "b":
        hue *= (r - g) / chroma + 4;
      break;
    }
    
    return {h: hue, s: saturation, v: value};
  }

  lces.ui.HSV2RGB = function(h, s, v) {
    var c = v * s;
    var rgb;
    
    var H = h / 60;
    var x = c * (1 - Math.abs((H % 2) - 1));
    
    if (s === 0)
      rgb = [0, 0, 0];
    else
      switch (Math.floor(H)) {
        case 0: rgb = [c, x, 0]; break;
        case 1: rgb = [x, c, 0]; break;
        case 2: rgb = [0, c, x]; break;
        case 3: rgb = [0, x, c]; break;
        case 4: rgb = [x, 0, c]; break;
        case 5: rgb = [c, 0, x]; break;
      };
    
    var m = v - c;
    
    return [rgb[0] + m, rgb[1] + m, rgb[2] + m];
  }

  // Color chooser template

  lces.ui.colorChooserTemplate = lces.template({render: jSh.dm("lces-colorchooser visible", undf, [
    jSh.dm(".lces-cc-display", undf, [
      jSh.dm(".lces-cc-color")
    ]),
    jSh.dm(".lces-colorchooser-modal", undf, [
      // Colorwheel and cursor
      jSh.dm(".lces-cc-section", undf, [
        jSh.dm(".lces-cc-wheel", undf, [
          jSh.dm(".lces-cc-wheel-value"),
          jSh.dm(".lces-cc-cursor")
        ])
      ]),
      // Sat and value Controls
      jSh.dm(".lces-cc-section.lces-cc-controls", undf, [
        jSh.dm(".lces-cc-row.lces-cc-saturation", undf, [
          jSh.dm(".lces-cc-label", "S"),
          lcSlider({min: 0, max: 100, hideValue: true})
        ]),
        jSh.dm(".lces-cc-row.lces-cc-value", undf, [
          jSh.dm(".lces-cc-label", "V"),
          lcSlider({min: 0, max: 100, hideValue: true})
        ])
      ])
    ])
  ])});

  window.lcColorChooser = function(refElm) {
    lcTextField.call(this);
    
    var ccmContainer = jSh("#lces-colorchoosermodalcontainer");
    
    if (!ccmContainer) {
      var ccmContainer = jSh.d("#lces-colorchoosermodalcontainer.lces-themify");
      document.body.appendChild(ccmContainer);
    }
    
    this.type = "LCES Color Chooser Widget";
    var that = this;
    this.element = new lces.ui.colorChooserTemplate(this);
    
    var ccColor  = this.jSh(".lces-cc-color")[0];
    var cursor   = this.jSh(".lces-cc-cursor")[0];
    var modal    = this.jSh(".lces-colorchooser-modal")[0];
    var wheel    = this.jSh(".lces-cc-wheel")[0];
    var wheelVal = this.jSh(".lces-cc-wheel-value")[0];
    var satSlide = this.jSh(".lces-slider")[0];
    var valSlide = this.jSh(".lces-slider")[1];
    var satRow   = this.jSh(".lces-cc-saturation")[0];
    var valRow   = this.jSh(".lces-cc-value")[0];
    
    // Get stuff working
    ccmContainer.appendChild(modal);
    modal.style.display = "block";
    
    // Set the wheel bg
    wheel.style.backgroundImage = "url(http://b-fuze.github.io/lces/main-img/colorchooser.png)";
    
    // Prep sliders
    satSlide.oldComponent = satSlide.component;
    valSlide.oldComponent = valSlide.component;
    
    // Set all components to this
    ccColor.parentNode.component = this;
    ccColor.component = this;
    modal.component = this;
    wheel.component = this;
    satSlide.component = this;
    valSlide.component = this;
    
    satSlide = satSlide.oldComponent;
    valSlide = valSlide.oldComponent;
    
    satSlide.value = 100;
    valSlide.value = 100;
    
    var modalHeight = modal.offsetHeight;
    var wheelWidth  = wheel.offsetWidth;
    var cursorWidth = cursor.offsetWidth;
    
    // Fade animation
    var displayTimeout = null;
    this.setState("modalVisible", false);
    this.addStateListener("modalVisible", function(visible) {
      if (visible) {
        var ccRect = ccColor.parentNode.getBoundingClientRect();
        
        if (innerHeight - ccRect.bottom - 15 < modalHeight) {
          modal.classList.add("flipped");
          modal.style.top = (scrollY + ccRect.top - modalHeight - 5) + "px";
          modal.style.left = (scrollX + ccRect.left) + "px";
        } else {
          modal.classList.remove("flipped");
          modal.style.top = (scrollY + ccRect.top + (ccRect.bottom - ccRect.top)) + "px";
          modal.style.left = (scrollX + ccRect.left) + "px";
        }
        
        modal.style.display = "block";
        
        displayTimeout = setTimeout(function() {
          modal.classList.add("visible");
        }, 10);
      } else {
        clearTimeout(displayTimeout);
        modal.classList.remove("visible");
      }
    });
    
    onTransitionEnd(modal, function(e) {
      if (e.propertyName == "opacity") {
        var opacity = getComputedStyle(this)["opacity"];
        
        if (opacity == 0)
          modal.style.display = "none";
      }
    });
    
    // Opening/Closing event triggers/handlers
    var openingTimeout = null;
    ccColor.addEventListener("mouseover", function() {
      openingTimeout = setTimeout(function() {
        that.modalVisible = true;
        that.focused = true;
        
        openingTimeout = null;
      }, 500);
      
      this.addEventListener("mouseout", function mouseout() {
        this.removeEventListener("mouseout", mouseout);
        
        if (openingTimeout)
          clearTimeout(openingTimeout);
      });
    });
    
    ccColor.addEventListener("click", function() {
      clearTimeout(openingTimeout);
      openingTimeout = null;
      
      that.modalVisible = true;
      that.focused = true;
    });
    
    this.addStateListener("focused", function(focus) {
      if (!focus) {
        that.modalVisible = false;
      }
    });
    
    // Clear default TextField value state
    this.removeState("value");
    
    // Start color logic
    this.updatingValue = false;
    var curHue = null;
    
    this.setState("value", [255, 255, 255]);
    this.addStateListener("value", function(colors) {
      // Check if being updated from user
      if (that.updatingValue) {
        that.updatingValue = false;
        return;
      }
      
      // Validate colors
      if (!colors || jSh.type(colors) !== "array" || colors.length < 3)
        colors = [255, 255, 255];
      
      colors.forEach(function(color, i) {
        if (i < 3 && (jSh.type(color) !== "number" || isNaN(color)))
          colors[i] = 255;
      });
      
      that.displayColor([colors[0] / 255, colors[1] / 255, colors[2] / 255]);
    });
    
    // Displays color
    this.displayColor = function(color) {
      var colorHSV = lces.ui.RGB2HSV(color[0], color[1], color[2]);
      
      satSlide.updatingSat = true;
      satSlide.value = colorHSV.s * 100;
      valSlide.updatingVal = true;
      valSlide.value = colorHSV.v * 100;
      
      this.setCursor(colorHSV.h, colorHSV.s);
      ccColor.style.background = "rgb(" + this.value.map(function(i){return Math.round(i);}).join(", ") + ")";
      wheelVal.style.opacity = (1 - colorHSV.v);
    }
    
    this.updateColorValue = function() {
      var color = {};
      
      // color.s = satSlide.value / 100;
      color.v = valSlide.value / 100;
      wheelVal.style.opacity = 1 - color.v;
      
      var wheelCenter = (wheelWidth / 2);
      var curx = cursor.offsetLeft - wheelCenter + (cursorWidth / 2);
      var cury = wheelCenter - cursor.offsetTop  - (cursorWidth / 2);
      var off  = Math.sqrt(Math.pow(cursor.offsetLeft - wheelCenter + (cursorWidth / 2), 2) + Math.pow(wheelCenter - cursor.offsetTop  - (cursor.offsetHeight / 2), 2));
      
      
      var rotation = (Math.atan2(cury, curx) / Math.PI) * 180;
      rotation = rotation < 0 ? 360 + rotation : rotation;
      
      if (off > wheelCenter) {
        this.setCursor(rotation, 1);
        off = wheelCenter;
      } else if (this.limitSaturation) {
        this.setCursor(rotation, this.limitSaturation);
        off = this.limitSaturation * wheelCenter;
      }
      
      color.s = off / wheelCenter;
      
      satSlide.updatingSat = true;
      satSlide.value = color.s * 100;
      
      color.h = rotation;
      
      that.updatingValue = true;
      var newValue = lces.ui.HSV2RGB(color.h, color.s, color.v);
      this.value = [parseInt(newValue[0] * 255), parseInt(newValue[1] * 255), parseInt(newValue[2] * 255)];
      
      ccColor.style.background = "rgb(" + this.value.map(function(i){return Math.round(i);}).join(", ") + ")";
    }
    
    this.setCursor = function(rot, dist) {
      var wheelCenter = (wheelWidth / 2);
      rot = ((rot + 90) / 360) * Math.PI * 2;
      
      var x = Math.sin(rot) * dist * wheelCenter + wheelCenter - (cursorWidth / 2);
      var y = Math.cos(rot) * dist * wheelCenter + wheelCenter - (cursorWidth / 2);
      
      cursor.style.left = x + "px";
      cursor.style.top  = y + "px";
    }
    
    // Slider events
    satSlide.addStateListener("value", function(value) {
      if (satSlide.updatingSat) {
        satSlide.updatingSat = false;
        return;
      }
      
      var color = lces.ui.RGB2HSV(that.value[0] / 255, that.value[1] / 255, that.value[2] / 255);
      
      that.setCursor(color.h, value / 100);
      that.updateColorValue();
    });
    
    valSlide.addStateListener("value", function(value) {
      if (valSlide.updatingVal || valSlide.updatingValue) {
        valSlide.updatingVal = false;
        return;
      }
      
      that.updateColorValue();
    });
    
    // Mouse events
    wheel.addEventListener("mousedown", function(e) {
      e.preventDefault();
      function moveCursor(e) {
        var wheelRect = wheel.getBoundingClientRect();
        
        e.preventDefault();
        
        cursor.style.left = Math.round(e.clientX - (wheelRect.left) - cursorWidth / 2) + "px";
        cursor.style.top  = Math.round(e.clientY - wheelRect.top - cursorWidth / 2) + "px";
        
        that.updateColorValue();
      }
      
      moveCursor(e);
      
      window.addEventListener("mousemove", moveCursor);
      window.addEventListener("mouseup", function mup() {
        window.removeEventListener("mousemove", moveCursor);
        window.removeEventListener("mouseup", mup);
      });
    });
    
    this.addStateListener("disableValue", function(disable) {
      if (disable)
        valRow.style.display = "none";
      else
        valRow.style.display = "block";
    });
    
    this.limitSaturation = null;
    this.addStateListener("disableSaturation", function(disable) {
      if (disable) {
        that.limitSaturation = satSlide.s;
        satRow.style.display = "none";
      } else
        that.limitSaturation = null;
        satRow.style.display = "block";
    });
    
    // Finish measuring
    this.value = [255, 255, 255];
    modal.style.display = "none";
    this.classList.remove("visible");
    
    // Check for predefined options
    if (refElm) {
      var initialColor = refElm.getAttribute("color");
      
      if (initialColor && /^\s*rgb\(\s*\d+,\s*\d+\s*,\s*\d+\s*\)\s*$/.test(initialColor)) {
        var firstColor = initialColor.match(/\d+/g);
        
        this.value = firstColor.map(function(i){return parseInt(i);});
      }
      
      if (refElm.parentNode) {
        refElm.parentNode.insertBefore(this.element, refElm);
        refElm.parentNode.removeChild(refElm);
      }
    }
  }

  jSh.inherit(lcColorChooser, lcTextField);

  jSh.extendObj(lces.types, {
    "colorchooser": lcColorChooser
  });
}
// LCES Widget Extra Components
lces.rc[6] = function() {
  window.lcForm = function(e) {
    lcWidget.call(this, e || jSh.c("form"));
    
    // Something here, possibly, maybe?
  }

  jSh.inherit(lcForm, lcWidget);


  // Some extensions


  // TODO: Consider the best method of implementing user-driven events
  // function lcWidget

  // Aight, you know what man???
  // I don't even care anymore, time for some sketchprogramming, I'm just gonna code some
  // crap

  // Hmm, lcGroup.exclusiveState and lcFocus have solved my problem for now.

  // Some form elements

  window.lcTextField = function(e, type) {
    lcWidget.call(this, e ? e : jSh.c("input", {properties: {type: type ? type : "text"}}));
    var that = this;
    
    this.type = "LCES TextField Widget";
    
    
    if (this.element.type && (this.element.type === "text" || this.element.type === "password" || this.element.type === "hidden") || this.element.tagName.toLowerCase() == "textarea") {
      this.classList.add("lces");
      
      this.element.addEventListener("input", function() {
        that.text = this.value;
      });
      this.linkStates("text", "value");
    }


    this.setState("focused", false);
    lces.focus.addMember(this);
    
    this.focus = function() {
      if (typeof that.element.focus === "function")
        that.element.focus();
      
      that.focused = true;
    }
    
    this.blur = function() {
      if (typeof that.element.blur === "function")
        that.element.blur();
      
      that.focused = false;
    }
    
    this.wrap = undf;
  }

  jSh.inherit(lcTextField, lcWidget);

  lces.ui.sliderTemplate = lces.template({render: jSh.dm(".lces-slider", undf, [
    jSh.dm("lces-slider-min", "{#min}"),
    jSh.dm("lces-slider-max", "{#max}"),
    jSh.dm("lces-slider-value", "{#prefix}{#displayValue}{#suffix}"),
    jSh.dm("lces-slider-scrubbar", undf, [
      jSh.dm("lces-slider-scrubber")
    ])
  ])});

  window.lcSlider = function(refElm) {
    // Check if called as a template child
    var isTemplChild = checkTemplateChild(arguments, this);
    if (isTemplChild)
      return isTemplChild;
    
    // Continue on as normal
    lcTextField.call(this);
    this.type = "LCES Slider Widget";
    
    var that = this;
    
    this.element = new lces.ui.sliderTemplate(this);
    this.element.component = this;
    
    // Temporary for dimensions
    document.body.appendChild(this.element);
    
    var scrubbar = this.jSh(".lces-slider-scrubbar")[0];
    var scrubber = this.jSh(".lces-slider-scrubber")[0];
    var valueDisplay = this.jSh(".lces-slider-value")[0];
    
    var scrubbarWidth = scrubbar.offsetWidth;
    var scrubberWidth = scrubber.offsetWidth;
    
    scrubbar.addEventListener("mousedown", function(e) {
      e.preventDefault();
      var target = e.target || e.srcElement;
      
      var onScrub = function(e, scrubberTrig) {
        var sbRect = scrubbar.getBoundingClientRect();
        
        that.triggerEvent("scrubberX", {
          scrubberTriggered: !scrubberTrig,
          x: e.clientX - sbRect.left - scrubberWidth * 0.5
        });
        
        e.preventDefault();
      }
      
      onScrub(e, !(target === scrubber));
      that.classList.add("scrubbing");
      
      window.addEventListener("mousemove", onScrub);
      window.addEventListener("mouseup", function() {
        window.removeEventListener("mousemove", onScrub);
        
        that.classList.remove("scrubbing");
      });
    });
    
    this.on("scrubberX", function(e) {
      var maxOff = scrubbarWidth - scrubberWidth - 2;
      var newOff = e.x < 0 ? 0 : e.x;
      newOff = (newOff > maxOff ? maxOff : newOff);
      
      // Update value
      if (!e.valueTriggered) {
        that.updatingValue = true;
        that.value = that.min + (that.max - that.min) * (newOff / (scrubbarWidth - scrubberWidth - 2));
      } else {
        that.states["value"].oldStateStatus = that.value;
        that.states["value"].stateStatus = that.min + (that.max - that.min) * (newOff / (scrubbarWidth - scrubberWidth - 2));
      }
      
      that.displayValue = Math.round(that.value * 100) / 100;
      
      if (!that.decimals)
        that.displayValue = Math.round(that.displayValue);
      
      // Check if scrubber is the trigger
      if (!e.scrubberTriggered)
        that.classList.add("animated");
      else
        that.classList.remove("animated");
      
      // Update scrubber position
      newOff = newOff < 0 ? 0 : newOff;
      scrubber.style.left = newOff + "px";
    });
    
    this.removeState("text", "value");
    this.addStateListener("value", function(value) {
      if (that.updatingValue) {
        that.updatingValue = false;
        return;
      }
      
      if (typeof value === "number") {
        that.triggerEvent("scrubberX", {valueTriggered: true, x: (scrubbarWidth - scrubberWidth) * ((value - that.min) / (that.max - that.min))});
      }
    });
    
    this.addStateListener("hideValue", function(hide) {
      if (hide)
        valueDisplay.style.display = "none";
      else
        valueDisplay.style.display = "block";
    });
    
    this.min = 0;
    this.max = 100;
    this.displayValue = 0;
    this.decimals = true;
    
    document.body.removeChild(this.element);
    
    if (refElm) {
      var attrMin   = refElm.getAttribute("min");
      var attrMax   = refElm.getAttribute("max");
      var prefix    = refElm.getAttribute("prefix");
      var suffix    = refElm.getAttribute("suffix");
      var hideValue = refElm.getAttribute("hide-value")
      var decimals  = refElm.getAttribute("decimals");
      
      if (!isNaN(parseFloat(attrMin))) {
        this.min = parseFloat(attrMin);
        
        // Set to lowest displayable value
        this.displayValue = this.min;
      }
      
      if (!isNaN(parseFloat(attrMax)))
        this.max = parseFloat(attrMax);
      
      if (prefix)
        this.prefix = prefix;
      
      if (suffix)
        this.suffix = suffix;
      
      if (decimals && decimals.toLowerCase() === "false")
        this.decimals = false;
      
      if (hideValue && hideValue === "true")
        this.hideValue = true;
      
      if (refElm.parentNode) {
        refElm.parentNode.insertBefore(this.element, refElm);
        refElm.parentNode.removeChild(refElm);
      }
      
    }
  }

  // Inherit lcTextField traits
  jSh.inherit(lcSlider, lcTextField);


  window.lcFileInput = function(e) {
    lcTextField.call(this, jSh.d("lces-file", undf, [
      jSh.d(undf, undf, jSh.d(undf, undf, jSh.d(undf, undf, jSh.d("lces-filetext")))), // So annoying
      jSh.c("aside")
    ]));
    var that = this;
    
    // File icon
    var fileIconSVG = jSh.svg("cp-svg", 17, 20, [
      jSh.path(undf, "M0 0 0 20 17 20 17 5 12.5 5 12 5 12 4.5 12 0 0 0zm13 0 0 4 4 0-4-4zm-4.5 4 4.5 4.5-2.2 0 0 4.5-2.2 0-2.2 0 0-4.5L4 8.5 8.5 4zM4 15l9 0 0 1-9 0 0-1z", "fill: #fff;")
    ]);
    
    
    // Append input
    var input = e || jSh.c("input", {properties: {type: "file"}});
    if (input.parentNode)
      input.parentNode.insertBefore(this.element, input);
    this.element.appendChild(input);
    this.input = input;
    
    if (!input.name)
      input.name = "file";
    
    var aside = this.element.getChild(-2);
    aside.appendChild(fileIconSVG);
    
    var textDisplay = this.element.getElementsByClassName("lces-filetext")[0];
    textDisplay.textContent = "No file chosen";
    
    
    // Events
    
    this.onchange =  function() {
      if (input.files.length !== 0)
        var display = input.files.length === 1 ? input.files[0].name : "[" + input.files.length + "] Files Selected";
      else
        var display = "No file chosen";
      
      display = display.length > 14 ? display.substr(0,12) + "..." : display;
      
      textDisplay.textContent = display;
    }
    
    this.upload = function(url, keys, progressCb, readystatechangeCb) {
      var form = new lcForm();
      
      // Get keys from input elements
      if (jSh.type(keys) === "array")
        keys.forEach(function(i) {form.append(i);});
      
      // Create FormData
      var fd = new FormData(form);
      
      // Get keys from object properties
      if (jSh.type(keys) === "object")
        Object.getOwnPropertyNames(keys).forEach(function(i) {
          fd.set(i, keys[i]);
        });
      
      var req = new lcRequest({
        method: "POST",
        uri: url,
        formData: fd,
        callback: function() {
          if (typeof readystatechangeCb === "function")
            readystatechangeCb.call(this);
        }
      });
      
      if (req.xhr.upload && typeof callback === "function") {
        req.xhr.upload.addEventListener("progress", function(e) {
          callback.call(this, e);
        });
      }
      
      return req;
    }
    
    input.addEventListener("change", this.onchange);
  }
  
  jSh.inherit(lcFileInput, lcTextField);
  
  
  window.lcTextArea = function(e) {
    lcTextField.call(this, e ? e : jSh.c("textarea", "lces"));
    var that = this;

    this.type = "LCES TextArea Widget";
    
    this.removeState("text", "value");
    this.setState("value");
    
    this.hardLinkStates("text", "value");
    
    // Add state listeners
    this.addStateListener("text", function(text) {
      that.element.value = text;
    });
    
    this.states["text"].get = function() {
      return that.element.value;
    }
    
    this.select = function() {
      this.element.select();
    }
    
    // this.states["value"].get = this.states["text"].get;
  }

  jSh.inherit(lcTextArea, lcTextField);


  window.acceptableKeyCodes = {"48": "0", "49": "1", "50": "2", "51": "3", "52": "4", "53": "5", "54": "6", "55": "7", "56": "8", "57": "9", "37": "left_arrow", "38": "up_arrow", "39": "right_arrow", "40": "down_arrow", "46": "delete", "8": "backspace", "13": "enter", "16": "shift", "17": "ctrl", "18": "alt", "35": "end", "36": "home", "96": "numpad_0", "97": "numpad_1", "98": "numpad_2", "99": "numpad_3", "100": "numpad_4", "101": "numpad_5", "102": "numpad_6", "103": "numpad_7", "104": "numpad_8", "105": "numpad_9", "109": "subtract", "110": "decimal_point", "190": "period", "189": "dash" };

  window.lcNumberField = function(e) {
    lcTextField.call(this, e ? e : jSh.c("input", {properties: {type: "text"}}));
    var that = this;
    
    this.type = "LCES NumberField Widget";
    this.oldValue = this.text;
    this.style.minWidth = "0px";
    this.classList.add("lces-numberfield");
    
    
    // Setup span container
    this.container = jSh.c("span", "numberfield-container");
    if (this.parent)
      this.parent.insertBefore(this.container, this.element);
    this.container.appendChild(this.element);
    
    
    // The NumberField specific properties
    this.setState("min", -5);
    this.setState("max", 100);
    this.setState("integer", false);
    this.setState("digits", 0);
    this.setState("decimalPoints", 0);
    
    // Get a char's width
    var _charWidth = jSh.c("span", undf, "X", undf, {style: "font-size: 15px; font-weight: bold;"});
    document.body.appendChild(_charWidth);
    this._charWidth = _charWidth.offsetWidth;
    document.body.removeChild(_charWidth);
    
    // Now set the state listeners
    this.addStateListener("digits", function(n) {
      var digitLength = that.digits === 0 ? 15 : that.digits;
      var decimalPoints = that.decimalPoints === 0 ? 15 : that.decimalPoints;
      
      that.style.width = (((!that.integer ? decimalPoints + 1 : 0) + digitLength) * that._charWidth ) + "px";
      
      that.testInt = new RegExp("^\\-?\\d{0," + that.digits + "}$");
      that.testFloat = new RegExp("^\\-?\\d{0," + that.digits + "}(?:\\.\\d{0," + that.decimalPoints + "})?$");
    });
    
    this.addStateListener("decimalPoints", this.states['digits'].functions[0]);
    this.addStateListener("integer", this.states['digits'].functions[0]);
    
    
    
    // Now the event listeners for the element
    this.testInt = new RegExp("^\\d{0," + this.digits + "}$");
    this.testFloat = new RegExp("^\\d{0," + this.digits + "}(?:\\.\\d{0," + this.decimalPoints + "})?$");
    this.testInput = function() {
      if (that.integer && !that.testInt.test(this.value) || !that.integer && !that.testFloat.exec(this.value))
        this.value = that.oldValue;
      else if (jSh.type(that.min) == "number" && parseFloat(this.value) < that.min)
        this.value = that.min;
      else if (jSh.type(that.max) == "number" && parseFloat(this.value) > that.max)
        this.value = that.max;
      else
        that.oldValue = this.value;
    }
    
    this.addEventListener("change", this.testInput);
    
    this.increment = function() {
      that.value = parseInt(that.element.value) + 1;
      that.testInput.call(that.element);
    }
    
    this.decrement = function() {
      that.value = parseInt(that.element.value) - 1;
      that.testInput.call(that.element);
    }
    
    this.addEventListener("keydown", function(e) {
      if (acceptableKeyCodes[e.keyCode.toString()] === undf)
        return e.preventDefault();
      
      if (e.keyCode == 38)
        that.increment();
      if (e.keyCode == 40)
        that.decrement();
      
      return true;
    });
    
    // Check for properties in the attributes
    if (!isNaN(parseInt(this.element.getAttribute("lces-digits"))))
      this.digits = parseInt(this.element.getAttribute("lces-digits"));
    else
      this.digits = 5;
    
    if (!isNaN(parseInt(this.element.getAttribute("lces-decimal-points"))))
      this.decimalPoints = parseInt(this.element.getAttribute("lces-decimal-points"));
    else
      this.decimalPoints = 5;
    
    if (this.element.getAttribute("lces-integers") && (this.element.getAttribute("lces-integers").toLowerCase() === "true" || this.element.getAttribute("lces-integers").toLowerCase() === "false"))
      this.integer = this.element.getAttribute("lces-integers").toLowerCase() === "true";
    else
      this.integer = true;
    
    if (!isNaN(parseFloat(this.element.getAttribute("lces-max"))))
      this.max = parseFloat(this.element.getAttribute("lces-max"));
    else
      this.max = null;
    
    if (!isNaN(parseFloat(this.element.getAttribute("lces-min"))))
      this.min = parseFloat(this.element.getAttribute("lces-min"));
    else
      this.min = null;
      
    
    // Make arrow containers
    var upArrow = jSh.d("arrow");
    upArrow.classList.add("top");
    
    var bottomArrow = jSh.d("arrow");
    bottomArrow.classList.add("bottom");
    
    this.container.appendChild(upArrow, bottomArrow);
    
    // Make SVG arrows
    upArrow.appendChild(jSh.svg("numberfielduparrow", 6.8, 3.4, [
      jSh.path(undf, "m0 3.4 6.8 0L3.4 0z", "fill: #fff;")
    ]));
    bottomArrow.appendChild(jSh.svg("numberfieldbottomarrow", 6.8, 3.4, [
      jSh.path(undf, "M0 0 6.8 0 3.4 3.4z", "fill: #fff;")
    ]));
    
    // Add arrow click events
    upArrow.addEventListener("mousedown", function(e) {
      this.classList.add("active");
      
      e.preventDefault();
      that.increment();
    });
    bottomArrow.addEventListener("mousedown", function(e) {
      this.classList.add("active");
      
      e.preventDefault();
      that.decrement();
    });
    
    function clearBak() {
      this.classList.remove("active");
    }
    
    upArrow.addEventListener("mouseup", clearBak);
    bottomArrow.addEventListener("mouseup", clearBak);
  }

  jSh.inherit(lcNumberField, lcTextField);


  window.lcRadioButton = function(radio) {
    lcWidget.call(this, jSh.d("lcesradio"));
    var that = this;

    this.type = "LCES RadioButton Widget";

    var svg = jSh(".radiobuttonsvg")[0].cloneNode(true);
    this.appendChild(svg);
    radio.parentNode.insertBefore(this.element, radio);
    radio.style.display = "none";

    this.setState("focused", false);
    lces.focus.addMember(this);

    this.setState("checked", false);
    this.value = radio.value;
    this.addStateListener("checked", function(checked) {
      that.element[checked ? "setAttribute" : "removeAttribute"]("checked", "");
    });

    this.addStateListener("focused", function(focused) {
      if (focused) {
        that.checked = true;
        that.group.value = that.value;
      }
    });

    this.addEventListener("mousedown", function(e) {
      e.preventDefault();
    });
  }

  jSh.inherit(lcRadioButton, lcWidget);


  window.lcRadioButtons = function(radios) {
    lcGroup.call(this);
    var that = this;

    this.type = "LCES RadioGroup Widget";
    this.setState("value", "");

    this.radioButtons = {};
    this.addStateListener("value", function(value) {
      if (that.radioButtons[value])
        that.radioButtons[value].checked = true;
    });

    if (jSh.type(radios) != "array")
      radios = jSh.toArr(radios);

    this.setState("checked", false);
    this.setExclusiveState("checked", true, 1);

    var labels = LCESLoopLabels();

    function onClickLabel(e) {
      this.radio.checked = true;

      e.preventDefault();
    }

    for (var i=0,l=radios.length; i<l; i++) {
      var radio = new lcRadioButton(radios[i]);
      radio.group = this;
      this.radioButtons[radios[i].value] = radio;

      this.addMember(radio);
      if (radios[i].checked)
        radio.checked = true;

      radios[i].component = radio;
      if (radios[i].id && labels[radios[i].id]) {
        labels[radios[i].id].radio = radio;
        labels[radios[i].id].addEventListener("mousedown", onClickLabel);
        labels[radios[i].id].component = radio;
      }
    }
  }

  jSh.inherit(lcRadioButtons, lcGroup);


  window.lcCheckBox = function(e) {
    lcTextField.call(this, jSh.d("lcescheckbox"));
    var that = this;
    
    this.type = "LCES CheckBox Widget";
    
    // Check for reference InputElement
    if (e) {
      e.style.display = "none";
      e.parentNode.insertBefore(this.element, e);
    } else
      e = {checked: false};
    
    
    var svg = jSh.svg(".checkboxsvg", 14, 13, [
      jSh.path("checkboxcolor", "M2.6 1 10.4 1C11.3 1 12 1.7 12 2.6l0 7.9C12 11.3 11.3 12 10.4 12L2.6 12C1.7 12 1 11.3 1 10.4L1 2.6C1 1.7 1.7 1 2.6 1z"),
      jSh.path(undf, "m2.6 2.3 7.7 0C10.6 2.3 10.8 2.4 10.8 2.6l0 7.7C10.8 10.6 10.6 10.8 10.4 10.8l-7.7 0C2.4 10.8 2.3 10.6 2.3 10.4l0-7.7C2.3 2.4 2.4 2.3 2.6 2.3z", "fill: #fff;"),
      jSh.path("checkboxcolor", "M11.5 2.5 11 3.1 5.9 8.2 4.3 6.6 3.8 6.1 2.7 7.1 3.2 7.7 5.3 9.8 5.9 10.3 6.4 9.8 12.1 4.1 12.6 3.6 11.5 2.5z")
    ]);
    
    this.appendChild(svg);
    
    
    this.setState("checked", false);
    this.addStateListener("checked", function(checked) {
      if (checked)
        that.element.setAttribute("checked", "");
      else
        that.element.removeAttribute("checked");
    });
    this.setState("checked", e.checked);


    this.addEventListener("mousedown", function(e) {
      that.checked = !that.checked;

      e.preventDefault();
    });

    this.removeAllStateListeners("focused");

    if (e && e.id) {
      var labels = LCESLoopLabels();

      function onClickLabel(e) {
        that.checked = !that.checked;
        that.focused = true;

        e.preventDefault();
      }

      e.component = this;
      if (labels[e.id]){
        labels[e.id].addEventListener("mousedown", onClickLabel);
        labels[e.id].component = this;
      }
    }
  }

  jSh.inherit(lcCheckBox, lcTextField);


  window.lcDropDownOption = function(value, content) {
    var that = this;
    lcWidget.call(this, jSh.d(".lcesoption"));

    this.type = "LCES Option Widget";

    this.value = value;
    
    // Check content type
    if (jSh.type(content) === "array")
      this.append(content);
    else
      this.append(this._determineType(content));

    this.setState("selected", false);
    this.addStateListener("selected", function(state) {
      if (state) {
        that.element.setAttribute("lces-selected", "");
      } else {
        that.element.removeAttribute("lces-selected");
      }
    });
  }

  jSh.inherit(lcDropDownOption, lcWidget);


  window.lcDropDown = function(e) {
    var that = this;
    lcTextField.call(this, jSh.d(".lcesdropdown", undf, [
      jSh.d(".lcesdropdown-arrow", undf, [
        jSh.svg(undf, 10, 5, [
          jSh.path(undf, "m0 0 10 0-5 5z", "fill: #fff;")
        ])
      ])
    ]));

    this.type = "LCES DropDown Widget";

    this.options = [];
    this.setState("selectedOption", false);
    
    // Check for refElement
    if (e)
      this.selectElement = e;
    
    // Create necessary elements
    this.selectedDisplay = new lcWidget(jSh.d("lcesselected"));
    this.optionsContainer = new lcWidget(jSh.d("lcesoptions"));
    this.appendChild(this.selectedDisplay);
    this.optionsContainer.parent = this;
    
    // Update size when new options added/removed
    var longestOptionSize = 0;
    var ph = jSh.ph();
    
    this.updateDropdownSize = function() {
      longestOptionSize = 0;
      
      // Put in body element to ensure the browser renders it
      ph.substitute(this);
      document.body.appendChild(this.element);
      
      this.selectedDisplay.style = {width: "auto"};
      var displayValue = this.selectedDisplay.html;
      
      this.options.forEach(function(option) {
        that.selectedDisplay.html = option[1];
        
        var newWidth = parseInt(getComputedStyle(that.selectedDisplay.element)["width"]);
        if (newWidth > longestOptionSize)
          longestOptionSize = newWidth;
      });
      
      // Set new width
      this.selectedDisplay.style = {width: (longestOptionSize + 3) + "px"};
      this.selectedDisplay.html = displayValue;
      
      // Put dropdown back in it's place
      ph.replace(this);
    }
    
    
    // State listeners
    this.setState("value", null);
    this.addStateListener("value", function(value) {
      value = value + "";
      
      var option = null;
      that.options.forEach(function(i) {
        if (i[0].substr(0, i[0].length - 2) === value)
          option = i[2];
      });

      that.selectedOption = option;
      e.value = value;
    });

    this.addStateListener("selectedOption", function(option) {
      if (option === null) {
        that.selectedDisplay.html = "&nbsp;";
        return false;
      }

      that.selectedDisplay.html = option.html;
      that.value = option.value;
      option.selected = true;
    });

    this.addStateCondition("selectedOption", function(state, recurred) { // To deselect the current option before setting the other.
      if (recurred)
        return false;
      
      if (this.get()) this.get().selected = false;

      return true;
    });
    
    // Disable annoying default browser functionality
    this.addEventListener("mousedown", function(e) {
      e.preventDefault();
    });
    
    this.addEventListener("click", function(e) {
      var target = e.target || e.srcElement;

      if (target.parentNode == that.optionsContainer.element) {
        that.selectedOption = target.component;

        that.menuvisible = false;
      } else if (target == that.selectedDisplay.element || target == that.element) {
        that.menuvisible = !that.menuvisible; // Toggle the visibility of the menu
      }
    });
    
    // When focused by lces.focus
    this.removeAllStateListeners("focused");
    this.addStateListener("focused", function(state) {
      this.component.menuvisible = state;
    });
    
    // For pretty fade animations
    onTransitionEnd(that.optionsContainer, function(e) {
      if (e.propertyName == "opacity") {
        var opacity = getComputedStyle(this)["opacity"];
        
        if (opacity == 0)
          that.optionsContainer.style.display = "none";
      }
    });
    
    // Events for displaying options
    function onWindowScroll() {
      checkFlipped();
    }
    
    this.setState("menuvisible", false);
    this.addStateListener("menuvisible", function(state) {
      if (state) {
        checkFlipped();
        window.addEventListener("scroll", onWindowScroll);
        
        that.optionsContainer.style.display = "inline-block";
        that.classList.add("visible");
      } else {
        window.removeEventListener("scroll", onWindowScroll);
        that.classList.remove("visible");
      }
    });
    
    // Event for knowing if menu goes below the viewport
    this.setState("flipped", false);
    this.addStateListener("flipped", function(flipped) {
      that.classList[flipped ? "add" : "remove"]("flipped");
    });
    
    function checkFlipped() {
      var displayState = that.optionsContainer.style.display;
      that.optionsContainer.style.display = "inline-block";
      var height = that.optionsContainer.element.offsetHeight;
      var bottom = innerHeight - that.element.getBoundingClientRect().bottom;
      
      that.optionsContainer.style.display = displayState;
      if (height > bottom)
        that.flipped = true;
      else
        that.flipped = false;
    }
    
    // ---------------------
    // LCES DROPDOWN METHODS
    // ---------------------
    
    // Add option
    this.addOption = function(value, content) {
      var newOption = new lcDropDownOption(value, content);
      
      this.options.push([value + "op", newOption.html, newOption]);
      
      newOption.parent = this.optionsContainer;
      
      this.updateDropdownSize();
      return newOption;
    }
    
    // Remove option
    this.removeOption = function(option) {
      var index   = typeof option === "number" ? option : undf;
      var value   = typeof option === "string" ? option : undf;
      var element = index === undf && value === undf ? this._determineType(option) : undf;
      
      var removeOptions = [];
      
      if (index !== undf) {
        removeOptions.push([this.options[index], index]);
      } else {
        this.options.forEach(function(opt, i) {
          if (value !== undf) {
            if (value.toLowerCase() == opt[0])
              removeOptions.push([opt, i]);
          } else {
            if (element && element.component === opt[2])
              removeOptions.push([opt, i]);
          }
        });
      }
      
      removeOptions.forEach(function(i) {
        if (i[0]) {
          that.options.splice(i[1], 1);
          
          that.optionsContainer.remove(i[0][2]);
          
          if (that.selectedOption === i[0][2])
            that.selectedOption = that.options[0][2];
        }
      });
      
      this.updateDropdownSize();
    }
    
    // Check for refElement and options
    if (e) {
      
      if (e.parentNode)
        e.parentNode.insertBefore(this.element, this.selectElement);
      
      // Add options
      var endValue = null;
      
      var refOptions = jSh(e).jSh("option");
      refOptions.forEach(function(i, index) {
        var newOption = that.addOption(i.value, jSh.toArr(i.childNodes));
        
        if (i.value == e.value || index === 0)
          endValue = newOption;
      });
      
      this.selectedOption = endValue;
      
      // End refElement
      e.style.display = "none";
    }
    
    // End
    var selectedOption = this.selectedOption;
    this.value = undefined;
    this.value = selectedOption.value;
  }

  jSh.inherit(lcDropDown, lcTextField);


  window.lcTHead = function() {
    lcWidget.call(this, jSh.c("thead"));
  }

  window.lcTBody = function() {
    lcWidget.call(this, jSh.c("tbody"));
  }

  window.lcTHeading = function(e) {
    lcWidget.call(this, e || jSh.c("th"));
  }

  window.lcTRow = function(e) {
    lcWidget.call(this, e || jSh.c("tr"));
  }

  window.lcTCol = function(e) {
    lcWidget.call(this, e || jSh.c("td"));
  }
  
  jSh.inherit(lcTHead, lcWidget);
  jSh.inherit(lcTBody, lcWidget);
  jSh.inherit(lcTHeading, lcWidget);
  jSh.inherit(lcTRow, lcWidget);
  jSh.inherit(lcTCol, lcWidget);
  
  window.lcTable = function(e) {
    lcWidget.call(this, e || jSh.c("table", "lces"));
    var that = this;
    
    this.thead = new lcTHead();
    this.tbody = new lcTBody();
    
    this.thead.parent = this;
    this.tbody.parent = this;
    
    this.rows = [];
    this.headings = [];
    
    this._addItem = function(src, dst, dstArray) {
      var child = this._determineType(src);
      
      dst.appendChild(child);
      dstArray.push(src);
    }
    
    this.addRow = function(content, dontAdd) {
      var newRow = new lcTRow();
      content.forEach(function(i) {
        newRow.appendChild(new lcTCol(jSh.c("td", undf, undf, that._determineType(i))));
      });
      
      newRow.cols = newRow.children;
      
      if (!dontAdd)
        this._addItem(newRow, this.tbody, this.rows);
      
      this._checker();
      return newRow;
    }
    
    this.insertBefore = undefined;
    this.insertBeforeRow = function(content, row) {
      var newRow = this.addRow(content, true);
      
      if (typeof row === "number")
        var oldRow = this.rows[row];
      else
        var oldRow = this._determineType(row).component;
      
      if (!oldRow)
        throw TypeError("Row " + row + " is invalid");
      if (this.rows.indexOf(oldRow) === -1)
        throw ReferenceError("Row " + row + " isn't a descendant");
      
      
      this.tbody.element.insertBefore(newRow.element, oldRow.element);
      this.rows.splice(this.rows.indexOf(row), 0, newRow);
      
      this._checker();
      return newRow;
    }
    
    this.removeRow = function(targetRow) {
      // Retrieve row and check for it's integrity
      if (typeof targetRow === "number") {
        var row = this.rows[targetRow];
        
        if (!row)
          throw ReferenceError("Out of bounds index for row");
      } else {
        var row = this._determineType(targetRow).component;
        
        if (!row)
          throw TypeError("Row " + row + " is invalid");
        if (this.rows.indexOf(row) === -1)
          throw ReferenceError("Row " + row + " isn't a descendant");
      }
      
      // FIXME: Add some pretty collapse effect here or sumthin'
      this.rows.splice(this.rows.indexOf(row), 1);
      this.tbody.removeChild(row.element);
      
      this._checker();
    }
    
    this.setHeadings = function(headings) {
      this.headings.forEach(function(i) {
        that.removeHeading(i);
      });
      
      var newHeadings = [];
      
      headings.forEach(function(i) {
        newHeadings.push(that.addHeading(i));
      });
      
      return newHeadings;
    }
    
    this.addHeading = function(content) {
      var newHead = new lcTHeading();
      newHead.appendChild(this._determineType(content));
      
      this._addItem(newHead, this.thead, this.headings);
      return newHead;
    }
    
    this.removeHeading = function(head) {
      if (typeof head === "number") {
        head = this.headings[head];
      } else {
        head = this._determineType(head).component;
      }
      
      if (!head)
        return;
      
      var index = this.headings.indexOf(head);
      
      if (index !== -1)
        this.headings.splice(index, 1);
      
      this.thead.removeChild(head.element);
    }
    
    this.removeAllHeadings = function() {
      this.headings = [];
      
      while(this.thead.getChild(0)) {
        this.thead.removeChild(this.thead.getChild(0));
      }
    }
    
    this.removeAllRows = function() {
      this.rows = [];
      
      while(this.tbody.getChild(0)) {
        this.tbody.removeChild(this.tbody.getChild(0));
      }
    }
    
    
    this.addStateListener("width", function(width) {
      that.element.width = width;
    });
    this.states["width"].get = function() {return that.element.width;};
    
    this.addStateListener("height", function(height) {
      that.element.height = height;
    });
    this.states["height"].get = function() {return that.element.height;};
    
    
    this._checker = function() {
      var skip = 0;
      
      this.tbody.children.forEach(function(i, index) {
        if (i.skipChecker) {
          skip += 1;
          return;
        }
          
        if ((index - skip) % 2 === 0)
          i.removeAttribute("checker");
        else
          i.setAttribute("checker", "");
      });
    }
  }

  jSh.inherit(lcTable, lcWidget);

  // Extra UI abstraction components

  // Accordion
  window.lcAccordionSection = function(title, contents, onClick, refElm) {
    lcWidget.call(this, jSh.d("lces-acc-section", undf, [
      jSh.d("lces-acc-title"),
      jSh.d("lces-acc-contents")
    ]));
    
    var that = this;
    
    var titleElement   = this.element.getChild(0);
    var contentElement = this.element.getChild(1);
    
    this.contents = contentElement;
    this.contents.appendChild(jSh.d());
    
    // Add arrow
    titleElement.appendChild(jSh.d("lces-acc-arrow", undf, jSh.svg(undf, 15, 15, [
      jSh.path(undf, "M3.8 1.9L3.8 7.5 3.8 13.1 7.5 10.3 11.3 7.5 7.5 4.7 3.8 1.9z")
    ])));
    
    // Add content
    if (title) {
      title = typeof title === "string" ? jSh.t(title) : title;
      
      titleElement.appendChild(title);
    } else {
      titleElement.appendChild(jSh.c("span", undf, ih("&nbsp;")));
    }
    
    if (contents) {
      contents = typeof contents === "string" ? jSh.t(contents) : contents;
      
      contentElement.getChild(0).appendChild(contents);
    }
    
    // Add event handlers
    this.setState("open", false);
    this.addStateListener("open", function(open) {
      if (open) {
        that.classList.add("lces-acc-open");
        
        that.contents.style.height = (that.accordion.sectionHeight || that.height) + "px";
      } else {
        that.classList.remove("lces-acc-open");
        
        that.contents.style.height = "0px";
      }
    });
    
    titleElement.addEventListener("click", function() {
      if (that.open && that.accordion.sectionsCloseable)
        that.open = false;
      else
        that.open = true;
      
      if (typeof onClick === "function")
        onClick();
    });
    
    if (refElm) {
      var attrOpen = (refElm.getAttribute("open") + "").toLowerCase();
      
      this._initCallback = function() {
        if (attrOpen)
          this.open = true;
      }
    }
  }

  window.lcAccordion = function(e) {
    lcWidget.call(this, jSh.d("lces-accordion"));
    
    var that = this;
    
    // this.sections = [];
    this.sectionHeight = 250;
    this.sectionsCloseable = false;
    
    this.sectionsGroup = new lcGroup();
    this.sectionsGroup.setState("open", true);
    this.sectionsGroup.setExclusiveState("open", true, 1);
    
    var sectionCallbacks = [];
    
    this.addSection = function(title, contents, onClick, refElm) {
      var newSection = new lcAccordionSection(title, contents, onClick, refElm);
      
      if (typeof newSection._initCallback === "function")
        sectionCallbacks.push(newSection._initCallback.bind(newSection));
      
      this.sectionsGroup.addMember(newSection);
      this.appendChild(newSection);
      
      newSection.accordion = this;
    }
    
    this.removeSection = function(section) {
      section = this.determineSection(section);
      
      if (!section)
        return null;
      
      this.sectionsGroup.removeMember(section);
      this.removeChild(section);
    }
    
    this.removeAllSections = function() {
      while (this.getSection(0))
        this.removeSection(0);
    }
    
    this.getSection = function(i) {
      return this.sectionsGroup.members[i];
    }
    
    this.determineSection = function(section) {
      if (section instanceof lcAccordionSection)
        return section;
      
      if (typeof section === "number")
        return that.sectionsGroup.members[section];
      
      if (section instanceof Node && section.component instanceof lcAccordion)
        return section.component;
      
      // Undetermined
      return null;
    }
    
    that.setState("maxOpen", 1);
    that.addStateListener("maxOpen", function(maxOpen) {
      that.sectionsGroup.exclusiveMembers["open"].memberLimit = !isNaN(maxOpen) && parseInt(maxOpen) >= 1 ? parseInt(maxOpen) : 1;
    });
    
    // Check for reference
    if (e) {
      if (e.parentNode)
        e.parentNode.insertBefore(this.element, e);
      
      // Check for predefined section height
      if (!isNaN(e.getAttribute("section-height")) && parseInt(e.getAttribute("section-height")) > 50)
        this.sectionHeight = parseInt(e.getAttribute("section-height"));
      
      // Check for predefined maxOpen
      if (!isNaN(e.getAttribute("max-open")) && parseInt(e.getAttribute("max-open")) >= 1)
        this.maxOpen = parseInt(e.getAttribute("max-open"));
      
      if (e.getAttribute("closeable") !== null)
        this.sectionsCloseable = true;
      
      // Add sections
      var refSections = e.jSh("lces-section");
      
      refSections.forEach(function(i) {
        var title = i.jSh("lces-title")[0];
        
        if (title)
          i.removeChild(title);
        
        that.addSection(title && title.childNodes[0] ? jSh.toArr(title.childNodes) : null, jSh.toArr(i.childNodes), null, i);
      });
      
      // Cleanup
      e.parentNode.removeChild(e);
    }
    
    sectionCallbacks.forEach(function(i) {
      i();
    });
  }

  jSh.inherit(lcAccordion, lcWidget);
  jSh.inherit(lcAccordionSection, lcWidget);

  // Append the widgets to the lces.types
  jSh.extendObj(lces.types, {
    "dropdown": lcDropDown,
    "checkbox": lcCheckBox,
    // "radio":
    "textfield": lcTextField,
    "textarea": lcTextArea,
    "slider": lcSlider,
    "numberfield": lcNumberField,
    "fileinput": lcFileInput,
    
    "accordion": lcAccordion
  });
}
// LCES Widget Effects

function lcOnEffectFade(e) {
  
}

function lcEffectFade() {
  var that = this;
  
  if (!this.element) {
    console.warn("Component has no element.");
    
    return false;
  }
  
  
}
lces.rc[8] = function() {
  // LCES Windows

  lces.ui.Windows = [];
  window.lcWindow = function(e, name) {
    lcWidget.call(this, e ? e.getElementsByClassName("lces-window-contents")[0] : jSh.d("lces-window-contents"));
    var that = this;
    
    this.windowID = lces.ui.Windows.length;
    lces.ui.Windows.push(this);
    
    // Array to contain the buttons
    this.buttons = [];
    
    // For dragging and centered states, relative from the viewport
    this.borderOffset = 20;
    
    // Check for the main window container grouping element
    if (!jSh("#windowcontainer"))
      document.body.appendChild(jSh.d("#windowcontainer.lces-themify"));
    
    // Get or create the window element
    if (!e) {
      // Create the window with no reference provided
      this.container = jSh.d("lces-window", undf, jSh.d(undf, undf, jSh.d(undf, undf, [
        jSh.d("lces-window-title", name || "Window " + this.windowID),
        this.element,
        jSh.d("lces-window-buttonpanel")
      ])));
      
      jSh("#windowcontainer").appendChild(this.container);
      
    } else {
      // Create the window from a reference
      e = jSh(e);
      
      var className     = e.getAttribute("class");
      var windowHTMLId  = e.getAttribute("id");
      
      var lcesTitle   = e.jSh("lces-title")[0];
      var lcesContent = e.jSh("lces-contents")[0];
      var lcesButtons = e.jSh("lces-buttons")[0];
      
      if (lcesContent) {
        jSh.toArr(lcesContent.childNodes).forEach(function(i) {
          that.element.appendChild(i);
        });
      }
      
      if (lcesButtons) {
        this.buttons = lcesButtons.jSh("button");
      }
      
      this.container = jSh.d("lces-window", undf, jSh.d(undf, undf, jSh.d(undf, undf, [
        jSh.d("lces-window-title", (lcesTitle ? " " : null) || name || "Window " + this.windowID, lcesTitle ? jSh.toArr(lcesTitle.childNodes) : undf),
        this.element,
        jSh.d("lces-window-buttonpanel", undf, lcesButtons ? jSh.toArr(lcesButtons.childNodes) : undf)
      ])));
      
      jSh("#windowcontainer").appendChild(this.container);
      
      // Cleanup
      e.parentNode.removeChild(e);
      
      // Set classnames and id if any
      if (className) {
        className = className.split(" ");
        className.forEach(function(i) {
          that.container.classList.add(i);
        });
      }
      
      if (windowHTMLId)
        this.container.id = windowHTMLId;
    }
    
    // Add window contents class
    this.classList.add("lces-window-contents");
    
    this._title = this.container.getElementsByClassName("lces-window-title")[0];
    this._buttonpanel = this.container.getElementsByClassName("lces-window-buttonpanel")[0];
    
    
    // LCES Window Component Properties
    this.setState("title", name || "Window " + this.windowID);
    this.addStateListener("title", function(title) {
      that._title.innerHTML = title;
    });
    this.setState("titleVisible", true);
    this.addStateListener("titleVisible", function(visible) {
      that._title.style.display = visible ? "block" : "none";
      
      if (visible)
        that.container.classList.add("lces-window-titlevisible");
      else
        that.container.classList.remove("lces-window-titlevisible");
    });
    
    this.setState("buttonPanelVisible", true);
    this.addStateListener("buttonPanelVisible", function(visible) {
      that._buttonpanel.style.display = visible ? "block" : "none";
      
      if (visible)
        that.container.classList.add("lces-window-buttonsvisible");
      else
        that.container.classList.remove("lces-window-buttonsvisible");
    });
    
    this.container.classList.add("lces-window-titlevisible");
    this.container.classList.add("lces-window-buttonsvisible");
    
    // LCES Window Button manipulation functions
    this.addButton = function(text, onClick) {
      var button = new lcWidget(jSh.c("button", undf, text));
      
      if (typeof onClick === "function") {
        button.addEventListener("click", onClick);
      }
      
      this.buttons.push(button);
      this._buttonpanel.appendChild(button.element);
      
      return button;
    }
    
    this.removeButton = function(button) {
      if (this.buttons.indexOf(button) === -1)
        return false;
      
      this.buttons.splice(this.buttons.indexOf(button), 1);
      this._buttonpanel.removeChild(button.element);
    }
    
    
    
    // Add draggable functionality with the title as the anchor and the container as the target
    lcDraggable.call(this, this.container.getChild(0).getChild(0).getChild(0), this.container);
    
    
    
    // Window fade in effect
    onTransitionEnd(this.container, function(e) {
      if (e.propertyName == "opacity" && getComputedStyle(this)["opacity"] == 0)
        that.container.setAttribute("window-invisible", "");
    });
    
    this.setState("visible", false);
    this.addStateListener("visible", function(visible) {
      if (visible) {
        that.container.removeAttribute("window-invisible");
        
        that.container.setAttribute("visible", "");
      } else
        that.container.removeAttribute("visible");
    });
    
    this.container.component = this;
    this.visible = true;
    
    this.onWinResize = function() {
      that.update();
    }
    
    this.update = function() {
      if (this.centered)
        this._center();
    }
    
    this._center = function() {
      this.container.style.left = ((innerWidth - this.container.offsetWidth) / 2) + "px";
      
      var top = ((innerHeight - this.container.offsetHeight) / 2);
      top = top < this.borderOffset ? this.borderOffset : top;
      
      this.container.style.top = top + "px";
    }
    
    this.setState("centered", false);
    this.addStateListener("centered", function(centered) {
      if (centered) {
        that.update();
        window.addEventListener("resize", that.onWinResize);
      } else
        window.removeEventListener("resize", that.onWinResize);
    });
    
    
    // Now check for properties in the attributes
    if (e) {
      // Get attributes
      var attrVisible   = ((e.getAttribute("lces-visible") || e.getAttribute("visible")) + "").toLowerCase();
      var attrTitleV    = (e.getAttribute("title-visible") + "").toLowerCase();
      var attrButtonsV  = (e.getAttribute("buttonpanel-visible") + "").toLowerCase();
      
      var attrCentered  = e.getAttribute("centered");
      var attrDraggable = e.getAttribute("draggable");
      var attrWidth     = e.getAttribute("width");
      var attrHeight    = e.getAttribute("height");
      
      
      // Check for visible property
      if (attrVisible && (attrVisible == "false" || attrVisible == "true")) {
        this.visible = attrVisible == "true";
        // this.container.style.display = this.visible ? "fixed" : "none"; // It just DON'T work man.
        
        if (this.visible)
          that.container.setAttribute("visible", "");
        else
          this.container.setAttribute("window-invisible", "");
      } else {
        this.visible = false;
        this.container.setAttribute("window-invisible", "");
      }
      
      // Check for draggable property
      if (attrDraggable !== null) {
        this.draggable = true;
      }
      
      // Check for width property
      if (attrWidth !== null) {
        this.style.width = e.getAttribute("width") + "px";
      }
      
      // Check for height property
      if (attrHeight !== null) {
        this.style.height = e.getAttribute("height") + "px";
        this.style.overflow = "auto";
      }
      
      // Check for title option
      if (attrTitleV === "false") {
        this.titleVisible = false;
      }
      
      // Check for button panel option
      if (attrButtonsV === "false") {
        this.buttonPanelVisible = false;
      }
      
      // Check for centered property
      if (attrCentered !== null) {
        this.centered = true;
      }
      
    } else {
      this.visible = false;
      this.container.setAttribute("window-invisible", "");
    }
  }

  jSh.inherit(lcWindow, lcWidget);


  // LCES Notifications

  window.lcNotification = function(msgText, delay, align, arg4, arg5) {
    lcWindow.call(this);
    var that = this;
    
    
    // Add dynText
    this.dynTextTrigger = "text"; // When the text state changes DynText will recompile
    lcDynamicText.call(this);
    
    // Remove/replace some LCES window features
    this.container.classList.add("lces-notification");
    this.buttonPanelVisible = false;
    this.titleVisible = false;
    
    // Set the notifi styling
    this.style = {
      padding: "10px 15px",
      color: "#545454",
      textAlign: "left",
      fontSize: "14px"
    }
    
    function checkMsg(msgText) {
      if (jSh.type(msgText) === "string") {
        this.setState("message", jSh.d(undf, msgText));
        
      } else if (msgText instanceof Node) {
        this.setState("message", msgText);
        
      } else if (jSh.type(msgText) === "array") {
        var cont = jSh.d();
        
        msgText.forEach(function(i) {cont.appendChild(i);});
        this.setState("message", cont);
        
      } else {
        this.setState("message", jSh.d(undf, msgText ? msgText.toString() : msgText));
      }
    }
    var checkMsg = checkMsg.bind(this);
    
    checkMsg(msgText);
    this.appendChild(this.message);
    
    // Check for dynText involvement
    if (jSh.type(msgText) === "string") {
      this.text = msgText;
    }
    
    
    if (jSh.type(delay) === "object") { // Delay is an args Object
      align   = (typeof delay.align === "string" ? delay.align : "BL").toUpperCase();
      onClick = typeof delay.onClick === "function" ? delay.onClick : null;
      delay   = typeof delay.delay === "number" || delay.delay === null ? delay.delay : 1000;
    }
    
    this.delay = delay;
    
    // Validate alignment argument
    var yTest = /(?:^|[^])+([TBM])(?:[^]|$)+/i;
    this.ypos = !yTest.test(align) ? "B" : align.replace(yTest, "$1");
    
    var xTest = /(?:^|[^])+([LRC])(?:[^]|$)+/i;
    this.xpos = !xTest.test(align) ? "L" : align.replace(xTest, "$1");
    
    // Test for relative alignment
    this.relAnchor         = arg4;
    this.relativeAlignment = null;
    this.relOffsetFactor   = null;
    this.relAlignFixed     = null;
    
    var rTest  = /^R[TRBL](\d+(?:\.\d+)?)?$/i;
    var rAlign = /^R([TRBL])(?:\d+(?:\.\d+)?)?$/i;
    var onClick;
    
    if (rTest.test(align)) {
      if (this.relAnchor instanceof Node) {
        this.relativeAlignment = align.replace(rAlign, "$1") ? align.replace(rAlign, "$1") : "B";
        this.relOffsetFactor   = !align.replace(rTest, "$1") || isNaN(align.replace(rTest, "$1")) ? 0.5 : parseFloat(align.replace(rTest, "$1"));
        
        this.xpos = "R";
        this.ypos = "R";
        
        // Check if the anchor's fixed
        this.relAlignFixed = this.checkRelFixed(this.relAnchor);
        
        // Set the notifi container's CSS position
        this.container.style.position = this.relAlignFixed ? "fixed" : "absolute";
        
        // Get Notifi width and height
        this.notifiWidth = this.container.offsetWidth;
        this.notifiHeight = this.container.offsetHeight;
      }
      
      onClick = arg5;
    } else {
      onClick = arg4;
    }
    
    // End relative alignment block
    
    // Add click event handler if any
    if (onClick) {
      this.addEventListener("click", function() {
        if (onClick && typeof onClick === "function")
          onClick();
      });
      
      // Show users it's clickable
      this.container.style.cursor = "pointer";
    }
    
    
    // Hide notifi when opacity transition completes
    onTransitionEnd(this.container, function(e) {
      if (e.propertyName === "opacity" && getComputedStyle(this)["opacity"] == 0)
        this.parentNode.removeChild(this);
    })
    
    // Remove window visible state
    this.removeState("visible");
    this.setState("visible");
    
    this._visibleTimeout = null;
    this._visibleAnim    = null;
    this.addStateListener("visible", function(visible) {
      if (visible) {
        that.container.removeAttribute("window-invisible");
        
        // that.container.style.height = "auto";
        clearTimeout(that._visibleTimeout);
        
        // Add to notifi position container
        lces.ui.notifications.alignments[that.ypos][that.xpos].add(that);
        
        if (that.relativeAlignment) {
          // Set the relative offset
          that.updateRelPosition();
        }
        
        // Notifi fade in animation
        that._visibleAnim = setTimeout(function() {
          that.container.setAttribute("visible", "");
          that.container.getChild(0).style.height = that.renderedHeight;
        }, 0);
        
        // Closing countdown
        if (that.delay) {
          that._visibleTimeout = setTimeout(function() {
            that.visible = false;
          }, that.delay);
        }
        
      } else {
        // Fade out animation
        that.container.removeAttribute("visible");
        
        // Clear closing and anime countdown
        clearTimeout(that._visibleTimeout);
        clearTimeout(that._visibleAnim);
        
        if (getComputedStyle(that.container)["opacity"] == 0 && that.container.parentNode)
          that.container.parentNode.removeChild(that.container);
        
        that.container.getChild(0).style.height = that.renderedHeight;
        that.container.getChild(0).style.height = "1px";
      }
    });
    
    // // Close when transition completes
    // onTransitionEnd(this.container, function(e) {
    //   if (e.propertyName == "opacity" && getComputedStyle(this)["opacity"] == 0)
    //     that.container.parentNode.removeChild(that.container);
    // });
    
    this.toggle = function() { // Probably useless... Or not...
      
    }
    
    // Add to notifi group manager
    lces.ui.notifications.addMember(this);
    
    // Get height for expanding/collapsing animations
    this.renderedHeight = getComputedStyle(this.container.getChild(0))["height"];
    
    // Remove from DOMTree
    if (this.container.parentNode)
      this.container.parentNode.removeChild(this.container);
    
    
    this.visible = false;
  }

  jSh.inherit(lcNotification, lcWindow);

  jSh.extendObj(lcNotification.prototype, {
    // The offset from the anchor element in relative alignment in pixels
    relativeOffset: 20,
    relAlignments: {
      "T": function(factor, notifiw, notifih, anchorw, anchorh) {
        return [factor * (anchorw - notifiw), -(notifih + this.relativeOffset)];
      },
      "B": function(factor, notifiw, notifih, anchorw, anchorh) {
        return [factor * (anchorw - notifiw), anchorh + this.relativeOffset];
      },
      "R": function(factor, notifiw, notifih, anchorw, anchorh) {
        return [anchorw + this.relativeOffset, factor * (anchorh - notifih)];
      },
      "L": function(factor, notifiw, notifih, anchorw, anchorh) {
        return [-(notifiw + this.relativeOffset), factor * (anchorh - notifih)];
      }
    },
    checkRelFixed: function(anchor) {
      var fixed  = false;
      var parent = anchor;
      
      while (parent !== document.body) {
        if (getComputedStyle(parent)["position"].toLowerCase() === "fixed")
          fixed = true;
        
        parent = parent.parentNode;
      }
      
      return fixed;
    },
    updateRelPosition: function() {
      var anchorBound = this.relAnchor.getBoundingClientRect();
      var anchorw = anchorBound.right - anchorBound.left;
      var anchorh = anchorBound.bottom - anchorBound.top;
      
      var notifiw = this.notifiWidth;
      var notifih = this.notifiHeight;
      
      var xpos = anchorBound.left + (!this.relAlignFixed ? scrollX : 0);
      var ypos = anchorBound.top + (!this.relAlignFixed ? scrollY : 0);
      
      var offset = this.relAlignments[this.relativeAlignment].call(this, this.relOffsetFactor, notifiw, notifih, anchorw, anchorh);
      
      this.container.style.left = (xpos + offset[0]) + "px";
      this.container.style.top = (ypos + offset[1]) + "px";
    }
  });

  // LCES Notifications manager
  window.lcNotifications = function() {
    lcGroup.call(this);
    var that = this;
    
    
    // Notifi appending functions for notifi position containers. Top left addAppend, etc.
    var addAppend = function(notifi) {
      this.appendChild(notifi.container);
    }
    
    var addPrepend = function(notifi) {
      if (this.getChild(0) && this.getChild(0) !== notifi.container)
        this.insertBefore(notifi.container, this.getChild(0));
      else
        this.appendChild(notifi.container);
    }
    
    this.alignments = {
      "T": {
        "L": jSh.d({class: "notification-alignment notifi-left notifi-top lces-themify", properties: {add: addAppend}}),
        "C": jSh.d({class: "notification-alignment notifi-center notifi-top lces-themify", properties: {add: addAppend}}),
        "R": jSh.d({class: "notification-alignment notifi-right notifi-top lces-themify", properties: {add: addAppend}})
      },
      "M": {
        "L": jSh.d({class: "notification-alignment notifi-left notifi-middle lces-themify", properties: {add: addPrepend}}),
        "C": jSh.d({class: "notification-alignment notifi-center notifi-middle lces-themify", properties: {add: addPrepend}}),
        "R": jSh.d({class: "notification-alignment notifi-right notifi-middle lces-themify", properties: {add: addPrepend}})
      },
      "B": {
        "L": jSh.d({class: "notification-alignment notifi-left notifi-bottom lces-themify", properties: {add: addPrepend}}),
        "C": jSh.d({class: "notification-alignment notifi-center notifi-bottom lces-themify", properties: {add: addPrepend}}),
        "R": jSh.d({class: "notification-alignment notifi-right notifi-bottom lces-themify", properties: {add: addPrepend}})
      },
      "R": jSh.d({class: "notification-alignment notifi-relative lces-themify", properties: {add: addAppend}})
    };
    
    // Add notifi containers to DOMTree
    [this.alignments["T"], this.alignments["B"], this.alignments["M"]].forEach(function(obj) {
      Object.getOwnPropertyNames(obj).forEach(function(i) {
        if (obj[i])
          document.body.appendChild(obj[i]);
      });
    });
    
    // Add relative notifi container to DOMTree
    document.body.appendChild(this.alignments["R"]);
    this.alignments["R"]["R"] = this.alignments["R"];
    
    // Newmember statechange event fired for every new notifi
    this.addStateListener("newmember", function(member) {
      if (!(member instanceof lcNotification))
        throw TypeError("Notification provided does not implement interface lcNotification");
      // Do something here if required
    });
  }

  jSh.inherit(lcNotifications, lcGroup);

  // Add the new types
  jSh.extendObj(lces.types, {
    "window": lcWindow,
    "notification": lcNotification
  });

  // LCES Notifications Manager Initiation
  lces.ui.initNotifications = function() {
    lces.ui.notifications = new lcNotifications();
  }

  lces.addInit(lces.ui.initNotifications);
}

lces.rc[9] = function() {
  // =======================================================
  //             MAIN GENRE INTERFACE CONSTRUCTOR
  // =======================================================

  lces.ui.tagEditor = {};

  window.lcGenreGroup = function(mainElement) {
    lcGroup.call(this);
    var that = this;
    
    
    // Necessities for DOM relationships
    this.element = mainElement;
    
    this.addStateListener("parent", function(parent) {
      if (parent instanceof Node && parent.nodeType === Node.ELEMENT_NODE)
        parent.appendChild(mainElement);
    });
    
    
    // Some important things
    this.genreEdit  = null;
    this.genreList  = null;
    this.genreArray = null;
    
    // Interfacing Properties
    this.setState("string", "");
    this.states["string"].get = function() {
      var parent   = that.genreEdit.element.getChild(0);
      var genreArr = jSh.toArr(parent.childNodes).map(function(i) {if (i.nodeType !== Node.ELEMENT_NODE || !i.component) return ""; return i.component.value;}).filter(function(i) {return i != "";});
      var string   = genreArr.join(", ");
      
      return genreArr.length ? string : "";
    }
    
    this.addStateListener("string", function(s) {
      var parent = that.genreList.element.getChild(-1);
      var parent2 = that.genreEdit.element.getChild(0);
      that.genreArray.forEach(function(i) {parent.appendChild(i); i.component.genreToggled = false;});
      
      if (!s || s.trim() === "") {
        // throw Error("WHY. THE. HELL?!!: " + s); // Fixed I believe, but may still be prone to errors, will leave as is.
        
        that.genreEdit.noGenres = true;
        return;
      }
      
      var genres = s.toLowerCase().split(/\s*,\s*/g);
      
      if (genres.length >= 1 && that.genreEdit.noGenres) {
        parent2.innerHTML = "";
        that.genreEdit.noGenres = false;
      }
      
      // We might not get any genres
      var appendedGenres = 0;
      
      genres.forEach(function(i) {
        if (that.genreArray[i  + "genre"]) {
          parent2.appendChild(that.genreArray[i  + "genre"]);
          that.genreArray[i  + "genre"].component.genreToggled = true;
          
          appendedGenres += 1;
        }
      });
      
      if (!appendedGenres)
        that.genreEdit.noGenres = true;
    });
    
    // External interface function for value updates
    // Can be changed externally
    this.onchange = function() {
      // Replace function with anything
    }
    
    this._onchange = function(newValue) {
      if (newValue)
        return false;
      
      if (typeof this.onchange === "function")
        this.onchange();
    }
  }

  jSh.inherit(lcGenreGroup, lcGroup);



  // =======================================================
  //              lcGenreField() FUNCTION START
  // =======================================================


  window.lcGenreField = function(mainElement) {
    // Now the Genres, might get a little messy in here.
    if (!lces.ui.tagEditor.closeSVG) {
      lces.ui.tagEditor.closeSVG = jSh.svg(".genreremovesvg", 8, 8, [
        jSh.path(".genreremovecolor", "M1.7 0 0 1.7 2.3 4 0 6.3 1.7 8 4 5.7 6.3 8 8 6.3 5.7 4 8 1.7 6.3 0 4 2.3 1.7 0z")
      ]);
      // lces.ui.tagEditor.closeSVG = jSh.c("ns:svg:http://www.w3.org/2000/svg", undf, undf,
      //   jSh.c("ns:path:http://www.w3.org/2000/svg", "cp-color", undf, undf, {
      //     "ns:d:": "M1.7 0 0 1.7 2.3 4 0 6.3 1.7 8 4 5.7 6.3 8 8 6.3 5.7 4 8 1.7 6.3 0 4 2.3 1.7 0z",
      //     "class": "genreremovecolor"
      //   }), { // Attributes
      //   "version": "1.1",
      //   "width": 8,
      //   "height": 8,
      //   "class": "genreremovesvg"
      // });
    }
    
    // Make or retrieve the main element
    mainElement = mainElement || jSh.d("genres-edit", undf, [
      jSh.c("span", {class: "black", attr: {"no-select": ""}}),
      
      // Add Genre dummy genre
      jSh.d({class: "genre-item", attr: {"new-genre": ""}, child: [
        jSh.c("span", undf, ih("&nbsp;+ Add Genre&nbsp;")),
        jSh.c("span", undf, ih("&nbsp;+ Add Genre&nbsp;")),
        
        jSh.d("", undf, lces.ui.tagEditor.closeSVG.cloneNode(true)),
        jSh.c("section")
      ]}),
      
      // Genre popup selection box
      jSh.d("genre-list", undf, [
        jSh.c("input", {class: "genre-search", prop: {type: "text", placeholder: "Search Genres"}}),
        
        jSh.d("genre-dropcatcher", undf, [
          jSh.c("span", undf, "REMOVE GENRE"),
          jSh.d()
        ]),
        jSh.d({class: "genre-select", attr: {"no-select": ""}})
      ])
    ]);
    
    
    
    // =======================================================
    //             INITIALIZING GENRE INSTANCE
    // =======================================================
    
    
    // Array that contains all physical genres
    var genreArray = [];
    // Main genre interface for foreign exchange
    var genreGroup = new lcGenreGroup(mainElement);
    genreGroup.genreArray = genreArray;
    // window.genreGroup = genreGroup; // FIXME: FOR DEBUGGING PURPOSES ONLY
    
    var genreEdit = new lcWidget(mainElement);
    genreGroup.genreEdit = genreEdit;
    // genreEdit.LCESName = "ui-genre-edit";
    
    var genreList = new lcWidget(genreEdit.element.getChild(-1));
    genreGroup.genreList = genreList;
    var genreSearch = new lcTextField(mainElement.jSh(".genre-search")[0]);
    
    
    genreEdit.setState("editing", false);
    genreEdit.addStateListener("editing", function(editing) {
      if (editing) {
        genreList.visible = true;
      } else {
        genreList.visible = false;
      }
    });
    
    // Init cleanup
    genreGroup.hardLinkStates("value", "string");
    
    
    // Add pretty fade effect for genreList
    
    onTransitionEnd(genreList.element, function(e) {
      if (e.propertyName == "opacity" && getComputedStyle(this)["opacity"] == 0)
        this.style.display = "none";
    });
    genreList.addStateListener("visible", function(visible) {
      if (visible) {
        genreList.style.display = "block";
    
        setTimeout(function() {
          genreList.style.opacity = 1;
        }, 0);
      } else
        genreList.style.opacity = 0;
    });
    
    
    
    
    // =======================================================
    //               GENRE DnD EVENT HANDLERS
    // =======================================================
    
    
    var dragGenreSrc = null;
    
    function genreDragStart(e) {
      this.style.opacity = '0.5';  // this / e.target is the source node.
      
      dragGenreSrc = this;
      
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/html", "<span>genredroppinglikeaboss</span>");
      
      setTimeout(function() {
        genreEdit.element.setAttribute("dragging", "");
      }, 100);
    }
    
    function genreDragOver(e) {
      if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
      }

      e.dataTransfer.dropEffect = 'move';

      return false;
    }
    
    function genreDragEnter(e) {
      // this / e.target is the current hover target.
      if (dragGenreSrc !== this.genre && !this.genre.component && this !== genreDropCatcher ) {
        this.genre.setAttribute("dragover", "");
        
      } else if (dragGenreSrc !== this.genre) {
        if (this === genreDropCatcher && dragGenreSrc.component.genreToggled)
          return this.genre.setAttribute("dragover", "") ? true : true;
        
        if (this !== genreDropCatcher) {
          if (this.genre.component.genreToggled)
            return this.genre.setAttribute("dragover", "") ? true : true;
        }
      }
    }
    
    function genreDragLeave(e) {
      this.genre.removeAttribute("dragover");  // this / e.target is previous target element.
    }
    
    function genreDrop(e) {
      if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
      }
      
      if (dragGenreSrc !== this.genre && e.dataTransfer.getData("text/html") == "<span>genredroppinglikeaboss</span>") {
        function dropGenre() {
          if (this !== genreDropCatcher) {
            if (this === newGenre)
              genreSelectedContainer.appendChild(dragGenreSrc);
            else
              genreSelectedContainer.insertBefore(dragGenreSrc, this.genre);
            dragGenreSrc.component.genreToggled = true;
          } else {
            genreList.element.getChild(-1).appendChild(dragGenreSrc);
            dragGenreSrc.component.genreToggled = false;
          }
        }
        
        
        if (dragGenreSrc !== this.genre) {
          if (this === genreDropCatcher && dragGenreSrc.component.genreToggled)
            return dropGenre.call(this) + genreList.sort() + genreSearch.element.focus() ? true : true; // I'm really lazy, I know.
          
          if (this !== genreDropCatcher) {
            if (this === newGenre || this.genre.component.genreToggled) {
              dropGenre.call(this);
              if (!lces.ui.mobile)
                genreSearch.element.focus();
              return true;
            }
          }
        }
      }
      
      
      
      return false;
    }
    
    function genreDragEnd(e) {
      genreArray.forEach(function(i) {
        i.removeAttribute("dragover", "");
      });
      newGenre.genre.removeAttribute("dragover", "");
      
      
      this.removeAttribute("style");
      setTimeout(function() {
        genreEdit.element.removeAttribute("dragging");
      }, 100);
    }
    
    
    // Reference Selected Genres container
    var genreSelectedContainer = genreEdit.element.getChild(0);
    
    
    // Reference NewGenre Dummy item
    var newGenre = genreEdit.element.getChild(1).getChild(-1);
    newGenre.genre = newGenre.parentNode;
    
    // Reference Genre Garbage Collector
    var genreDropCatcher = genreList.element.getChild(1);
    genreDropCatcher.genre = genreDropCatcher;
    
    // Add DnD events
    [genreDropCatcher, newGenre].forEach(function(i) {
      i.addEventListener('dragenter', genreDragEnter, false);
      i.addEventListener('dragover', genreDragOver, false);
      i.addEventListener('dragleave', genreDragLeave, false);
      i.addEventListener('dragdrop', genreDrop, false);
      i.addEventListener('drop', genreDrop, false);
    });
    
    
    
    
    // =======================================================
    //             GENRE CREATION/REMOVAL METHODS
    // =======================================================
    
    
    var genres = AUCE.data.genres;
    var removeSVG = lces.ui.tagEditor.closeSVG;
    
    genreGroup.addGenre = function(genreName, value) {
      // Make our genre element with all it's children
      var genre = new lcWidget(jSh.d("genre-item", undf, [
        jSh.c("span", undf, genreName), // Genre name container
        jSh.d(undf, undf, removeSVG.cloneNode(true)), // SVG Close Button
        jSh.c("aside", undf, ","),      // Comma separator
        jSh.c("section")                // Dropcatcher to handle all drops
      ], undf, {draggable: true}));
      
      var genreValue = ((value !== undf ? value : genreName) + "").toLowerCase();
      
      // Append new genre
      genreArray.push(genre.element);
      genreArray[genreValue + "genre"] = genre.element;
      
      genre.string = genreName;
      genre.value  = genreValue;
      genre.element.string = genre.string;
      genre.element.value  = genreValue;
      
      genre.setState("genreToggled", false);
      
      
      genre.parent = genreList.element.getChild(-1);
      
      
      
      // Add genre DnD events
      genre.addEventListener('dragstart', genreDragStart, false);
      genre.addEventListener('dragend', genreDragEnd, false);
      
      
      // Add click event
      genre.element.addEventListener("click", function(e) {
        var target = e.target || e.srcElement;
        
        
        if (target === genre.element.getChild(1) || jSh.isDescendant(target, genre.element.getChild(1))) {
          genreList.element.getChild(-1).appendChild(this);
          this.component.genreToggled = false;
          genreList.sort();
          
        } else if (!genre.genreToggled) {
          genreEdit.element.getChild(0).appendChild(this);
          genre.genreToggled = true;
        }
        
        if (!lces.ui.mobile)
          genreSearch.element.focus();
      });
      
      
      // Drop catcher to prevent bad/unreliable DnD behaviour
      var dropCatcher = genre.element.getChild(-1);
      dropCatcher.genre = genre.element;
      dropCatcher.addEventListener('dragenter', genreDragEnter, false);
      dropCatcher.addEventListener('dragover', genreDragOver, false);
      dropCatcher.addEventListener('dragleave', genreDragLeave, false);
      dropCatcher.addEventListener('dragdrop', genreDrop, false);
      dropCatcher.addEventListener('drop', genreDrop, false);
      
      // Make it disabled by default
      genre.genreToggled = false;
    }
    
    genreGroup.removeGenre = function(source) {
      var genre = determineType(source);
      
      if (!genre)
        return false;
      
      genreArray.splice(genreArray.indexOf(genre), 1);
      genreArray[genre.string.toLowerCase() + "genre"] = undf;
      
      genre.component.parent.removeChild(genre);
    }
    
    function determineType(source) {
      if (!source)
        return null;
      
      if (jSh.type(source) === "string") {
        return genreArray[source.toLowerCase() + "genre"];
        
      } else if (source.states && source.states["genreToggled"]) {
        return source.element;
        
      } else if (source.component && source.component.states["genreToggled"]) {
        return source;
        
      } else {
        return null;
      }
    }
    
    // =======================================================
    //            GENRE LIST SORTING, ETC. METHODS
    // =======================================================
    
    
    // Setup GenreList Methods
    genreList.sort = function() {
      var sortedGenres = [];
      var parent = this.element.getChild(-1);
      
      jSh.toArr(parent.childNodes).forEach(function(i) {
        if (i.nodeType === Node.ELEMENT_NODE) {
          sortedGenres[i.component.string] = i;
          sortedGenres.push(i.component.string);
          parent.removeChild(i);
        }
      });
      
      sortedGenres.sort(function(a, b) {
        return a < b ? -1 : 1;
      });
      
      sortedGenres.forEach(function(genre) {
        parent.appendChild(sortedGenres[genre]);
      });
    }
    
    // Tidy up everything beforehand
    genreList.sort();
    
    
    
    // =======================================================
    //                  GENRE SEARCH FUNCTION
    // =======================================================
    
    
    // Now for search Function
    var destArray = [];
    var secondArray = [];
    var arrayMap = [];
    
    function regExSanitize(s) {
      return s.replace(/(\\|\[|\]|\||\{|\}|\(|\)|\^|\$|\:|\.|\?|\+|\*|\-|\!|\=)/g, "\\$1");
    }
    
    function onGenreSearch(s) {
      var parent   = genreList.element.getChild(-1);
      var children = jSh.toArr(parent.childNodes).filter(function(i) {return i.nodeType === Node.ELEMENT_NODE;});
      
      arrayMap = children.map(function(i) {i.passedSearch = false; i.style.display = "none"; parent.removeChild(i); return i;});
      arrayMap.forEach(function(i) {arrayMap[i.string] = i;});
      
      
      destArray   = [];
      secondArray = [];
      
      var firstRegex  = new RegExp("^" + regExSanitize(s), "i");
      var secondRegex = new RegExp(regExSanitize(s), "ig");
      
      
      children.forEach(function(i) {
        if (s.trim() === "")
          return i.removeAttribute("style");
        
        if (firstRegex.test(i.string)) {
          i.passedSearch = true;
          return destArray.push(i.string);
        }
        
        if (secondRegex.test(i.string)) {
          i.passedSearch = true;
          return secondArray.push(i.string);
        }
      });
      
      if (s.trim() === "") {
        children.forEach(function(i) {
          if (!i.passedSearch)
            parent.appendChild(i);
        });
        
        return genreList.sort();
      }
      
      destArray.sort(function(a, b) {
        return a < b ? -1 : 1;
      });
      
      secondArray.sort(function(a, b) {
        return a < b ? -1 : 1;
      });
      
      destArray.forEach(function(i) {
        i = arrayMap[i];
        
        
        parent.appendChild(i);
        i.removeAttribute("style");
      });
      
      secondArray.forEach(function(i) {
        i = arrayMap[i];
        
        parent.appendChild(i);
        i.removeAttribute("style");
      })
      
      children.forEach(function(i) {
        if (!i.passedSearch)
          parent.appendChild(i);
      });
    }
    
    // Remove default LCES styling
    genreSearch.classList.remove("lces");
    
    
    genreSearch.addEventListener("keyup", function(e) {
      var target = destArray[0] || secondArray[0];
      if (this.value.trim() !== "" && e.keyCode === 13 && target) {
        genreSelectedContainer.appendChild(arrayMap[target]);
        arrayMap[target].component.genreToggled = true;
        this.value = "";
        
        onGenreSearch(this.value);
      } else
        onGenreSearch(this.value);
    });
    
    // Add Genre dummy item fade in/out animation
    var addGenreDisplay = newGenre.parentNode.getChild(0);
    var curAddGenreInnerHTML = addGenreDisplay.innerHTML;
    addGenreDisplay.innerHTML = "";
    
    onTransitionEnd(newGenre.parentNode, function(e) {
      if (e.propertyName === "opacity" && getComputedStyle(this)["opacity"] == 0) {
        addGenreDisplay.innerHTML = "";
      }
    });
    
    
    
    
    // =======================================================
    //            MAIN GENREEDIT EVENT HANDLERS
    // =======================================================
    
    
    // Add genreEdit focus event handlers, etc.
    
    genreEdit.addStateListener("noGenres", function(state) {
      if (state) {
        genreEdit.element.setAttribute("no-genres", "");
        
        genreSelectedContainer.innerHTML = "<div class=\"genre-item dummy\" ><span><i>(No Genres)</i></span></div>&nbsp;&nbsp;&nbsp;";
        
        if (getComputedStyle(newGenre.parentNode)["opacity"] == 0)
          genreSelectedContainer.getChild(0).removeAttribute("style");
        
      } else {
        genreEdit.element.removeAttribute("no-genres");
      }
    });
    
    
    genreEdit.addStateListener("editing", function(editing) {
      if (editing) {
        if (genreEdit.noGenres)
          genreSelectedContainer.innerHTML = "";
        genreEdit.noGenres = false;
        
        genreEditIcon.element.removeAttribute("visible");
        
        addGenreDisplay.innerHTML = curAddGenreInnerHTML;
        
        genreList.style.display = "block";
        
        setTimeout(function() {
          genreEdit.classList.add("editing");
        }, 0);
        
        if (!lces.ui.mobile)
          genreSearch.element.focus();
        
      } else {
        genreEdit.classList.remove("editing");
        
        genreSearch.element.blur();
        
        
        if (!genreSelectedContainer.getChild(0)) {
          var newValue = genreGroup.string === genreGroup.states["string"].stateStatus;
          
          genreEdit.noGenres = true;
          genreGroup.string = "";
          genreGroup._onchange(newValue);
          
        } else {
          var newValue = genreGroup.string === genreGroup.states["string"].stateStatus;
          
          genreEdit.noGenres = false;
          genreGroup.string = genreGroup.string;
          genreGroup._onchange(newValue);
        }
      }
    });
    
    genreSearch.element.component = genreEdit;
    lces.focus.addMember(genreEdit);
    genreEdit.addStateListener("focused", function(focused) {
      genreEdit.editing = focused;
    });
    
    onTransitionEnd(genreList.element, function(e) {
      if (e.propertyName == "opacity" && getComputedStyle(this)["opacity"] == 0) {
        this.style.display = "none";
      }
    });
    
    
    // 'Edit This' icon
    var genreEditIcon = jSh(".editpropertysvg")[0] ? new lcWidget(jSh.d("editpropertyicon", undf, jSh(".editpropertysvg")[0].cloneNode())) : new lcWidget();
    
    genreEdit.element.insertBefore(genreEditIcon.element, genreList.element);
    genreEditIcon.style = {
      position: "relative",
      left: "-5px"
    }
    
    // Events
    
    genreEdit.addEventListener("mouseover", function(e) {
      if (!genreEdit.editing)
        genreEditIcon.element.setAttribute("visible", "");
    });
    genreEdit.addEventListener("mouseout", function(e) {
      genreEditIcon.element.removeAttribute("visible");
    });
    
    if (!genreSelectedContainer.getChild(0))
      genreEdit.noGenres = true;
    
    
    // End
    return genreGroup;
  };
}
// LCES DOM Components
lces.rc[3] = function() {
  // lcFocus: A quick library for managing the focused native DOM and custom LCES elements
  window.lcFocus = function() {
    var that  = this;
    this.type = "LCES Focus Manager";
    
    this.recurring = false;
    
    this.setState("focused", false);
    this.setExclusiveState("focused", true, 1);
    
    
    this._addMember = this.addMember;
    this.addMember = function(member) {
      member.setState("focused", false);
      this._addMember(member);
      member.states["focused"].flippedStateCall = true;
    }
    
    this.focusedComponent = null;
    
    var body = new lcWidget(document.body);
    body.setState("focused", false);
    this.addMember(body);

    function onClick(e) {
      var target = e.target || e.srcElement;

      var parent = target;
      
      if (parent) {
        while (parent !== body.element) {
          if (parent) {
            if (parent.component && parent.component.isLCESComponent && parent.component.focused !== undefined) {
              parent.component.focused = true;
              
              that.focusedComponent = parent.component;
              break;
            }
          } else {
            parent = body.element;
            break;
          }
            
          parent = parent.parentNode;
        }
      } else {
        parent = body.element;
      }
      
      if (parent === body.element) {
        body.focused = true;
        that.focusedComponent = body;
      }
    }

    this.setState("enabled", false);
    this.addStateListener("enabled", function(state) {
      if (state)
        window.addEventListener("click", onClick);
      else
        window.removeEventListener("click", onClick);
    });
  }

  jSh.inherit(lcFocus, lcGroup);


  // LCES Physical DOM Elements

  // Helpful functions

  window.LCESLoopLabels = function() {
    var labels = jSh("label");
    var activeLabels = jSh.toArr(labels).filter(function(i) {return !!i.htmlFor;});
    activeLabels.forEach(function(i, un, arr) {arr[i.htmlFor] = i;});

    return activeLabels;
  }

  // lcWidget([HTML DOM Element) I have no idea what I'm doing...
  window.lcWidget = function(e) {
    var extended = lcComponent.call(this);
    if (!extended)
      this.type = "LCES Widget";
    
    var that = this;
    
    // Get jSh
    this.jSh = jSh;
    
    // Get some things from prototype
    this._determineType = this._determineType;
    
    // Get or create main DOM/Markup Element
    if (!this.element)
      this.element = (e ? e : jSh.d());
      
    this.element.component = this;
    
    this.addEventListener = this.element.addEventListener.bind(this.element);
    
    
    // Now a few essential states...
    
    this.setState("style", {});
    this.addStateListener("style", function(styles) {
      for (style in styles) {
        if (styles.hasOwnProperty(style)) {
          that.element.style[style] = styles[style];
        }
      }
    });
    this.states["style"].get = function() {return that.element.style;};

    this.setState("id", undf);
    this.addStateListener("id", function(id) {
      that.element.id = id;
    });
    this.states["id"].get = function() {return that.element.id};


    this.setState("text", "");
    this.addStateListener("text", function(text) {
      if (that.element.tagName.toLowerCase() !== "input") {
        that.element.textContent = text;
      } else
        that.element.value = text;
    });
    this.states["text"].get = function() {return that.element.value || that.element.textContent};


    this.setState("html", "");
    this.addStateListener("html", function(html) {
      if (that.element.innerHTML !== undf)
        that.element.innerHTML = html;
    });
    this.states["html"].get = function() {return that.element.innerHTML};


    this.setState("parent", null);
    this.addStateListener("parent", function(parent) {

      if (parent) {
        if (parent.isLCESComponent)
          parent = parent.element;

        parent.appendChild(that.element);
      } else if (that.parent)
        that.parent.removeChild(that.element);
    });
    this.states["parent"].get = function() {return that.element.parentNode || this.stateStatus;};
    
    
    this.setState("children", jSh.toArr(this.element.childNodes));
    this.addStateListener("children", function(child) {
      if (jSh.type(child) === "array") {
        child.forEach(function(i) {
          that.appendChild(i);
        });
        return true;
      }
      
      that.appendChild(child);
    });
    this.states["children"].get = function() {return jSh.toArr(that.element.childNodes)};
    
    
    // Methods
    
    this.appendChild = function(child) {
      if (jSh.hasMultipleArgs(arguments, this))
        return;
      
      if (child.isLCESComponent)
        child = child.element;
        
      this.element.appendChild(child);
    }
    
    this.append = this.appendChild;
    
    this.removeChild = function(child) {
      if (jSh.hasMultipleArgs(arguments, this))
        return;
      
      var DOMElement = this._determineType(child);
      this.element.removeChild(DOMElement);
    }
    
    this.remove = this.removeChild;
    
    this.insertBefore = function(newElm, oldElm) {
      var newDOMElement = this._determineType(newElm);
      var oldDOMElement = this._determineType(oldElm);
      
      this.element.insertBefore(newDOMElement, oldDOMElement);
    }
    
    this.setAttr = function(attr, value) {
      this.element.setAttribute(attr, value === undf ? "null" : value);
    }
    
    this.getAttr = function(attr) {
      this.element.getAttribute(attr);
    }
    
    this.removeAttr = function(attr) {
      if (jSh.hasMultipleArgs(arguments, this))
        return;
      
      this.element.removeAttribute(attr);
    }
    
    // FIXME: This breaks compatibility with older browsers. I'm not focusing on a polyfill for now.
    var classList = {
      add: function(c) {that.element.classList.add(c)},
      remove: function(c) {that.element.classList.remove(c)},
      removeAll: function(filter) {that.classList.forEach(function(i) {return filter === undf ? that.classList.remove(i) : (i.indexOf(filter) != -1 ? that.classList.remove(i) : false); })},
      toggle: function(c) {that.element.classList.toggle(c)}
    }

    Object.defineProperty(this, "classList", {configurable: true, get: function() {
      var list = jSh.toArr(that.element.classList);
      
      list.add = classList.add;
      list.remove = classList.remove;
      list.removeAll = classList.removeAll;
      list.toggle = classList.toggle;
      
      return list;
    }});
    
    
    // lcWidget.wrap(Element01[, Element02, Element03, Etc...])
    //
    // ElementN: DOM Node | lcWidget Instance
    //
    // Wraps the current widget around the elements passed
    // as the arguments. If the first element is a child then it'll
    // replace it whilst appending it a child of itself.
    this.wrap = function(arg01) {
      if (!arg01)
        return;
      
      var children = jSh.toArr(arguments);
      var child0   = this._determineType(children[0]);
      
      if (child0.parentNode)
        child0.parentNode.insertBefore(this.element, child0);
      
      children.forEach(function(i) {
        var child = that._determineType(i);
        
        that.appendChild(i);
      });
    }
  };

  // Inherit from lcComponent
  jSh.inherit(lcWidget, lcComponent);

  // lcWidget._determineType(Node | lcWidget | string)
  //
  // Description: Returns an HTML DOM Node from the first passed
  // argument. And if it's of a falsy value, then it still returns
  // a DOM Text Node with it's nodeValue the stringified input.
  jSh.extendObj(lcWidget.prototype, {
    _determineType: function(src) {
      if (!src)
        src = jSh.t(src);
      else if (src.isLCESComponent && src.element)
        src = src.element;
      else if (src instanceof Node)
        src = src;
      else
        src = jSh.t(src);
      
      return src;
    }
  })

  lces.initTagExamine = function(e) {
    var lcType = "";
    
    if (e.getAttribute("lces-widget") !== null)
      lcType = e.getAttribute("lces-widget");
    else if (e.tagName.toLowerCase === "lces-widget")
      doSomething();
  }

  // lces.initTagLoad is for loading lcWidgets from the DOM produced from the main HTML response from the server.
  // EDIT: Should be moved to lces.widget.js as it has nothing to do with the core LCES functions.
  lces.initTagLoad = function() {
    var widgets  = jSh("[lces-widget]"); // Elements with lces-widget attribute
    var widgets2 = jSh("lces-widget");   // lces-widget elements
    
    // Combine the results
    widgets = widgets.concat(widgets2);
    
    // Loop through attribute declared widgets
    for (var i=0,l=widgets.length; i<l; i++) {
      var widget = widgets[i];
      var type   = "";
      
      if (widget.tagName.toLowerCase() !== "lces-widget") {
        var probableType = widget.getAttribute("lces-widget");
        var widgetName = widget.getAttribute("lces-name");
      } else {
        var probableType = widget.getAttribute("type");
        var widgetName = widget.getAttribute("name");
      }
      
      // Get the tagname
      var tagName = widget.tagName.toLowerCase();
      
      // Determine the appropriate widget type
      // TODO: Find a way to include radios in this check
      if (probableType) {
        type = lces.types[probableType] ? probableType : "widget";

      } else if (tagName === "input" || tagName === "textarea") {
        var inputType = widget.type;
        
        if (tagName === "textarea")
          type = "textarea";
        else if (inputType === "text" || inputType === "password")
          type = "textfield";
        else if (inputType === "checkbox")
          type = "checkbox";
        else if (inputType === "file")
          type = "fileinput";

      } else if (tagName === "select") {
        type = "dropdown";

      } else {
        type = "widget";
      }

      // Make our new widget
      var newWidget = new lces.types[type](jSh(widget));
      if (widgetName)
        newWidget.LCESName = widgetName;
    }
  }

  // LCES Focusing System
  lces.focus = new lcGroup();

  jSh.extendObj(lces.focus, {
    init: function() {
      lcFocus.call(lces.focus);
      
      lces.focus.enabled = true;
    }
  });

  // Add the Initiation
  lces.addInit(lces.initTagLoad);
  lces.addInit(lces.focus.init);

  // LCES global UI related functions and data
  lces.ui = new lcComponent();

  window.checkTemplateChild = function(args, that) {
    if (that === window) {
      var newFunction = function templChild() {
        if (this !== window) {
          var newElm = new templChild.templChildFunc();
          
          newElm.Component = newElm.component;
          
          if (templChild.templChildOptions)
            jSh.extendObj(newElm, templChild.templChildOptions);
          
          return newElm.element;
        } else {
          return templChild;
        }
      }
      
      newFunction.templChildFunc = args.callee;
      newFunction.templChildOptions = args[0];
      
      return newFunction;
    } else {
      return false;
    }
  }

  // Append to lces.types
  jSh.extendObj(lces.types, {
    "widget": lcWidget
  });
}
lces.rc[4] = function() {
  window.lcDraggable = function(anchor, target) {
    var that = this;
    this._drag = {};
    
    this.onDrag = function(e) {
      e.preventDefault();
      
      if (that.centered)
        return false;
      
      that._drag.mouseX = e.clientX;
      that._drag.mouseY = e.clientY;
      that._drag.winX = target.offsetLeft;
      that._drag.winY = target.offsetTop;
      
      window.addEventListener("mousemove", that.onDragging);
      window.addEventListener("mouseup", function() {
        window.removeEventListener("mousemove", that.onDragging);
        window.removeEventListener("mouseup", arguments.callee);
      });
    }
    
    this.onDragging = function(e) {
      e.preventDefault();
      
      
      var newX = that._drag.winX + (e.clientX - that._drag.mouseX);
      if (newX > innerWidth - target.offsetWidth - that.borderOffset)
        newX = innerWidth - target.offsetWidth - that.borderOffset;
      else if (newX < that.borderOffset)
        newX = that.borderOffset;
      
      var newY = that._drag.winY + (e.clientY - that._drag.mouseY);
      if (newY < that.borderOffset)
        newY = that.borderOffset;
      else if (innerHeight > target.offsetHeight + that.borderOffset * 4 && newY > innerHeight - target.offsetHeight - that.borderOffset)
        newY = innerHeight - target.offsetHeight - that.borderOffset;
      
      target.style.left = newX + "px";
      target.style.top = newY + "px";
    }
    
    this.setState("draggable", false);
    this.addStateListener("draggable", function(draggable) {
      if (draggable)
        anchor.addEventListener("mousedown", that.onDrag);
      else
        anchor.removeEventListener("mousedown", that.onDrag);
    });
    
    this.borderOffset = 20;
  }

  // new lcControl(DOM Node)
  //
  // An LCES widget designed to collectively control
  // the enabled state of (Mainly input) elements.
  //
  // newControl.disable: Bool
  //  - When true, the underlying children are not accessible
  //  - by the enduser, when set to false access is restored.
  window.lcControl = function(e) {
    lcWidget.call(this, e || jSh.d("lcescontrol"));
    var that = this;
    this.element.component = this;
    
    this.classList.add("lcescontrol");
    
    this.inputs = jSh.toArr(this.element.getElementsByTagName("input")).concat(jSh.toArr(this.element.getElementsByTagName("button")));
    
    this.onMousedown = function(e) {
      e.preventDefault();
    }
    
    this.onFocus = function(e) {
      e.preventDefault();
      
      if (this.blur)
        this.blur();
    }
    
    this.clickCatcher = jSh.d("lcescontrolclick");
    this.clickCatcher.addEventListener("mousedown", this.onMousedown);
    this.appendChild(this.clickCatcher);
    
    this._appendChild = this.appendChild;
    this.appendChild = function() {
      this._appendChild.apply(this, jSh.toArr(arguments));
      this._appendChild(this.clickCatcher);
    }
    
    this.setState("disabled", false);
    this.addStateListener("disabled", function(disabled) {
      if (disabled) {
        that.element.setAttribute("disabled", "");
        that.element.addEventListener("mousedown", that.onMousedown);
        
        that.clickCatcher.style.display = "block";
        
        that.inputs.forEach(function(i) {i.addEventListener("focus", that.onFocus);});
      } else {
        that.element.removeAttribute("disabled");
        that.element.removeEventListener("mousedown", that.onMousedown);
        
        that.clickCatcher.style.display = "none";
        
        that.inputs.forEach(function(i) {i.removeEventListener("focus", that.onFocus);});
      }
    });
    
    this.setState("focused", false);
    lces.focus.addMember(this);
    
    var attr = this.element.getAttribute("disabled");
    if (attr !== null)
      this.disabled = true;
  }

  jSh.inherit(lcControl, lcWidget);

  jSh.extendObj(lces.types, {
    "control": lcControl
  });






  // LCES Dynamic Text Feature
  //

  lces.dynText = {
    allowTags: true, // If false any [tag]x[/tag]'s will be ignored.
    forgiving: true  // If false, will throw errors on every "syntax error"
  };


  // Tag specifics
  // Add new tags here.

  lces.dynText.tags = {
    "text": {
      node: function(params, context) {
        return new lcWidget(jSh.c("span", {}));
      }
    },
    "url": {
      node: function(params, context) {
        var widget = new lcWidget(jSh.c("a", {properties: {href: params}}));
        
        widget.addStateListener("href", function(href) {
          this.component.element.href = href.substr(0, 4).toLowerCase() === "url:" ? href.substr(4) : href;
        });
        
        return widget;
      },
      update: function(s) {
        this.component.href = s;
      }
    },
    "button": {
      node: function(params, context) {
        return new lcWidget(jSh.c("button", {}));
      },
      update: function() {
        
      }
    },
    "color": {
      node: function(params, context) {
        return new lcWidget(jSh.c("span", {attributes: {style: "color: " + params + ";"}}));
      },
      update: function(s) {
        if (s !== "lces-color") {
          this.component.style = {
            color: s
          };
          
          this.component.classList.remove("lces-user-text-color");
        } else {
          this.component.setAttr("style", "");
          this.component.classList.add("lces-user-text-color");
        }
      }
    },
    "b": {
      node: function(params, context) {
        return new lcWidget(jSh.c("span", {attributes: {style: "font-weight: bold;"}}));
      },
      update: function() {
        
      }
    },
    "i": {
      node: function(params, context) {
        return new lcWidget(jSh.c("span", {attributes: {style: "font-style: italic;"}}));
      },
      update: function() {
        
      }
    },
    "u": {
      node: function(params, context) {
        return new lcWidget(jSh.c("span", {attributes: {style: "text-decoration: underline;"}}));
      },
      update: function() {
        
      }
    },
    "center": {
      node: function(params, context) {
        return new lcWidget(jSh.c("span", {attributes: {style: "display: block;text-align: center;"}}));
      },
      update: function() {
        
      }
    }
  };


  // LCES DynText property statechange event handlers

  // For DynText tag parameters change.
  lces.dynText.onParamChange = function(propBase, param) {
    var newParam = "";
    
    param.forEach(function(i) {
      if (i.type === "text") {
        newParam += i.content;
      } else {
        var tempParam = propBase[i.name];
        
        if (i.handler && propBase.dynText.handlers[i.handler] && jSh.type(propBase.dynText.handlers[i.handler]) === "function")
          tempParam = propBase.dynText.handlers[i.handler](tempParam);
        
        newParam += tempParam;
      }
    });
    
    return newParam;
  }

  // For DynText tag content change
  lces.dynText.onContentChange = function(propBase, content) {
    var newContent = propBase[content.mainName];
    
    if (content.handler && propBase.dynText.handlers[content.handler] && jSh.type(propBase.dynText.handlers[content.handler]) === "function")
      newContent = propBase.dynText.handlers[content.handler](newContent);
    
    return newContent;
  }

  // For custom callback changes
  lces.dynText.onDynamicChange = function(propBase, prop) {
    if (jSh.type(prop.callback) !== "function")
      return false;
    
    var newProp  = "";
    
    // If it's one prop, it won't be treated like a concatenated string for non string values
    var singularProp = prop.parent.children.length === 1, singularValue;
    
    prop.parent.children.forEach(function(i) {
      var child = i.children[0];
      
      if (child.type === "text") {
        newProp += child.content;
      } else if (!child.context) {
        newProp += ""
      } else {
        var propCtx   = child.context;
        var tempProp  = propCtx[child.name];
        
        tempProp = tempProp === undf ? "" : tempProp;
        
        if (child.handler && jSh.type(propBase.dynText.handlers[child.handler]) === "function")
          tempProp = propBase.dynText.handlers[child.handler](tempProp);
        
        newProp += tempProp;
        
        if (singularProp)
          singularValue = tempProp;
      }
    });
    
    prop.callback(singularProp ? singularValue : newProp);
  }


  // Dynamic Text Lexer, returns list of tokens
  //
  // LCES DynText TOKEN TYPES: "text", "open", "close", "closed", "property"
  lces.dynText.lexerTypes = {
    "text": function(character) {
      return /[a-zA-Z\d_]/.test(character);
    },
    "number": function(character) {
      return /[\d]/.test(character);
    },
    "space": function(character) {
      return /[\t ]/.test(character);
    },
    "invalidPropChar": function(character) {
      return !(this.text(character) || this.number(character) || character === "#" || character === ".");
    }
  };

  lces.dynText.pushToken = function() {
    this.tokens.push({
      type: this.tokenType,
      content: this.tempToken
    });
  }

  lces.dynText.lexer = function(c, index, string, lexTypes) {
    // Did we finish?
    if (!c) {
      if (this.tempToken)
        this.pushToken();
      
      return false;
    }
    
    
    if (this.tempToken !== null) {
      // Check if it's a property
      if (this.tokenType === "property") {
        if (c === "}") {
          if (this.tempToken)
            this.pushToken();
          
          this.tokenType = "text";
          this.tempToken = null;
          
          return true;
          
        } else if (lexTypes.invalidPropChar(c)) {
          if (!this.forgiving) {
            var stringOff = index > 10 ? index - 5 : 0;
            var stringEnd = index + 5;
            var cursorOff = index - stringOff;
            var string = string.substr(stringOff, stringEnd).replace("\n", " ");
          
            this.tokens  = "Invalid property character \"" + c + "\" at character index " + index +  " \n\n";
            this.tokens += "\"" + string + "\" \n";
            this.tokens += " " + (new Array(cursorOff < 0 ? 0 : cursorOff)).join(" ") + " ^";
            
            return false;
          } else {
            // Just make it a text token and move on
            this.tokenType = "text";
            
            return true;
          }
        } else {
          this.tempToken += c;
          
          return true;
        }
        
        
      // It's just text
      } else {
        // Escaping a character?
        if (c === "\\") {
          this.charIndex += 1;
          this.tempToken += string[index + 1];
          
          return true;
        
        // Start of a property? Opening/Closing Bracket?
      } else if (c === "{" || (c === "[" || c === "]") && this.allowTags) {
          if (this.tempToken)
            this.pushToken();
          
          this.tempToken = null;
          
          this.charIndex -= 1;
          return true;
        } else {
          this.tempToken += c;
          
          return true;
        }
      }
      
      
      // There's no active token
    } else {
      if (c === "{") {
        this.tokenType = "property";
        this.tempToken = "";
        
        return true;
      } else if (c === "[" || c === "]") {
        this.tokenType = c === "[" ? "open" : "close";
        this.tempToken = null;
        
        if (this.tokenType === "open" && string[index + 1] === "/") {
          this.charIndex += 1;
          this.tokenType  = "closed";
        }
        
        this.pushToken();
        
        return true;
      } else {
        this.tokenType = "text";
        this.tempToken = c;
        
        return true;
      }
    }
  }


  // lces.dynText.processTokens(token, index, tokens)
  //
  // Description: lces.dynText.formatSyntax internal mechanism.
  lces.dynText.processTokens = function(token, index, tokens) {
    if (!token) {
      if (this.tempEntity !== this.entities) {
        if (!this.forgiving) {
          this.entities = "Error: Unexpected end of input";
          
          return false;
        } else {
          // Simply force things to work, no one cares.
          this.tempEntity = this.entities;
        }
      }
      
      return false;
    }
    
    // Are we dealing with params?
    if (this.entityContext === "tag") {
      if (token.type === "open") {
        if (!this.forgiving) {
          // Dynamic Text syntax error
          this.entities = "Syntax Error: Unexpected token type \"open\"";
          
          return false;
        } else {
          // Ignore it, just coerce it to be part of the params...
          this.tempEntity.params.push({
            type: this.tokenType,
            content: this.tempToken
          });
          
          return true;
        }
      } else if (token.type === "text") {
        this.tempEntity.params.push(token);
        
        return true;
      } else if (token.type === "property") {
        var propValues = token.content.split("#");
        
        if (propValues.length !== 2) {
          this.entities = "Syntax Error: Invalid property \"" + propValues[0] + "\"";
          
          return false;
        }
        
        this.tempEntity.params.push({
          type: "property",
          name: propValues[1],
          handler: propValues[0]
        });
        
        this.tempEntity.noParamRef = false;
        
        return true;
      } else if (token.type === "close") {
        if (this.tempEntity.params.length === 0) {
          this.entities = "Syntax Error: Empty opening tag";
          
          return false;
        }
        
        this.entityContext = "content";
        
        return true;
      }
    
    // We're dealing with entity content
    } else {
      if (token.type === "closed") {
        if (!tokens[index + 1] || !tokens[index + 2] || tokens[index + 1].type !== "text" || tokens[index + 2].type !== "close") {
          this.entities = "Syntax Error: Invalid closing tag";
          
          return false;
        }
        
        if (this.tempEntity === this.entities && !this.forgiving) {
          this.entities = "Syntax Error: Misplaced closing tag";
          
          return false;
        }
        
        this.tempEntity.type = tokens[index + 1].content;
        this.tokenIndex += 2;
        this.tempEntity = this.tempEntity.parent;
        
        return true;
      } else if (token.type === "open") {
        var tempEntity = {
          type: "text",
          params: [],
          children: [],
          noParamRef: true,
          noChildRef: true,
          parent: this.tempEntity
        };
        
        this.tempEntity.children.push(tempEntity);
        this.tempEntity = tempEntity;
        
        this.entityContext = "tag";
        return true;
      } else if (token.type === "text") {
        var tempEntity = {
          type: "text",
          params: [],
          children: [token],
          noParamRef: true,
          noChildRef: true,
          parent: this.tempEntity
        };
        
        this.tempEntity.children.push(tempEntity);
        
        return true;
      } else if (token.type === "property") {
        var propValues = token.content.split("#");
        
        if (propValues.length !== 2) {
          this.entities = "Syntax Error: Invalid property \"" + propValues[0] + "\"";
          
          return false;
        }
        
        var tempEntity = {
          type: "text",
          params: [],
          children: [{
            type: "property",
            name: propValues[1],
            handler: propValues[0]
          }],
          noParamRef: true,
          noChildRef: false,
          parent: this.tempEntity
        };
        
        this.tempEntity.children.push(tempEntity);
        
        this.tempEntity.noChildRef = false;
        
        var currEntity = this.tempEntity.parent;
        while (currEntity && currEntity.parent) {
          currEntity.parent.noChildRef = false;
          currEntity = currEntity.parent;
        }
        
        return true;
      }
    }
  }

  // lces.dynText.formatSyntax(tokens)
  //
  // tokens: Array of token objects
  //
  // Returns a formatted hieararchical representation of the inputted tokens
  // ready to be processed into their corresponding compenents, elements, listeners,
  // and states.
  lces.dynText.formatSyntax = function() {
    // Make our transparent container
    var main = {
      type: "main",
      params: [],
      children: [],
      noParamRef: true,
      noChildRef: true,
      parent: null
    };
    
    this.entities = main;
    this.tempEntity = main;
    
    while (this.processTokens(this.tokens[this.tokenIndex], this.tokenIndex, this.tokens)) {
      this.tokenIndex += 1;
    }
    
    return this.entities;
  }

  // lces.dynText.getContext(property)
  //
  // Description: lces.dynText.createRenderedEntities internal mechanism.
  lces.dynText.getContext = function(property) {
    var objects  = property.split(".");
    var curObj   = this.context;
    
    objects.pop(); // The last one should be the statename
    
    if (objects.length === 0)
      return curObj;
    
    for (var i=0; i<objects.length; i++) {
      var ctx = curObj[objects[i]];
      
      if (!ctx || !(ctx instanceof Object)) {
        curObj[objects[i]] = new lcComponent();
        
        if (ctx && jSh.type(ctx) === "object")
          jSh.extendObj(curObj[objects[i]], ctx, ["LCESName"]);
      }
      
      curObj = curObj[objects[i]];
    }
    
    return curObj;
  }

  // lces.dynText.createRenderedEntities(entity)
  //
  // Description: lces.dynText.renderEntities internal mechanism.
  lces.dynText.createRenderedEntities = function CRE(entity, cb) {
    var propBase     = this.context;
    var parentEntity = entity.parent;
    
    // Is it just text or a property?
    if (entity.type === "text") {
      if (entity.noChildRef) {
        if (this.allowTags) {
          entity.element = jSh.d(undf, ih(entity.children[0].content)).firstChild; // To make sure it's innerHTML
          entity.parent.element.appendChild(entity.element);
        }
      } else {
        var prop     = entity.children[0];
        var mainProp = prop.name.split(".").pop();
        
        // Set property name for referencing in updates
        prop.mainName = mainProp;
        
        if (this.allowTags) {
          entity.element = jSh.c("span");
          prop.element   = entity.element;
          
          // Set property span's className from property name
          entity.element.className = prop.name.replace(/\./g, "-");
          
          entity.parent.element.appendChild(entity.element);
        }
        
        var curCtx = this.getContext(prop.name);
        
        // Does the property/state exist?
        var existed = false, oldValue;
        
        if (curCtx[mainProp] || (curCtx[mainProp] === false || curCtx[mainProp] === null || curCtx[mainProp] === 0 || curCtx[mainProp] === "")) {
          existed  = true;
          oldValue = curCtx[mainProp];
        }
          
        if (!curCtx.states[mainProp])
          curCtx.setState(mainProp);
        
        // Is it dynText'ivated?
        if (!curCtx.states[mainProp].dynTextContent) {
          curCtx.addStateListener(mainProp, function(value) {
            if (!curCtx.states[mainProp].contentProps)
              return;
            
            curCtx.states[mainProp].contentProps.forEach(function(i) {
              i.element.innerHTML = lces.dynText.onContentChange(curCtx, i);
            });
          });
          
          // For 'special' instances
          curCtx.addStateListener(mainProp, function(value) {
            if (!curCtx.states[mainProp].dynamicProps || jSh.type(cb) !== "function")
              return;
            
            curCtx.states[mainProp].dynamicProps.forEach(function(i) {
              lces.dynText.onDynamicChange(propBase, i);
            });
          });
        }
        
        curCtx.states[mainProp].dynTextContent = true;
        
        // Check if tags e.g. [tagparam][/closingtag] are parsed or ignored
        if (this.allowTags) {
          // Normal innerHTML instances, nothing special.
          if (!curCtx.states[mainProp].contentProps)
            curCtx.states[mainProp].contentProps = [];
          
          curCtx.states[mainProp].contentProps.push(prop);
        } else {
          // Special instances, specific instances like single attributes etc.
          // Append our special CB function and properties
          jSh.extendObj(prop, {
            callback: cb,
            context: curCtx,
            parent: entity.parent,
            name: mainProp
          });
          
          if (!curCtx.states[mainProp].dynamicProps)
            curCtx.states[mainProp].dynamicProps = [];
          
          curCtx.states[mainProp].dynamicProps.push(prop);
        }
        
        // Set old value if it existed
        curCtx.setState(mainProp, oldValue, true);
      }
      
    // It's a tag
    } else if (entity.type !== "text") { // We shouldn't get here with this.allowTags on
      entity.element = lces.dynText.tags[entity.type].node().element;
      entity.element.update = lces.dynText.tags[entity.type].update;
      
      entity.parent.element.appendChild(entity.element);
      
      // Check for and setup params
      if (entity.params.length) {
        if (entity.noParamRef) {
          entity.element.update(entity.params[0].content);
          
        } else {
          entity.params.forEach(function(i) {
            
            if (i.name) {
              if (!propBase.states[i.name])
                propBase.setState(i.name);
              
              if (!propBase.states[i.name].dynTextParam)
                propBase.addStateListener(i.name, function(value) {
                  propBase.dynText.paramProps.forEach(function(k) {
                    k.element.update(lces.dynText.onParamChange(propBase, k));
                  });
                });
              
              propBase.states[i.name].dynTextParam = true;
            }
          });
          
          entity.params.element = entity.element;
          this.paramProps.push(entity.params);
        }
      }
      
      if (entity.children.length) {
        var CREBinded = CRE.bind(this);
        
        entity.children.forEach(function(i) {
          CREBinded(i);
        });
      }
    }
    
    return entity.element;
  }

  // lces.dynText.renderEntities()
  //
  // Description: Converts all entity output from the token syntax
  // formatter that are stored in the this.dynText context to HTML
  // DOM elements.
  lces.dynText.renderEntities = function(cb) {
    var main     = document.createDocumentFragment();
    var dynText  = this;
    
    // this.currEntity = this.entities;
    
    // Set main container
    var that = this;
    this.entities.element = main;
    
    // Loop entities
    this.entities.children.forEach(function(i, ind, arr) {
      dynText.createRenderedEntities(i, cb);
    });
    
    return main;
  }

  // lces.dynText.compile(dynText, callback)
  //
  // dynText:  String. To be compiled text with correct dynText syntax
  // callback: Function. Called if dynText.allowTags is false when a statechange occurs
  //
  // Description: Compiles the first argument string provided into dynText's so-called "entities"
  //   that are then made into DOM elements (If .allowTags isn't falsy). Otherwise they are just
  //   preserved for their order and calls the callback provided instead.
  lces.dynText.compile = function(s, cb) {
    if (!s || typeof s !== "string")
      return false;
    
    var that = this;
    
    // Some lexing variables
    this.tokens = [];
    this.tempToken = null;
    this.tokenType = "text";
    this.charIndex = 0;
    
    // For formatting
    this.tokenIndex = 0;
    this.tempEntity = null;
    
    // For rendering and setting up entities and their properties
    this.handlers     = jSh.extendObj({}, this.handlers);
    this.contentProps = [];
    this.paramProps   = [];
    
    
    while (this.lexer(s[this.charIndex], this.charIndex, s, this.lexerTypes)) {
      this.charIndex += 1;
    }
    
    if (jSh.type(this.tokens) === "string")
      throw Error(this.tokens);
    
    // Generate entities
    var entities = this.formatSyntax();
    
    if (jSh.type(entities) === "string")
      throw Error(entities);
    
    // Render output
    var mainFrag = this.renderEntities(cb);
    
    // Check for DynText links, if none found do nothing. TODO: Check this procedure
    if (entities.noChildRef) {
      if (this.element && this.allowTags) {
        if (this.element.childNodes[0])
          this.element.removeChild(jSh.toArr(this.element.childNodes));
        
        this.element.appendChild(mainFrag);
      }
      return false;
    }
    
    // TODO: DRY PRINCIPLE! ENFORCE!!!
    if (this.element) {
      var mainElement = this.element;
      
      if (mainElement.childNodes[0])
        mainElement.removeChild(jSh.toArr(mainElement.childNodes));
      
      mainElement.appendChild(mainFrag);
    }
    
    // If checking for dyn links, then they exist
    return true;
  }

  // Dynamic Text Handlers
  //

  // Handlers that'll be included by default
  lces.dynText.handlers = {
    trim: function(s) {
      return (s + "").trim();
    }
  };

  // lces.dynText.dynSanitize(raw)
  //
  // Description: Sanitizes strings of possible dynText error prone triggers
  lces.dynText.dynSanitize = function(str) {
    return str.replace(/\{|\[/g, "\\$1");
  }


  // lcDynamicText(fresh)
  //
  // fresh: Boolean. Optional. If set to non-falsy value, will ignore
  //        any older dynText configurations... WARNING/TODO: May cause
  //        nasty conflicts and side effects.
  //
  // Description: Called in the context of an lcWidget component
  // and adds a textual linking functionality that links portions
  // of it's innerText/innerHTML to specified lces states/properties
  // for said lcWidget component.
  //
  // Example:
  //   x.text = "Just so you know, {#soda} isn't as healthy as {#fruit} juice. [url:{#moreInfoURL}]Learn More[/url]"
  //
  // Which links the portions of the text enclosed in the curly braces format to
  // the following states:
  //   x.soda  = "Coca Cola";
  //   x.fruit = "apple";
  //   x.moreInfoURL = "http://some.health-site.com/soda-delicious-but-harmful/";
  //
  // And the innerText/innerHTML will update accordingly
  window.lcDynamicText = function(fresh) {
    if (this.dynText && !fresh)
      return;
    
    var that = this;
    
    this.dynText = {
      // For lexing
      charIndex: 0,
      tokenType: "text", // Current token type by Lexer
      tempToken: null,   // String to contain current token value
      tokens: [],
      
      // For syntax reformatting
      tokenIndex: 0,
      tempEntity: null,
      entityContext: "content", // "tag", "content"
      entities: {},
      
      // POST Reformatting Data containers
      states: {},
      handlers: {},
      contentProps: [],
      paramProps: [],
      
      context: this,
      component: this,
      element: this.element
    };
    
    // EXTENDS POSSIBLY EXISTING PROPERTIES/STATES WITH
    // state["dynTextParam"] or state["dynTextContent"]
    
    jSh.extendObj(this.dynText, lces.dynText);
    
    // To compile to dynText you have set Component.dynTextTrigger = "STATE_NAME"
    if (this.dynTextTrigger) {
      var dynTextTrigger = this.dynTextTrigger;
      
      this.addStateListener(dynTextTrigger, function(text) {
        that.dynText.compile(text);
      });
    }
  }


  // Misellaneous 'small' lces functions

  // LCES UI ScrollTo Function

  lces.ui.setState("scrollY", scrollY);
  lces.ui.addStateListener("scrollY", function(height) {
    if (jSh.type(height) === "object" && height.element || height instanceof Node) {
      var element = height.element || height;
      var bcr     = element.getBoundingClientRect();
      var offH    = element.offsetHeight;
      
      height = bcr.top + scrollY - ((innerHeight) / 2) + (offH / 2);
    }
    
    
    if (isNaN(height))
      return false;

    
    var diff = height - scrollY;
    var cur  = scrollY;
    
    clearQS(lces.ui._scrollProcess);
    
    function func01(n) {
      scrollTo(scrollX, cur + (n * diff));
    }
    
    function end01() {
      lces.ui.scrollY = undefined;
    }
    
    lces.ui._scrollProcess = new qsFadein(func01, 0, 1, 0.35, end01, undf, true, 0.002);
  });

  lces.ui.states["scrollY"].get = function() {
    return scrollY;
  }


  // LCES Resizing Event

  lces.ui.setState("resize", 0);
  lces.ui._resizeTimeout = null;

  window.addEventListener("resize", function() {
    if (lces.ui._resizeTimeout)
      clearTimeout(lces.ui._resizeTimeout);
    
    lces.ui._resizeTimeout = setTimeout(function() {
      lces.ui.setState("resize", innerWidth, true);
    }, 500);
  });


  // LCES Mobile
  //
  // Anchor all state listeners for mobile to
  // lces.ui.mobile
  lces.ui.setState("mobile", null);
  lces.ui.mobileWidth = 560;

  // Can be used to manually for mobile sized viewport
  lces.ui.assertMobile = function() {
    if (innerWidth <= lces.ui.mobileWidth)
      lces.ui.mobile = true;
    else
      lces.ui.mobile = false;
  }

  window.addEventListener("resize", lces.ui.assertMobile);
}
// LCES Templating System




// NEW CODE
lces.rc[5] = function() {
  lces.template = function template(options) {
    if (!options)
      throw Error("lces.template() requires one options object as the first argument");
    
    if (!options.render)
      throw Error("lces.template(options) options object must contain a MockupElement as a render property");
    
    if (!(options.render instanceof jSh.MockupElement))
      throw Error("Element provided does not implement the jSh.MockupElement interface");
    
    return template.build(options);
  }

  // Template add initiation function method
  lces.template.addInit = function(func) {
    if (typeof func === "function")
      this.__initFuncs.push(func);
  }

  // Template remove initiation function method
  lces.template.removeInit = function(func) {
    var index = this.__initFuncs.indexOf(func);
    
    if (index !== -1)
      this.__initFuncs.splice(index, 1);
  }

  // LCES Template Building method. Builds every LCES template constructor
  lces.template.build = function build(options) {
    
    // Build new function
    var newFunc = function LCESTemplate(args, appendNodes) {
      if (this instanceof lces.template) {
        // Check if dynContext object was provided as args — Élégānce
        if (!args || !(args instanceof lcComponent)) {
          var newContext = LCESTemplate.context && LCESTemplate instanceof lcComponent ? LCESTemplate.context : new lcWidget();
          
          if (jSh.type(args) === "object") {
            // Check if LCESTemplate.context was provided as an object that isn't constructed with lcComponent
            if (jSh.type(LCESTemplate.context) === "object" && newContext !== LCESTemplate)
              jSh.extendObj(args, LCESTemplate.context);
            
            jSh.extendObj(newContext, args, "LCESName");
          }
          
          args = newContext;
        } else {
          // dynContext was provided, but the true context might be within
          if (jSh.type(LCESTemplate.context) === "string" && jSh.type(args[LCESTemplate.context]) === "object") {
            if (!(args[LCESTemplate.context] instanceof lcComponent)) {
              var newArgsContext = new lcWidget();
              
              jSh.extendObj(newArgsContext, args[LCESTemplate.context], "LCESName");
              
              args = newArgsContext;
            } else {
              args = args[LCESTemplate.context];
            }
          }
        }
        
        // Add dynText to context
        lcDynamicText.call(args);
        
        // Add context loopback
        args.context = args;
        
        // Conceive new native DOMNode
        var newElement = LCESTemplate.render.conceive(true, args);
        
        // Run init functions on the new DOMNode
        LCESTemplate.__initFuncs.forEach(function(i) {
          i(newElement, (args || LCESTemplate.context));
        });
        
        // If no dynContext was provided, link the alternative newContext
        if (newContext) {
          newElement.component = newContext;
          newContext.element = newElement;
        }
        
        // If there's an appending function and appendNodes, run function
        if (appendNodes && LCESTemplate.append)
          LCESTemplate.append(appendNodes, newElement);
        
        return newElement;
        
      } else {
        var newOptions = {
          render: LCESTemplate.render.cloneNode(true),
          __initFuncs: LCESTemplate.__initFuncs.slice(),
          context: (args ? args.context : null) || LCESTemplate.context
        };
        
        // Check for appending function
        if (args && args.append && typeof args.append === "function" && args.length >= 2)
          newOptions.append = args.append;
        
        // Check for initiation function
        if (args && args.init) {
          var argType = jSh.type(args.init);
          
          if (argType === "array")
            newOptions.__initFuncs = newOptions.__initFuncs.concat(args.init);
          else if (argType === "function")
            newOptions.__initFuncs.push(args.init);
        }
        
        return lces.template.build(newOptions);
      }
    }
    
    newFunc.render = options.render;
    
    // Initiation functions array
    Object.defineProperty(newFunc, "__initFuncs", {
      value: options.__initFuncs ? options.__initFuncs.slice() : [],
      enumerable: false,
      configurable: false,
      writable: false
    });
    
    newFunc.addInit    = lces.template.addInit;
    newFunc.removeInit = lces.template.removeInit;
    
    newFunc.context = options.context;
    
    // Make the new function instance of lces.template
    jSh.inherit(newFunc, lces.template);
    
    return newFunc;
  }

  // jSh MockupElement Methods
  jSh.MockupElementMethods = {
    // Conversion/Copying functions
    construct: function(deep, clone, dynContext) {
      var that   = this;
      var newElm = clone ? jSh.MockupElement(this.tagName) : jSh.e(this.tagName);
      
      // Disallow tags in the dynText compiling
      if (dynContext)
        dynContext.dynText.allowTags = false;
      
      // Set the attributes
      Object.getOwnPropertyNames(this.attributes).forEach(function(i) {
        if (dynContext) {
          dynContext.dynText.compile(that.attributes[i], function(s) {
            newElm.setAttribute(i, s);
          });
        } else
          newElm.setAttribute(i, that.attributes[i]);
      });
      
      // Add event listeners
      Object.getOwnPropertyNames(this.__events).forEach(function(i) {
        var cb, bubble;
        var evt = that.__events[i];
        
        for (var j=0; j<evt.length; j+=2) {
          cb     = evt[j];
          bubble = evt[j + 1];
          
          newElm.addEventListener(i, cb, bubble);
        }
      });
      
      // TODO: This is probably overly redundant
      if (this.getAttribute("style"))
        newElm.setAttribute("style", this.getAttribute("style"));
        
      // Check innerHTML and textContent
      if (dynContext) {
        dynContext.dynText.element = newElm;
        
        // Remove the innerHTML/textContent from the exclusion array
        jSh.spliceItem(jSh.MockupElementOnlyProps, "innerHTML", "_innerHTML", "textContent", "_textContent");
        
        if (this._textContent) {
          var textNode = jSh.c("span", undf, this._textContent);
          
          var resC = dynContext.dynText.compile(this._textContent, function(s) {
            textNode.textContent = s;
          });
          // console.log(this._textContent, dynContext, resC);
          
          newElm.appendChild(textNode);
          
          jSh.pushItems(jSh.MockupElementOnlyProps, "textContent", "_textContent");
        } else if (this._innerHTML) {
          dynContext.dynText.allowTags = true;
          
          var c = dynContext.dynText.compile(this._innerHTML);
          
          jSh.pushItems(jSh.MockupElementOnlyProps, "innerHTML", "_innerHTML");
        }
        
        dynContext.dynText.allowTags = false;
        dynContext.dynText.element   = null;
      }
      
      // Add own properties from initial MockupElement
      // TODO: Optimize this!!!!
      Object.getOwnPropertyNames(this).filter(function(i) {return jSh.MockupElementOnlyProps.indexOf(i) === -1;}).forEach(function(i) {
        if (dynContext && jSh.type(that[i]) === "string") {
          var dyn = dynContext.dynText.compile(that[i] + "", function(s) {
            newElm[i] = s;
          });
          
          if (!dyn)
            newElm[i] = that[i];
        } else if (that[i])
          newElm[i] = that[i];
      });
      
      // Finally add the classNames if any
      if (this.className)
        newElm.className = this.className;
      
      // If deep is true, then traverse all the children
      if (deep) {
        var method = clone ? "cloneNode" : "conceive";
        
        this.childNodes.forEach(function(i) {
          newElm.appendChild(i[method](true, dynContext));
        });
      }
      
      // End
      return jSh(newElm);
    },
    
    // Return a full fledged DOM Node
    conceive: function(deep, dynContext) {
      return this.construct(deep, false, dynContext);
    },
    
    // Return a MockupElement copy
    cloneNode: function(deep) {
      return this.construct(deep, true);
    },
    
    // Child manipulation methods
    __childCheck: function(args, e, error) {
        if (args && jSh.hasMultipleArgs(args, this))
          return false;
        
        if (!(e instanceof jSh.MockupElement)) {
          if (jSh.type(e) === "function" && e.prototype)
          if (e.prototype instanceof lces.template)
            return true;
          else; // TODO: Lacking? Maybe?
          else
            throw TypeError(error || "Element provided doesn't implement the jSh.MockupElement interface");
        }
        
        return true;
    },
    
    __childDetermineType: function(e, create) {
      if (typeof e === "function") {
        if (create || !e.lcesTemplateMockupWrapper)
          return jSh.cm("lces-template-constructor", e);
        else
          return e.lcesTemplateMockupWrapper;
      }
      
      return e;
    },
    
    appendChild: function(e) {
      if (!this.__childCheck(arguments, e))
        return undf;
      
      e = this.__childDetermineType(e);
      
      this.childNodes.push(e);
      e.__privParentNode = this;
    },
    removeChild: function(e) {
      if (!this.__childCheck(arguments, e))
        return false;
      
      e = this.__childDetermineType(e);
      
      var index = this.childNodes.indexOf(e);
      
      if (index !== -1) {
        this.childNodes.splice(index, 1);
        e.__privParentNode = null;
      }
    },
    insertBefore: function(e, e2) {
      if (!this.__childCheck(undf, e, "Element provided doesn't implement the jSh.MockupElement interface"))
        return false;
      
      e  = this.__childDetermineType(e);
      e2 = this.__childDetermineType(e2);
      
      var index = this.childNodes.indexOf(e2);
      
      if (index !== -1) {
        this.childNodes.splice(index, 0, e);
        e.__privParentNode = this;
      }
    },
    
    // A function for traversing all children of the element
    traverse: function(e, cb) {
      var that = this;
      
      e.childNodes.forEach(function(i) {
        cb(i);
        
        if (i.childNodes[0])
          that.traverse(i, cb);
      });
    },
    
    // Query selectors
    getElementsByTagName: function(tagname) {
      var elements = [];
      
      this.traverse(this, function(e) {
        if (e.tagName.toLowerCase() === tagname.toLowerCase())
          elements.push(e);
      });
      
      return elements;
    },
    getElementsByClassName: function(classname) {
      var elements = [];
      
      this.traverse(this, function(e) {
        if (e.classList.contains(classname))
          elements.push(e);
      });
      
      return elements;
    },
    getElementById: function(id) {
      var element = null;
      
      this.traverse(this, function(e) {
        if (e.id === id)
          element = e;
      });
      
      return element;
    },
    
    // Event handling
    addEventListener: function(evt, callback, bubble) {
      var evtArray = this.__events[evt];
      
      // Check for event array
      if (!evtArray) {
        evtArray = [];
        this.__events[evt] = evtArray;
      }
      
      evtArray.push(callback, bubble);
    },
    removeEventListener: function(evt, callback) {
      var evtArray = this.__events[event];
      
      if (!evtArray)
        return null;
      
      var index = evtArray.indexOf(e);
      
      if (index !== -1)
        evtArray.splice(index, 1);
    },
    
    // Set the styles from an attribute assignment
    __setStyleFromAttr: function(styles) {
      var that = this;
      
      this.style   = {};
      var styleObj = this.style;
      
      var properties = styles.split(/\s*;\s*/g);
      
      properties.forEach(function(i) {
        if (!i.trim(""))
          return;
        
        var nameVal = i.split(/\s*:\s*/);
        
        var nameSplit = nameVal[0].split("-");
        nameSplit = nameSplit.map(function(n, i) {if (i!==0) var c = n[0].toUpperCase(); else var c = n[0].toLowerCase(); return c + n.substr(1);}).join("");
        
        styleObj[nameSplit] = nameVal[1];
      });
    },
    __JSProp2CSS: function(prop) {
      var upper = /[A-Z]/;
      prop = prop.split("");
      
      return prop.map(function(i) {return upper.test(i) ? "-" + i.toLowerCase() : i;}).join("");
    },
    __getStyleFromAttr: function() {
      var that  = this;
      var style = this.style;
      
      return Object.getOwnPropertyNames(style).map(function(i) {return that.__JSProp2CSS(i) + ": " + style[i] + ";";}).join("");
    },
    
    // Attribute handling
    setAttribute: function(attr, value) {
      attr  = attr + ""; // Quick n' dirty to string conversion
      value = value + "";
      
      this.attributes[attr] = value;
      
      if (attr === "style")
        this.__setStyleFromAttr(value);
    },
    getAttribute: function(attr) {
      return attr !== "style" ? this.attributes[attr] : this.__getStyleFromAttr();
    },
    removeAttribute: function(attr) {
      attr = attr + "";
      
      this.attributes[attr] = undf;
    }
  };

  jSh.MockupElementClassList = {
    manipulateClass: function(classn, add) {
      if (!add && classn === undf) { // Remove all classnames
        this.classes = [];
        
      } else if (jSh.type(classn) && classn.trim()) {
        var classes    = classn.split(/\s+/);
        var classArray = this.classes;
        
        classes.forEach(function(i) {
          var exists = classArray.indexOf(i);
          
          if (add && exists === -1 || !add && exists !== -1)
          if (add)
            classArray.push(i);
          else
            classArray.splice(i, 1);
        });
      }
    },
    add: function(classn) {
      this.manipulateClass(classn, true);
    },
    remove: function(classn) {
      this.manipulateClass(classn, false);
    },
    contains: function(classn) {
      return this.classes.indexOf(classn) !== -1;
    },
    toggle: function(classn) {
      if (this.contains(classn))
        this.remove(classn);
      else
        this.add(classn);
    }
  };

  // Array of properties to NOT copy to the real element
  jSh.MockupElementOnlyProps = [];
  jSh.MockupElementOnlyProps = jSh.MockupElementOnlyProps.concat(Object.getOwnPropertyNames(jSh.MockupElementMethods));
  jSh.MockupElementOnlyProps = jSh.MockupElementOnlyProps.concat([
    "classList", "style", "childNodes", "tagName",
    "__events", "attributes", "jSh", "parentNode",
    "previousSibling", "nextSibling", "getChild",
    "on", "__privParentNode", "__apch", "__rmch",
    "nodeType", "className"
  ]);

  // Elements that CANNOT contain children
  jSh.MockupElementsBarren = ["img", "input", "link", "meta"];

  // jSh Mockup Element
  jSh.MockupElement = function MockupElement(tagname) {
    if (!(this instanceof MockupElement))
      return new MockupElement(tagname);
    
    // We're in our protective bubble, nice.
    var that = this;
    tagname  = jSh.type(tagname) === "string" ? tagname : "div";
    
    // Set our fake nodeType
    this.nodeType = Node.ELEMENT_NODE;
    
    // Add the tagname
    Object.defineProperty(this, "tagName", {
      value: tagname.toUpperCase(),
      enumerable: true,
      configurable: false,
      writable: false
    });
    
    // Add the styles object
    var privStyle = {};
    
    Object.defineProperty(this, "style", {
      enumerable: true,
      configurable: false,
      get: function() {return privStyle}
    });
    
    // Add the parentNode property
    Object.defineProperty(this, "__privParentNode", {
      value: null,
      enumerable: false,
      configurable: false,
      writable: true
    });
    
    Object.defineProperty(this, "parentNode", {
      enumerable: true,
      configurable: false,
      get: function() {return that.__privParentNode}
    });
    
    // Previous and Next Sibling
    Object.defineProperty(this, "previousSibling", {
      enumerable: true,
      configurable: false,
      get: function() {
        if (!that.parentNode)
          return null;
        
        var index  = that.parentNode.childNodes.indexOf(that);
        // var length = that.parentNode.childNodes.length;
        
        if (index === 0)
          return null;
        
        return that.parentNode.childNodes[index - 1];
      }
    });
    
    Object.defineProperty(this, "nextSibling", {
      enumerable: true,
      configurable: false,
      get: function() {
        if (!that.parentNode)
          return null;
        
        var index  = that.parentNode.childNodes.indexOf(that);
        var length = that.parentNode.childNodes.length;
        
        if (index === length - 1)
          return null;
        
        return that.parentNode.childNodes[index + 1];
      }
    });
    
    // Add the childNodes array
    Object.defineProperty(this, "childNodes", {
      value: [],
      enumerable: true,
      configurable: false,
      writable: false
    });
    
    // Add the children array, lists functions are they were originally appended
    Object.defineProperty(this, "children", {
      enumerable: true,
      configurable: false,
      get: function() {
        return that.childNodes.map(function(i) {
          if (i.tagName.toLowerCase() === "lces-template-constructor")
            return i.__lcesTemplateConstructor;
          
          return i;
        });
      }
    });
    
    // An object that contains all the event callbacks
    Object.defineProperty(this, "__events", {
      value: {
        // Will contain all the event callbacks here
      },
      enumerable: true,
      configurable: false,
      writable: false
    });
    
    // Add attributes
    Object.defineProperty(this, "attributes", {
      value: {},
      enumerable: true,
      configurable: false,
      writable: false
    });
    
    // Add all the methods
    jSh.extendObj(this, jSh.MockupElementMethods);
    
    // Add classList functionality
    Object.defineProperty(this, "classList", {
      value: jSh.extendObj({classes: [], element: this}, jSh.MockupElementClassList),
      enumerable: true,
      configurable: false,
      writable: false
    });
    
    // Add classList length property
    Object.defineProperty(this.classList, "length", {
      enumerable: true,
      configurable: false,
      get: function() {return that.classList.length;}
    });
    
    // Add dynamic className property
    Object.defineProperty(this, "className", {
      enumerable: true,
      configurable: false,
      get: function() {return that.classList.classes.join(" ");},
      set: function(classes) {
        if (jSh.type(classes) && classes.trim()) {
          that.classList.remove();
          that.classList.add(classes);
        } else {
          that.classList.remove();
        }
      }
    });
  }

  jSh.MockupElement.prototype.constructor = jSh.MockupElement;


  // MockupText, similar to document.createTextNode
  jSh.__MockupTextConceive = function(d, dynContext) {
    if (dynContext) {
      dynContext.dynText.allowTags = true;
      dynContext.dynText.element   = document.createDocumentFragment();
      
      var compiled = dynContext.dynText.compile(d);
      
      if (compiled)
        return dynContext.dynText.element;
      else
        return jSh.t(this.nodeValue);
      
    } else {
      // No context provided
      return jSh.t(this.nodeValue);
    }
  }

  jSh.MockupText = function MockupText(text) {
    if (!(this instanceof jSh.MockupText))
      return new jSh.MockupText(text);
    
    this.nodeValue = text;
    this.nodeType  = Node.TEXT_NODE;
    
    // Conceive Method
    this.conceive = jSh.__MockupTextConceive;
  }

  jSh.inherit(jSh.MockupText, jSh.MockupElement);

  // MockupElement Creation Functions
  jSh.dm = function nodeM(className, text, child, attributes, properties, events) { // Div MockupElement
    return jSh.d.call({lcesElement: jSh.MockupElement("div")}, className, text, child, attributes, properties, events);
  }

  jSh.cm = function nodeCM(type, className, text, child, attributes, properties, events) { // Custom MockupElement
    if (type !== "lces-template-constructor")
      return jSh.d.call({lcesElement: jSh.MockupElement(type)}, className, text, child, attributes, properties, events);
    else
      return jSh.d.call({lcesElement: jSh.MockupElement(type)}, {prop: {
        __lcesTemplateConstructor: className,
        conceive: function(d, dynContext) {
          // console.log(dynContext);
          return new this.__lcesTemplateConstructor(dynContext);
        }
      }});
  }

  jSh.tm = function textM(text) {
    return jSh.MockupText(text);
  }

  // LCES Templating Placeholder element

  // Placeholder method for replacing it with a real node or MockupElement
  lces.template.__placeHolderReplace = function(e) {
    var e = this._determineType(e);
    
    if (!this.parent)
      return null;
    
    this.parent.insertBefore(e, this.element);
    this.parent.removeChild(this.element);
  };
  
  lces.template.__placeHolderSubstitute = function(e) {
    var e = this._determineType(e);
    
    if (!e.parentNode)
      return null;
    
    e.parentNode.insertBefore(this.element, e);
    e.parentNode.removeChild(e);
  };

  // LCES Placeholder Constructor
  function lcPlaceholder(e) {
    var that = this;
    
    lcWidget.call(this, e);
    
    this.type = "LCES Placeholder Widget";
    
    this.replace = lces.template.__placeHolderReplace;
    this.substitute = lces.template.__placeHolderSubstitute;
    this.element.replace = lces.template.__placeHolderReplace.bind(this);
    this.element.substitute = lces.template.__placeHolderSubstitute.bind(this);
    
    this.addStateListener("phName", function(phName) {
      that.element.setAttribute("ph-name", phName);
    });
  }

  jSh.inherit(lcPlaceholder, lcWidget);

  // Create DOM placeholder element
  jSh.ph = function(phName) {
    var widget = new lcPlaceholder(jSh.c("lces-placeholder"));
    
    widget.phName = phName;
    
    return widget.element;
  };

  // Create MockupElement placeholder element
  jSh.phm = function(phName) {
    var widget = new lcPlaceholder(jSh.cm("lces-placeholder"));
    
    widget.phName = phName;
    
    return widget.element;
  };

  // Scan for Placeholders on lces init
  lces.template.initLoadPH = function() {
    var placeholders = jSh("lces-placeholder");
    
    // Setup placeholders
    placeholders.forEach(function(i) {
      var attrVal = i.getAttribute("ph-name");
      var widget  = new lcPlaceholder(i);
      
      if (attrVal) {
        i.phName = attrVal;
        widget.phName = attrVal;
      }
    });
  }

  // Initiation function that scans the DOM after it loads for <lces-template> elements
  lces.template.initLoadTemplates = function() {
    var templates = jSh("lces-template");
    
    templates.forEach(function(templ) {
      var templConstructor = lces.template.list[templ.getAttribute("template")];
      var contextName      = templ.getAttribute("context");
      
      if (templConstructor && templ.getAttribute("context")) {
        var context = (contextName ? lces(contextName) : null) || new lcComponent();
        
        if (contextName)
          context.LCESName = contextName;
        
        var templId = templ.id;
        var classes = templ.className.split(" ");
        
        // Create new element
        var newElm = new templConstructor(context, jSh.toArr(templ.childNodes));
        
        // Add classnames
        classes.forEach(function(c) {
          if (c)
            newElm.classList.add(c);
        });
        
        // Add id
        if (templId)
          newElm.id = templId;
        
        // Prevent conflicts
        templ.id = "";
        
        // End
        templ.parentNode.insertBefore(newElm, templ);
        templ.parentNode.removeChild(templ);
      }
    });
  }

  lces.addInit(lces.template.initLoadTemplates);
  lces.addInit(lces.template.initLoadPH);


  // Template list
  lces.template.list = {};
}
