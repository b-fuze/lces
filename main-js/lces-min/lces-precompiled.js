// ==ClosureCompiler==
// @compilation_level SIMPLE_OPTIMIZATIONS
// @output_file_name default.js
// ==/ClosureCompiler==

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
    "text": function(charac) {
      return /[a-zA-Z\d_]/.test(charac);
    },
    "number": function(charac) {
      return /[\d]/.test(charac);
    },
    "space": function(charac) {
      return /[\t ]/.test(charac);
    },
    "invalidPropChar": function(charac) {
      return !(this.text(charac) || this.number(charac) || charac === "#" || charac === ".");
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
          
            this.tokens  = "Invalid property character \"" + c + "\" at charac index " + index +  " \n\n";
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
    
    // Get a charac's width
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
    lcTextField.call(this, jSh.d("lcesdropdown"));

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


lces.rc[7] = function() {
  lces.ui.colorChooserWheel = "data:image/png;base64,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";

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
    
    this.type = "LCES Color Chooser Widget"
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
    wheel.style.backgroundImage = "url(" + lces.ui.colorChooserWheel + ")";
    
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
        jSh.c("section")               // Dropcatcher to handle all drops
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

function lcesAppendCSS(className, css) {
  var style = document.createElement("style");
  style.classList.add(className);
  style.appendChild(document.createTextNode(css));
  
  document.getElementsByTagName("head")[0].appendChild(style);
  
  return style;
}
lcesAppendCSS("lces-core-styles", ".lces-themify{font-family:Arial;}br2{position:relative;display:block;padding:0px;margin:0px;height:10px;}.lces-themify hr{border-top:0px;border-style:solid;opacity:0.75;}.lces-themify a{font-weight:normal;text-decoration:none;}.lces-themify label{font-weight:bold;}@font-face{font-family:\"CODE\";src:url(http://b-fuze.github.io/lces/main-css/codebold.otf);}@font-face{font-family:\"Lato\";src:url(http://b-fuze.github.io/lces/main-css/lato-reg.ttf);}@font-face{font-family:\"Righteous\";src:url(http://b-fuze.github.io/lces/main-css/righteous.ttf);}@font-face{font-family:\"Couture\";src:url(http://b-fuze.github.io/lces/main-css/couture-bld.otf);}.lces-themify h1,.lces-themify h2,.lces-themify h3,.lces-themify h4,.lces-themify h5,.lces-themify h6{margin:0px;margin-bottom:10px;font-family:Lato;font-weight:normal;}.lces-themify h1{font-size:2.25em;}.lces-themify h2{font-size:2em;}.lces-themify h3{font-size:1.75em;}.lces-themify h4{font-size:1.5em;}.lces-themify h5{font-size:1.25em;}.lces-themify h6{font-size:1.125em;}.lces-themify .lc-centertext{text-align:center;}.lces-themify .lc-indent{margin-left:15px;margin-right:15px;}.lces-themify .lc-inlineblock{display:inline-block;}lces-placeholder{display:none;}.lcescontrol{position:relative;opacity:1;transition:opacity 200ms ease-out;}.lcescontrol[disabled]{opacity:0.5;cursor:default !important;}.lcescontrol[disabled] *{cursor:default !important;}.lcescontrol .lcescontrolclick{position:absolute;left:0px;top:0px;right:0px;bottom:0px;z-index:1000;display:none;}.lces-notification>div{background:transparent;transition:height 400ms ease-out;overflow:hidden;}.lces-themify::-webkit-input-placeholder{color:#BFBFBF;font-style:italic;font-weight:normal;}.lces-themify:-moz-placeholder{color:#BFBFBF;font-style:italic;font-weight:normal;}.lces-themify::-moz-placeholder{color:#BFBFBF;font-style:italic;font-weight:normal;}.lces-themify:-ms-input-placeholder{color:#BFBFBF;font-style:italic;font-weight:normal;}.lces-numberfield::-webkit-input-placeholder{font-style:normal;}.lces-numberfield:-moz-placeholder{font-style:normal;}.lces-numberfield::-moz-placeholder{font-style:normal;}.lces-numberfield:-ms-input-placeholder{font-style:normal;}input.lces[type=\"text\"],input.lces[type=\"password\"],textarea.lces{padding:3px;min-width:150px;height:auto;outline:0px;border:2px solid #000;border-radius:3px;color:#262626;background-color:#fff;font-size:14px;font-family:\"Trebuchet MS\";resize:none;}input.lces[type=\"text\"]:disabled,input.lces[type=\"password\"]:disabled{background-color:#F2F2F2;}.numberfield-container{position:relative;display:inline-block;}input.lces.lces-numberfield{font-size:14px;font-weight:bold;text-align:center;border-right-width:16px;border-top-right-radius:4px;border-bottom-right-radius:4px;}.numberfield-container .arrow{width:16px;height:50%;position:absolute;right:0px;cursor:pointer;background:rgba(0,0,0,0);}.numberfield-container .arrow.active{background:rgba(0,0,0,0.1);}.numberfield-container .arrow svg{position:absolute;top:0px;right:0px;bottom:0px;left:0px;margin:auto auto;opacity:0.85;transition:opacity 200ms ease-out;}.numberfield-container .arrow:hover svg{opacity:1;}.numberfield-container .arrow.top{top:0px;border-top-right-radius:4px;}.numberfield-container .arrow.bottom{bottom:0px;border-bottom-right-radius:4px;}.lces-slider{position:relative;display:inline-block;border:2px solid #000;border-radius:5px;height:28px;width:138px;overflow:hidden;background:#fff;}.lces-slider-min,.lces-slider-max,.lces-slider-value{position:absolute;top:4px;font-family:Righteous;font-size:16px;color:#D9D9D9;}.lces-slider-min{left:5px;}.lces-slider-max{right:5px;}.lces-slider-value{right:0px;left:0px;text-align:center;color:#f00;opacity:0.25;}.lces-slider-scrubbar{position:absolute;top:0px;right:0px;bottom:0px;left:0px;}.lces-slider-scrubber{position:absolute;top:1px;left:0px;margin:0px 0px 0px 1px;width:15px;height:26px;border-radius:3.5px;background:#000;opacity:0.75;transition:opacity 250ms ease-out;}.lces-slider.animated .lces-slider-scrubber{transition:opacity 250ms ease-out,left 150ms cubic-bezier(.1,.41,0,.99);}.lces-slider-scrubbar:hover .lces-slider-scrubber,.lces-slider.scrubbing .lces-slider-scrubber{opacity:1;}.lces-colorchooser{position:relative;top:10px;display:inline-block;}.lces-colorchooser .lces-cc-display{display:inline-block;height:26px;width:46px;border-radius:4px;border:2px solid #000;}.lces-colorchooser .lces-cc-color{margin:4px;width:38px;height:18px;border-radius:1px;background:#000;cursor:pointer;}.lces-colorchooser-modal{position:absolute;z-index:20000000;top:0px;left:0px;margin:5px 0px 0px 0px;border-radius:5px;background:rgba(255,255,255,0.95);overflow:hidden;box-shadow:0px 2px 5px rgba(0,0,0,0.25);opacity:0;transform-origin:0% 0%;transform:scale(0.85);transition:transform 250ms ease-out,opacity 250ms ease-out;}.lces-colorchooser-modal.flipped{margin:0px;transform-origin:0% 100%;}.lces-colorchooser-modal.visible{opacity:1;transform:scale(1);}.lces-colorchooser-modal .lces-cc-section{padding:15px;}.lces-colorchooser-modal .lces-cc-section.lces-cc-controls{padding-top:0px;padding-bottom:0px;background:#F2F2F2;}.lces-colorchooser-modal .lces-cc-wheel{position:relative;width:180px;height:180px;border-radius:100%;background-color:#F2F2F2;background-size:100%;}.lces-colorchooser-modal .lces-cc-wheel-value{position:absolute;left:0px;top:0px;width:100%;height:100%;border-radius:100%;background:#000;opacity:0;}.lces-colorchooser-modal .lces-cc-cursor{position:absolute;width:10px;height:10px;border-radius:100%;background:#fff;border:1px solid #000;}.lces-colorchooser-modal .lces-cc-row{overflow:auto;}.lces-colorchooser-modal .lces-cc-label{float:left;display:block;width:16px;font-family:Couture;font-size:25px;color:#808080;background:#e5e5e5;padding:10px 7px 5px 7px;cursor:default;margin-right:10px;}.lces-colorchooser-modal .lces-slider{margin-top:7px;border-width:1px;}.lces-file input[type=\"file\"]{position:absolute;margin:0px;width:100%;height:100%;opacity:0;z-index:5;cursor:pointer !important;}.lces-file{position:relative;display:block; padding:0px 33px 0px 0px;height:36px;width:123px;border-radius:3px;background-color:#000;font-family:Arial;font-weight:bold;font-size:14px;cursor:pointer !important;}.lces-file>div{position:absolute;top:0px;left:0px;right:33px;bottom:0px;}.lces-file>div>div{display:table;width:100%;height:100%;}.lces-file>div>div>div{display:table-cell;vertical-align:middle;}.lces-file>div>div>div>div{text-align:center;color:#fff;}.lces-file>aside{position:absolute;right:0px;top:0px;bottom:0px;padding:8px;border-top-right-radius:3px;border-bottom-right-radius:3px;background:rgba(0,0,0,0.25);transition:background 200ms ease-out;}.lces-file:hover>aside{background:rgba(0,0,0,0.15);}.lces-file:active>aside{background:rgba(0,0,0,0.5);}.lces-themify button{position:relative;font-family:Arial;font-size:14px;font-weight:bold;outline:0px;border-radius:3px;margin:0px 10px 10px 0px;padding:5px 10px;border:0px;color:#fff;background:#000;cursor:pointer;}.lces-themify button:before,.lces-file:after{content:\"\";position:absolute;top:0px;left:0px;width:100%;height:100%;border-radius:3px;background:rgba(255,255,255,0);transition:background 100ms ease-out;}.lces-themify button:hover:before,.lces-file:hover:after{background:rgba(255,255,255,0.2);}.lces-themify button:active:before,.lces-file:active:after{background:rgba(0,0,0,0.075);transition:background 0ms ease-out !important;}.lcesradio{position:relative;top:1px;width:12px;height:11px;margin:2px;display:inline-block;}.lcesradio .radiobuttoncolor{fill:#000;}.lcesradio svg path:last-child{opacity:0;transition:opacity 150ms ease-out;}.lcesradio[checked] svg path:last-child{opacity:1;}.lcescheckbox{position:relative;top:1px;width:12px;height:11px;margin:2px;display:inline-block;}.lcescheckbox .checkboxcolor{fill:#000;}.lcescheckbox svg path:last-child{opacity:0;transition:opacity 150ms ease-out;}.lcescheckbox[checked] svg path:last-child{opacity:1;}.lcesdropdown{position:relative;display:inline-block;min-width:98px;padding:3px;border:2px solid #000;border-width:2px 27px 2px 2px;border-radius:3px;text-align:left;font-size:14px;font-weight:bold;line-height:1.2;background:#fff;cursor:default;margin:0px 0px 10px 0px;}.lcesdropdown:before{content:\"\";position:absolute;top:9px;right:-18px;height:6px;width:10px;background:url(../images/dropdownArrow.svg) no-repeat;background-size:100% 100%;}.lcesdropdown .lcesoptions{position:absolute;z-index:600000;top:100%;left:-2px;right:-27px;border:0px solid #000;border-width:2px;border-bottom-right-radius:3px;border-bottom-left-radius:3px;font-weight:bold;background:#fff;box-shadow:0px 2px 3px rgba(0,0,0,0.2);transform-origin:50% 0%;transform:scale(0.85);opacity:0;display:none;transition:transform 250ms ease-out,opacity 250ms ease-out;}.lcesdropdown.visible .lcesoptions{opacity:1;transform:scale(1);}.lcesdropdown.flipped .lcesoptions{transform-origin:50% 100%;top:auto;bottom:100%;border-radius:0px;border-top-right-radius:3px;border-top-left-radius:3px;}.lcesdropdown .lcesselected{}.lcesoption{position:relative;padding:3px;margin-bottom:1px;background:rgba(0,0,0,0);color:#484848;transition:background-color 200ms ease-out;}.lcesoption:after{position:absolute;content:\"\";top:100%;left:2px;right:2px;height:1px;background:#000;opacity:0.5;}.lcesoption:hover,.lcesoption[lces-selected]{background:rgba(0,0,0,0.05);}.lcesoption:last-child{margin-bottom:0px;}.lcesoption:last-child:after{height:0px;}.lces-themify table{border-spacing:0px;font-family:Arial;}table.lces thead th{position:relative;border:0px;border-top:3px solid #000;border-bottom:3px solid #000;padding:7px 10px;font-size:13px;}table.lces thead th:before{position:absolute;content:\"\";left:0px;top:10%;bottom:10%;width:1px;background:#000;}table.lces thead th:first-child:before{width:0px;}table.lces tr{padding:0px;margin:0px;border:0px;background:#fff;}table.lces tr[checker]{}table.lces tr td{border:0px;padding:10px;}.lces-window{position:fixed;z-index:1000000;top:0px;left:0px;opacity:0;color:#484848;line-height:1.6;transition:opacity 400ms ease-out;}.lces-window[visible]{opacity:1;}.lces-window[window-invisible]{margin-left:-9999999%;}.lces-window>div{padding:0px;}.lces-window>div>div{background:#fff;overflow:hidden;border-radius:4px;box-shadow:0px 2px 5px rgba(0,0,0,0.25);}.lces-window .lces-window-title{padding:15px 10px;font-family:Arial;font-size:14px;font-weight:bold;color:#000;background:rgba(0,0,0,0.1);cursor:default;}.lces-window .lces-window-contents{padding:25px 20px 30px 20px;}.lces-window .lces-window-buttonpanel{padding:10px;text-align:right;background:rgba(0,0,0,0.1);}.lces-window .lces-window-buttonpanel button{margin-bottom:0px;}.lces-window .lces-window-buttonpanel button:last-child,.lces-window .lces-window-buttonpanel div:last-child button{margin:0px;}.lces-notification{border-radius:3px;position:static;width:275px;box-shadow:0px 2px 3px rgba(0,0,0,0.2);cursor:default;}.lces-notification[visible]{opacity:0.9;}.lces-notification>div{padding:0px;margin:4px 0px;border:1px solid #000;border-radius:3px;background:#fff;overflow:hidden;}.lces-window.lces-notification>div>div{background:rgba(0,0,0,0.025);box-shadow:none;}.notification-alignment.notifi-relative .lces-notification>div{margin:0px !important;}.notification-alignment{position:fixed;z-index:1000000;}.notification-alignment.notifi-relative{position:static !important;}.notifi-top{top:5px;}.notifi-bottom{bottom:5px;}.notifi-middle{top:45%;}.notifi-right{right:5px;text-align:right;}.notifi-left{left:5px;}.notifi-center{left:5px;right:5px;text-align:center;}.notifi-center .lces-notification{margin-right:auto;margin-left:auto;}.lces-accordion{display:block;margin:0px 0px 10px 0px;}.lces-accordion .lces-acc-section{display:block;border:1px solid rgba(0,0,0,0.25);border-radius:3px;overflow:hidden;margin:0px 0px 5px 0px;}.lces-accordion .lces-acc-section .lces-acc-title{display:block;padding:5px;font-weight:bold;font-size:13px;background:rgba(0,0,0,0.25);border:0px;border-bottom:0px solid rgba(0,0,0,0.05);cursor:pointer;}.lces-accordion .lces-acc-section.lces-acc-open .lces-acc-title{border-bottom-width:1px;}.lces-accordion .lces-acc-section .lces-acc-title .lces-acc-arrow{position:relative;top:3px;display:inline-block;width:15px;height:15px;transform:rotate(0deg);padding:0px;margin:0px;margin-right:5px;transition:transform 500ms cubic-bezier(.1,.41,0,.99);}.lces-accordion .lces-acc-section.lces-acc-open .lces-acc-title .lces-acc-arrow{transform:rotate(90deg);}.lces-accordion .lces-acc-section .lces-acc-title .lces-acc-arrow svg{margin:0px;}.lces-accordion .lces-acc-section .lces-acc-contents>div{padding:10px;}.lces-accordion .lces-acc-section .lces-acc-contents{overflow:hidden;height:0px;transition:height 500ms cubic-bezier(.1,.41,0,.99);}.lces-accordion .lces-acc-section.lces-acc-open .lces-acc-contents{overflow:auto;}");
lcesAppendCSS("lces-responsive-styles", "@media screen and (max-width:560px){.no-mobile{display:none;}.lces-window:not(.lces-notification):not([window-invisible]){top:0px !important;bottom:0px ;left:0px !important;right:0px;margin:20px;}.lces-window:not(.lces-notification):not([window-invisible])>div{position:absolute;top:0px;right:0px;bottom:0px;left:0px;}.lces-window:not(.lces-notification):not([window-invisible])>div>div{position:relative;width:100% !important;height:100% !important;}.lces-window:not(.lces-notification):not([window-invisible])>div>div .lces-window-contents{}.lces-window:not(.lces-notification):not([window-invisible]) .lces-window-contents{position:absolute;top:0px;bottom:0px;right:0px;left:0px;width:auto !important;height:auto !important;overflow:auto;}.lces-window.lces-window-titlevisible:not(.lces-notification):not([window-invisible]) .lces-window-contents{top:52px;}.lces-window.lces-window-buttonsvisible:not(.lces-notification):not([window-invisible]) .lces-window-contents{bottom:46px;}.lces-window:not(.lces-notification):not([window-invisible]) .lces-window-buttonpanel{position:absolute;left:0px;right:0px;bottom:0px;}}");
lcesAppendCSS("lces-themify-styles" ,".lcesoption:after,.lces-file,.lces-themify button,table.lces thead th:before,.lces-slider-scrubber{background-color: #800070;}.lces-acc-arrow svg,.checkboxsvg .checkboxcolor,.radiobuttonsvg .radionbuttoncolor,.genreremovesvg .genreremovecolor{fill: #800070;}.lcesoption:hover,.lcesoption[lces-selected],table.lces tr{background-color:rgba(128, 0, 112,0.125);}hr.lces,input.lces[type=\"text\"],input.lces[type=\"password\"],textarea.lces,.lcesdropdown,.lcesdropdown .lcesoptions,table.lces thead th,.lces-slider,.lces-colorchooser .lces-cc-display,.lces-notification>div{border-color: #800070;}.lces-accordion .lces-acc-section .lces-acc-title,.lces-window .lces-window-title,.lces-window .lces-window-buttonpanel{background-color:rgba(128, 0, 112,0.1);}.lces-themify a,.lces-themify h1,.lces-themify h2,.lces-themify h3,.lces-themify h4,.lces-themify h5,.lces-themify h6,.lcesdropdown,table.lces tr,.lces-user-text-color,.lces-window .lces-window-title{color: #800070;}.lces-accordion .lces-acc-section{border-color:rgba(128, 0, 112,0.5);}table.lces tr[checker]{background-color:rgba(128, 0, 112,0.02);}");

var lcesHiddenStuff = lcesAppendCSS("lces-hidden-stuff", ".lces-themify{opacity: 0;}");
lces.rc[50] = function() {
  lces.addInit(function() {
    lcesHiddenStuff.disabled = "disabled";
  })
}
