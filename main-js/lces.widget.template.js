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
    if (!this.parent)
      return null;
    
    this.parent.insertBefore(e, this.element);
    this.parent.removeChild(this.element);
  };

  // LCES Placeholder Constructor
  function lcPlaceholder(e) {
    var that = this;
    
    lcWidget.call(this, e);
    
    this.type = "LCES Placeholder Widget";
    
    this.replace = lces.template.__placeHolderReplace;
    this.element.replace = lces.template.__placeHolderReplace.bind(this);
    
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