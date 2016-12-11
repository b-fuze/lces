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
    var parent, doc, result;
    
    if (typeof src === "string") {
      // "Locate" mode
      
      if (this === jShGlobal) {
        doc = true;
        parent = document;
      } else
        parent = this instanceof Node || jSh.MockupElement && this instanceof jSh.MockupElement || this instanceof HTMLDocument ? this : (lces.global.lcWidget && this instanceof lcWidget ? this.element : document);
      
      // Determine selector and return elements
      if (isID.test(src)) {
        if (doc) {
          result = document.getElementById(src.substr(1));
        } else {
          doc = jSh.MockupElement && parent instanceof jSh.MockupElement ? parent : (parent ? (parent.ownerDocument || parent) : document);
          result = doc.getElementById(src.substr(1));
        }
      } else if (isClass.test(src)) {
        result = jSh.toArr(parent.getElementsByClassName(src.substr(1)));
      } else if (isPH.test(src)) {
        src = src.substr(1).toLowerCase();
        
        result = jSh.oneOrArr(jSh.toArr(parent.getElementsByTagName("lces-placeholder")).filter(function(i) {return i.phName && i.phName.toLowerCase() === src;}));
      } else if (isTag.test(src)) {
        result = jSh.toArr(parent.getElementsByTagName(src));
      } else { // Must be rocket science queries, back to queryselectAll...
        if (first) {
          result = parent.querySelector(src);
        } else {
          result = jSh.toArr(parent.querySelectorAll(src));
        }
      }
      
      // Shorten them
      if (result) {
        var shortnedResult;
        
        if (result instanceof Array)
          shortnedResult = result;
        else
          shortnedResult = [result];
        
        for (var i=result.length-1; i>-1; i--) {
          var elm = result[i];
    
          if (!elm.jSh) {
            elm.getParent = getParent;
            elm.getChild  = getChild;
            elm.css       = setCSS;
            elm.on        = onEvent;
            elm.jSh       = jSh;
    
            // Improve append and removechild methods
            elm.__apch = elm.appendChild;
            elm.__rmch = elm.removeChild;
    
            elm.appendChild = jSh.elementExt.appendChild;
            elm.removeChild = jSh.elementExt.removeChild;
          }
        } else if (!result.jSh) {
          result.getParent = jSh.getParent;
          result.getChild  = jSh.getChild;
          result.css       = jSh.setCSS;
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
    } else if (typeof src === "number") {
      result = getChild.call(this, src);
      
      if (result && !result.jSh) {
        result.getParent = getParent;
        result.getChild  = getChild;
        result.css       = setCSS;
        result.on        = onEvent;
        result.jSh       = jSh;
    
        // Improve append and removechild methods
        result.__apch = result.appendChild;
        result.__rmch = result.removeChild;
    
        result.appendChild = elementExt.appendChild;
        result.removeChild = elementExt.removeChild;
      }
      
      return result;
    } else {
      // "Shorten" mode
      // In this mode «first» is referring to whether to enclose it in an lcWidget
      
      var e = jSh.determineType(src, true);
      
      if (!e)
        return src;
      
      if (first)
        new lcWidget(e);
      
      if (!e.jSh)
        jSh.shorten(e);
      
      return e;
    }
  }
  
  // Global
  var jShGlobal = jSh.global = lces.global;
  
  // JS functions
  
  // Check something's type when typeof isn't reliable
  jSh.type = function(obj) {
    return Object.prototype.toString.call(obj).match(/\[object\s([\w\d]+)\]/)[1].toLowerCase();
  }
  
  jSh.pushItems = function(array) {
    var items = jSh.toArr(arguments).slice(1);
    
    for (var i=0,l=items.length; i<l; i++) {
      array.push(items[i]);
    }
  }
  
  // Remove multiple items from an array
  jSh.spliceItem = function(array) {
    var items = jSh.toArr(arguments).slice(1);
    
    for (var i=0,l=items.length; i<l; i++) {
      var index = array.indexOf(items[i]);
      
      if (index !== -1)
        array.splice(index, 1);
    }
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
    var objNames = Object.getOwnPropertyNames(extension);
    
    for (var i=objNames.length-1; i>-1; i--) {
      var name = objNames[i];
      
      if (!exclude || exclude.indexOf(name) === -1)
        obj[name] = extension[name];
    }
    
    return obj;
  }
  
  // Similar to extendObj, but will go into deeper objects if they exist and merging the differences
  jSh.mergeObj = function(obj, extension, dontReplaceObjects, dontReplaceValues, dontReplaceArrays) {
    function merge(curObj, curExt) {
      Object.getOwnPropertyNames(curExt).forEach(function(i) {
        var curProp    = curObj[i];
        var curExtProp = curExt[i];
        
        if (jSh.type(curProp) === "object" && jSh.type(curExtProp) === "object")
          merge(curProp, curExtProp);
        else if (dontReplaceArrays && jSh.type(curProp) === "array" && jSh.type(curExtProp) === "array")
          curProp.push.apply(curExtProp);
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
  
  jSh.strCapitalize = function(str) {
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
    var nsElm, elmClassName; // For things like SVG... Ugggh. :|
    
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
    if (className instanceof Object) {
      var args = className;

      elmClassName = args.className || args.class || args.sel;
      text         = args.text;
      child        = args.child || args.children;
      attributes   = args.attributes || args.attr;
      properties   = args.properties || args.prop || args.props;
      events       = args.events;
    } else {
      elmClassName = className;
    }
    
    // Check for an arguments availability and apply it if detected
    
    // Check for special assignments in classname argument
    var id       = "";
    var newClass = "";
    
    if (elmClassName) {
      var validFormat = /^(?:#[a-zA-Z\d\-_]+)?(?:\.[a-zA-Z\d\-_]+)+$|^#[a-zA-Z\d\-_]+(?:\.[a-zA-Z\d\-_]+)*$/;
      var hasClass    = /\.[a-zA-Z\d\-_]+/g;
      var hasId       = /#([a-zA-Z\d\-_]+)/;
      
      if (validFormat.test(elmClassName)) {
        newClass = jSh.toArr(elmClassName.match(hasClass) || []);
        id       = elmClassName.match(hasId);
        
        if (newClass.length > 0) {
          for (var i=newClass.length-1; i>-1; i--) {
            newClass[i] = newClass[i].substr(1);
          }
          
          // Workaround for things like SVG that don't have a simple .className property
          if (!nsElm)
            n.className = newClass.join(" ");
          else
            attributes["class"] = newClass.join(" ");
        }
      } else {
        if (!nsElm)
          n.className = elmClassName;
        else
          attributes["class"] = elmClassName;
      }
    }
    
    
    if (id)
      n.id = id[1];
    
    if (text) {
      n[text.t ? "innerHTML" : "textContent"] = (text.s ? text.s : text);
      n[text.t ? "_innerHTML" : "_textContent"] = (text.s ? text.s : text);
    }
    
    if (child) {
      if (child instanceof Array) {
        var frag = this.lcesElement || jSh.docFrag();
        
        for (var i=0,l=child.length; i<l; i++) {
          frag.appendChild(child[i]);
        }
        
        // Append if not LCES template element
        if (!this.lcesElement)
          n.appendChild(frag);
      } else
        n.appendChild(child);
    }
    
    var checkNSAttr = /^ns:[^:]+:[^]*$/i;
    
    if (attributes) {
      var attrs = Object.getOwnPropertyNames(attributes);
      
      for (var i=attrs.length-1; i>-1; i--) {
        var attr = attrs[i];
        
        if (!checkNSAttr.test(attr) || jSh.MockupElement && n instanceof jSh.MockupElement)
          n.setAttribute(attr, attributes[attr]);
        else {
          var nsURI = attr.replace(/^ns:[^:]+:([^]*)$/i, "$1");
          var nsAttr = attr.replace(/^ns:([^:]+):[^]*$/i, "$1");
          
          n.setAttributeNS(nsURI ? nsURI : null, nsAttr, attributes[attr]);
        }
      }
    }

    if (properties) {
      var props = Object.getOwnPropertyNames(properties);
      
      for (var i=props.length-1; i>-1; i--) {
        var prop = props[i];
        n[prop] = properties[prop];
      }
    }
    
    if (events) {
      var evts = Object.getOwnPropertyNames(events);
      
      for (var i=evts.length-1; i>-1; i--) {
        var evName = evts[i];
        var evObj  = events[evName];
        
        if (evObj instanceof Array) {
          for (var j=evObj.length-1; j>-1; j--) {
            n.addEventListener(evName, evObj[j]);
          }
        } else {
          n.addEventListener(evName, evObj);
        }
      }
    }
    
    return jSh(n);
  };

  // Create a 'type' DOM element with flexible nesting system
  jSh.c = function nodeC(type, className, text, child, attributes, properties) { // Custom node
    return jSh.d.call({lcesType: type}, className, text, child, attributes, properties);
  }

  // Create raw DOM element with no special features
  jSh.e = function(tag) {
    var nsCheck = tag.match(/^ns:([\w\d_]+):([^]+)$/i);
    if (!nsCheck) {
      return document.createElement(tag);
    } else {
      var nsElm = nsCheck[1];
      var nsURI = nsCheck[2];
      
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

  var getChild = jSh.getChild = function(off, length) {
    var parent = length instanceof Object ? length : this;
    var children = jSh.toArr(parent.childNodes);
    var check = [];
    var ELM_NODE = Node.ELEMENT_NODE;
    
    for (var i=children.length-1; i>-1; i--) {
      var child = children[i];
      
      if (child.nodeType === ELM_NODE) {
        check.push(child);
        
        if (!child.jSh)
          jSh.shorten(child);
      }
    }
    
    check = check.reverse();
    if (off < 0)
      off = check.length + off;
    
    if (!check[off])
      return null;
    
    if (typeof length === "number" && length > 1)
      return check.slice(off, off + length);
    else
      return check[off];
  }
  
  var getParent = jSh.getParent = function(jump) {
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

  var onEvent = jSh.onEvent = function(e, func, bubble) {
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
      e.css       = jSh.setCSS;
      e.jSh       = jSh;
      
      // Improve append and removechild methods
      e.__apch = e.appendChild;
      e.__rmch = e.removeChild;
      
      e.appendChild = jSh.elementExt.appendChild;
      e.removeChild = jSh.elementExt.removeChild;
    }
    
    return e;
  }
  
  var setCSS = jSh.setCSS = function(css) {
    if (!css || jSh.type(css) !== "object")
      return this;
    
    var props = Object.getOwnPropertyNames(css);
    var style = this.style;
    
    for (var i=props.length-1; i>-1; i--) {
      var propName = props[i];
      style[propName] = css[propName];
    }
    
    return this;
  }
  
  var elementExt = jSh.elementExt = {
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
      
      if (children[0] instanceof Array)
        children = children[0];
      
      for (var i=children.length-1; i>-1; i--) {
        this.__rmch(children[i]);
      }
      
      if (children.length === 1)
        return children[0];
      else
        return children;
    }
  }
  
  // Determine selector in the string
  jSh.isID    = /^#[\w-]+$/;
  jSh.isClass = /^\.[a-zA-Z\d\-_]+$/;
  jSh.isTag   = /^[a-zA-Z\d\-]+$/;
  jSh.isPH    = /^~[a-zA-Z\d\-_]+$/; // LCES Templating, placeholder element
  
  var isID    = jSh.isID;
  var isClass = jSh.isClass;
  var isTag   = jSh.isTag;
  var isPH    = jSh.isPH;

  // For distinguishing between lcWidget and a Node instance
  jSh.determineType = function(obj, jShDetermine) {
    if (!obj)
      return false;
    
    if (obj instanceof Node || obj instanceof HTMLDocument && jShDetermine)
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
