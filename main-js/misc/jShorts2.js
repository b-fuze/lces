// jShorts 2 Code
//
// Supposed to shorten my writing of vanilla JS, some quick shortcuts.

function getGlobal() {
  return this;
}

if (!getGlobal().lces)
  lces = {rc: [], onlyjSh: true, global: getGlobal()};
else
  lces.global = getGlobal();

lces.rc[0] = function() {
  lces.global = !lces.global ? window : lces.global;
  lces.global.undf = undefined;
  
  // Quick console prone errors mitigation
  if (!lces.global.console)
    Object.defineProperty(lces.global, "console", {
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
  lces.global.jSh = function jSh(src, first) {
    if (typeof src === "string" || typeof src === "number") {
      // "Locate" mode
      
      var parent   = this === jSh.global ? document : (this instanceof Node || jSh.MockupElement && this instanceof jSh.MockupElement ? this : (lces.global.lcWidget && this instanceof lcWidget ? this.element : document));
      var selector = jSh.determineSelector(src);
      var result   = jSh[selector](selector === "queryAll" || selector === "tag" || selector === "getChild" ? src : src.substr(1), parent, first);
      
      // Shorten them
      if (result) {
        if (jSh.type(result) === "array") {
          for (var i=0,l=result.length; i<l; i++) {
            var elm = result[i];
            
            if (!elm.jSh) {
              elm.getParent = jSh.getParent;
              elm.getChild  = jSh.getChild;
              elm.on        = jSh.onEvent;
              elm.jSh       = jSh;
              
              // Improve append and removechild methods
              elm.__apch = elm.appendChild;
              elm.__rmch = elm.removeChild;
              
              elm.appendChild = jSh.elementExt.appendChild;
              elm.removeChild = jSh.elementExt.removeChild;
            }
          }
        } else if (!result.jSh) {
          result.getParent = jSh.getParent;
          result.getChild  = jSh.getChild;
          result.on        = jSh.onEvent;
          result.jSh       = jSh;
          
          // Improve append and removechild methods
          result.__apch = result.appendChild;
          result.__rmch = result.removeChild;
          
          result.appendChild = jSh.elementExt.appendChild;
          result.removeChild = jSh.elementExt.removeChild;
        }
      }
      
      return result;
    } else {
      // "Shorten" mode
      // In this mode «first» is referring to whether to enclose it in an lcWidget
      
      var e = jSh.determineType(src);
      
      if (!e)
        return false;
      
      if (first)
        new lcWidget(e);
      
      if (!e.jSh)
        jSh.shorten(e);
      
      return e;
    }
  }
  
  // Global
  jSh.global = lces.global;

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
  
  // Remove multiple items from an array
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
  
  // Similar to extendObj, but will go into deeper objects if they exist and merging the differences
  jSh.mergeObj = function(obj, extension, dontReplaceObjects, dontReplaceValues) {
    function merge(curObj, curExt) {
      Object.getOwnPropertyNames(curExt).forEach(function(i) {
        var curProp    = curObj[i];
        var curExtProp = curExt[i];
        
        if (jSh.type(curProp) === "object" && jSh.type(curExtProp) === "object")
          merge(curProp, curExtProp);
        else if (dontReplaceValues && curProp === undf)
          curObj[i] = curExtProp;
        else if (!dontReplaceObjects || jSh.type(curProp) !== "object" && (!dontReplaceValues || curProp === undf))
          curObj[i] = curExtProp;
      });
    }
    
    merge(obj, extension);
    return obj;
  }
  
  jSh.constProp = function(obj, propName, propValue) {
    Object.defineProperty(obj, propName, {
      configurable: false,
      writable: false,
      enumerable: true,
      value: propValue
    });
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
  
  jSh.strCapitalise = function(str) {
    str = str + "";
    
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
  }
  
  // Options determining utils
  jSh.boolOp = function(src, def) {
    return src !== undefined ? !!src : def;
  }

  jSh.numOp = function(src, def) {
    return !isNaN(src) && typeof src === "number" && src > -Infinity && src < Infinity ? parseFloat(src) : def;
  }

  jSh.strOp = function(src, def) {
    return typeof src === "string" && src ? src : def;
  }
  
  // To silently mitigate any JSON parse error exceptions to prevent the whole from self destructing
  jSh.parseJSON = function(jsonstr) {
    var result;
    
    try {
      result = JSON.parse(jsonstr);
    } catch (e) {
      console.warn(e);
      
      result = {error: "JSON parse failed", data: null};
    }
    
    return result;
  }
  
  jSh.filterHTML = function(s) {
    s = s.replace(/&/g, "&amp;");
    s = s.replace(/</g, "&lt;");
    s = s.replace(/>/g, "&gt;");
    return s;
  }
  
  // DOM Creation Functions

  // Create HTML DOM Div elements with a flexible nesting system
  jSh.d = function node(className, text, child, attributes, properties, events) { // For creating an element
    var nsElm; // For things like SVG... Ugggh. :|
    
    if (!this.lcesElement) {
      // Check if we need to make an element with a custom namespace URI
      if (this.lcesType) {
        var nsCheck = /^ns:[\w\d_]+:[^]+$/i.test(this.lcesType);
        
        if (!nsCheck)
          var n = jSh.e(this.lcesType);       // Create main element, if this isn't window, set to specified element.
        else {
          // var nsURI = this.lcesType.replace(/^ns:[\w\d_]+:([^]+)$/i, "$1"); TODO: Check this
          var nsElm = this.lcesType.replace(/^ns:([\w\d_]+):[^]+$/i, "$1");
          
          var n = jSh.e(this.lcesType);
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

      className  = args.className || args.class || args.sel;
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
          if (!checkNSAttr.test(attr) || jSh.MockupElement && n instanceof jSh.MockupElement)
            n.setAttribute(attr, attributes[attr]);
          else {
            var nsURI = attr.replace(/^ns:[^:]+:([^]*)$/i, "$1");
            var nsAttr = attr.replace(/^ns:([^:]+):[^]*$/i, "$1");
            
            n.setAttributeNS(nsURI ? nsURI : null, nsAttr, attributes[attr]);
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
    var nsCheck = /^ns:[\w\d_]+:[^]+$/i.test(tag);
    if (!nsCheck) {
      return document.createElement(tag);
    } else {
      var nsURI = tag.replace(/^ns:[\w\d_]+:([^]+)$/i, "$1");
      var nsElm = tag.replace(/^ns:([\w\d_]+):[^]+$/i, "$1");
      
      var n = document.createElementNS(nsURI, nsElm);
      n.nsElm = true;
      
      return n;
    }
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
  
  // Check if in browser environment
  if (lces.global.document)
    jSh.docFrag = document.createDocumentFragment.bind(document);
  
  // DOM Manipulation Functions

  jSh.getChild = function(off, length) {
    var parent = typeof length === "object" ? length : this;
    var children = jSh.toArr(parent.childNodes);
    var check = [];
    var ELM_NODE = Node.ELEMENT_NODE;
    
    for (var i=children.length-1; i>=0; i--) {
      var child = children[i];
      
      if (child.nodeType === ELM_NODE) {
        check.push(child);
        
        if (!child.jSh)
          jSh.shorten(child);
      }
    }
    
    if (off < 0)
      off = check.length + off;
    
    if (!children[off])
      return null;
    
    if (typeof length === "number" && length > 1)
      return children.slice(off, off + length);
    else
      return children[off];
  }
  
  jSh.getParent = function(jump) {
    if (jSh.type(jump) !== "number" || jump < 0)
      return null;
    
    var par = this;
    while (jump > 0 && par !== document.body) {
      par = par.parentNode;
      
      jump--;
    }
    
    return par;
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
      e.getParent = jSh.getParent;
      e.getChild  = jSh.getChild;
      e.on        = jSh.onEvent;
      e.jSh       = jSh;
      
      // Improve append and removechild methods
      e.__apch = e.appendChild;
      e.__rmch = e.removeChild;
      
      e.appendChild = jSh.elementExt.appendChild;
      e.removeChild = jSh.elementExt.removeChild;
    }
    
    return e;
  }
  
  jSh.elementExt = {
    appendChild: function() {
      var children = jSh.toArr(arguments);
      
      if (jSh.type(children[0]) === "array")
        children = children[0];
      
      for (var i=0,l=children.length; i<l; i++) {
        this.__apch(children[i]);
      }
    },
    removeChild: function() {
      var children = jSh.toArr(arguments);
      
      if (jSh.type(children[0]) === "array")
        children = children[0];
      
      for (var i=0,l=children.length; i<l; i++) {
        this.__rmch(children[i]);
      }
      
      if (children.length === 1)
        return children[0];
      else
        return children;
    }
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
    if (typeof str === "number") {
      return "getChild";
    } else if (jSh.isID.test(str)) {
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
    
    if (lces.global.lcWidget && obj instanceof lcWidget && obj.element instanceof Node)
      return obj.element;
    
    return null
  }


  // A quick typo-fill :D
  var jSH = jSh;
};

if (lces.onlyjSh)
  lces.rc[0]();

// Check if NPM module
if (lces.global.global && !lces.global.window)
  module.exports = jSh;
