// LCES DOM Components
lces.rc[3] = function() {
  
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
    if (!(element instanceof Node))
      element = element.element;
    
    prefixEvent(["TransitionEnd", "transitionend"], element, callback);
  }
  
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
      return this.element.getAttribute(attr);
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
      contains: function(c) {that.element.classList.contains(c)},
      removeAll: function(filter) {that.classList.forEach(function(i) {return filter === undf ? that.classList.remove(i) : (i.indexOf(filter) != -1 ? that.classList.remove(i) : false); })},
      toggle: function(c) {that.element.classList.toggle(c)}
    }

    Object.defineProperty(this, "classList", {configurable: true, get: function() {
      var list = jSh.toArr(that.element.classList);
      
      list.add = classList.add;
      list.remove = classList.remove;
      list.contains = classList.contains;
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
    
    // Check attributes for flags
    if (e) {
      var isDyntext = this.getAttr("lces-dyntext") !== null;
      
      if (isDyntext) {
        // Initialize textual dynamics
        lcDynamicText.call(this);
        
        this.dynText.allowTags = false;
        this.dynText.element   = null;
        
        // Loop attributes
        function loopAttrs(node) {
          var attrs = jSh.toArr(node.attributes);
          attrs.forEach(function(attr) {
            that.dynText.compile(attr.value + "", function(s) {
              node.setAttribute(attr.name, s);
            });
          });
        }
        
        loopAttrs(this.element);
        
        // Iterate children
        function loopChildren(children, parent) {
          children.forEach(function(child) {
            if (child.nodeType === Node.ELEMENT_NODE) {
              loopAttrs(child);
              loopChildren(jSh.toArr(child.childNodes), child);
            } else {
              // No need for dynamic whitespace...
              if (child.nodeValue.trim() === "")
                return;
              
              var span = parent.childNodes.length === 1 ? parent : jSh.c("span");
              span.innerHTML = jSh.filterHTML(child.nodeValue);
              
              that.dynText.compile(child.nodeValue + "", function(s) {
                span.innerHTML = jSh.filterHTML(s);
              });
              
              if (span !== parent) {
                child.parentNode.insertBefore(span, child);
                child.parentNode.removeChild(child);
              }
            }
          });
          
        }
        
        loopChildren(this.children, this.element);
      }
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

  // Append to lces.types
  jSh.extendObj(lces.types, {
    "widget": lcWidget
  });
}
