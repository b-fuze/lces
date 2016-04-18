lces.rc[3] = function() {
  lces._WidgetInit();
  
  // lcDraggable for draggable functionality Z
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
  
  // LCES Custom Scrollbars
  lces.ui.scrollBarScroll = 35;
  
  lces.ui.scrollBars = [];
  lces.ui.sbScroll   = function onwheel(e) {
    this.lcesScrollbar.scroll(e.deltaY, e);
  }
  
  lces.ui.sbScreen = jSh.d("lces-scrollbar-screen");
  lces.ui.sbScreen.addEventListener("mouseover", function(e) {e.preventDefault();});
  
  // If LCES scrollbars enabled globally
  var lcesSBSet = false;
  
  // Scrolling screen to prevent mouse from hovering over annoying things.
  lces.ui.setState("sbScrolling", false);
  lces.ui.addStateListener("sbScrolling", function(scrolling) {
    if (scrolling)
      lces.ui.sbScreen.classList.add("lces-sb-screen-visible");
    else
      lces.ui.sbScreen.classList.remove("lces-sb-screen-visible");
  });
  
  lces.ui.setState("scrollBarsEnabled", false);
  lces.ui.addStateListener("scrollBarsEnabled", function(sbe) {
    if (sbe && !lcesSBSet) {
      lcesSBSet = true;
      
      // Make all scrollbars visible
      jSh("body")[0].classList.add("lces-scrollbars-visible");
      
      var arr       = lces.ui.scrollBars;
      var sbHandler = lces.ui.sbScroll;
      
      for (var i=0,l=arr.length; i<l; i++) {
        var sb = arr[i];
        
        sb.parent.addEventListener("wheel", sbHandler);
        sb.scrollContent.style.overflow = "hidden";
      }
      
      document.body.appendChild(lces.ui.sbScreen);
    } else {
      // Nothing to do here, prolly.
    }
  });
  
  window.lcScrollBars = function(e, scrollContent, autoupdate) {
    if (!this.element && !e)
      return false; // No scrolling box
    
    // Check for lcComponent
    if (!(this instanceof lcComponent))
      return new lcScrollBars(e);
    
    var that   = this;
    var trough = jSh.d(".lces-scrollbar-trough");
    var elem   = jSh.d(".lces-scrollbar");
    
    // Add scroller to trough
    trough.appendChild(elem);
    
    var scrollbar      = new lcComponent();
    this.lcesScrollbar = scrollbar;
    
    scrollbar.scrollContent = this.scrollbarContent || scrollContent || e; // I dunno how it'll work with e, but whatever.
    scrollbar.scrollDist    = lces.ui.scrollBarScroll;
    scrollbar.setState("visible", false);
    
    // For dynamic elements
    scrollbar.addStateListener("parent", function(parent) {
      if (parent instanceof lcWidget)
        parent = parent.element;
      
      if (this.oldStateStatus && this.oldStateStatus !== (e || that.element)) {
        this.oldStateStatus.lcesScrollbar = undf;
        
        this.oldStateStatus.removeEventListener("wheel", lces.ui.sbScroll);
      }
      
      parent.appendChild(trough);
      parent.lcesScrollbar = scrollbar;
      parent.addEventListener("wheel", lces.ui.sbScroll);
      
      this.stateStatus = parent;
    });
    
    scrollbar.addStateListener("visible", function(visible) {
      trough.style.display = visible ? "block" : "none";
    });
    
    scrollbar.setState("parent", e || this.element);
    
    // Styling properties
    scrollbar.marginTop    = 0;
    scrollbar.marginBottom = 0;
    scrollbar.marginSide   = 0;
    scrollbar.side = this.scrollbarSide !== "left" ? "lc-sbright" : "lc-sbleft";
    
    // Scrolling properties
    var contentScrolled   = 0;
    var sbScrolled        = 0;
    
    var scrollTopMax      = 0;
    var physicalScrollMax = 0;
    
    // Add to LCES scrollbar collection
    lces.ui.scrollBars.push(scrollbar);
    
    function updateContentScroll() {
      contentScrolled = physicalScrollMax * (sbScrolled / scrollTopMax);
      scrollbar.scrollContent.scrollTop = contentScrolled;
    }
    
    scrollbar.scroll = function(dir, e) {
      dir = dir > 0 ? 1 : -1;
      var oldScroll = sbScrolled;
      
      sbScrolled = Math.min(Math.max(sbScrolled + lces.ui.scrollBarScroll * dir, 0), scrollTopMax);
      elem.style.top = sbScrolled + "px";
      
      if (oldScroll !== sbScrolled) {
        updateContentScroll();
        
        e.preventDefault();
      }
    }
    
    function windowMove(e) {
      sbScrolled = Math.min(Math.max(windowMove.scroll + (e.clientY - windowMove.y), 0), scrollTopMax);
      elem.style.top = sbScrolled + "px";
      
      updateContentScroll();
    }
    
    trough.addEventListener("mousedown", function(e) {
      var target = e.target || e.srcElement;
      e.preventDefault();
      
      if (target === elem) {
        windowMove.scroll = sbScrolled;
        windowMove.y = e.clientY;
        trough.classList.add("active");
        
        lces.ui.sbScrolling = true;
        
        window.addEventListener("mousemove", windowMove);
        window.addEventListener("mouseup", function mup() {
          window.removeEventListener("mousemove", windowMove);
          window.removeEventListener("mouseup", mup);
          
          trough.classList.remove("active");
          lces.ui.sbScrolling = false;
        });
      } else {
        var elemBCR = elem.getBoundingClientRect();
        var top = (elemBCR.top + (e.clientY - elemBCR.top) - (elem.offsetHeight / 2)) - trough.getBoundingClientRect().top;
        
        sbScrolled = Math.min(Math.max(top, 0), scrollTopMax);
        elem.style.top = sbScrolled + "px";
        
        updateContentScroll();
      }
    });
    
    // Update the height of the scrollbar for content changes
    scrollbar.update = function() {
      var scrollContent = scrollbar.scrollContent;
      
      // Get scrollcontent real height
      var scrollCCS = getComputedStyle(scrollContent);
      var scrollCHeight = scrollContent.offsetHeight;
      scrollCHeight = scrollCHeight - parseInt(scrollCCS["borderTopWidth"]) - parseInt(scrollCCS["borderBottomWidth"]);
      
      // Get scrollparent real height
      var parentCS = getComputedStyle(scrollbar.parent);
      var scrollParentHeight = scrollbar.parent.offsetHeight;
      scrollParentHeight = scrollParentHeight - parseInt(parentCS["borderTopWidth"]) - parseInt(parentCS["borderBottomWidth"]);
      
      var height = Math.max(30, (scrollCHeight / scrollContent.scrollHeight) * (scrollParentHeight - (scrollbar.marginTop + scrollbar.marginBottom)));
      scrollTopMax = scrollParentHeight - height - (scrollbar.marginTop + scrollbar.marginBottom);
      physicalScrollMax = Math.max(0, scrollContent.scrollHeight - scrollContent.offsetHeight);
      
      trough.classList.remove(scrollbar.side === "left" || scrollbar.side === "lc-sbleft" ? "lc-sbright" : "lc-sbleft");
      trough.classList.add(scrollbar.side);
      
      elem.style.margin = "0px " + scrollbar.marginSide + "px";
      elem.style.height = height + "px";
      trough.style.top = scrollbar.marginTop + "px";
      trough.style.bottom = scrollbar.marginBottom + "px";
      
      if (physicalScrollMax)
        trough.style.display = "block";
      else
        trough.style.display = "none";
      
      // Reset scrollbar and content
      elem.style.top = "0px";
      sbScrolled = 0;
      scrollContent.scrollTop = 0;
    }
    
    if (lces.ui.scrollBarsEnabled) {
      scrollbar.parent.addEventListener("wheel", lces.ui.sbScroll);
      scrollbar.scrollContent.style.overflow = "hidden";
    }
    
    scrollbar.update();
  }
  
  jSh.inherit(lcScrollBars, lcComponent);
  
  function initLcScrollBars() {
    window.addEventListener("wheel", function showScrollBars() {
      lces.ui.scrollBarsEnabled = true;
      
      window.removeEventListener("wheel", showScrollBars);
    });
  }
  
  lces.addInit(initLcScrollBars);
  
  // LCES Dynamic Text Feature
  //

  lces.dynText = {
    allowTags: true, // If false any [tag]x[/tag]'s will be ignored.
    forgiving: true  // If false, will throw errors on every "syntax error"
  };


  // Tag specifics
  // Add new tags here.

  lces.dynText.tags = {
    "default": { // For when undefined types are requested
      node: function(params, context) {
        return new lcWidget(jSh.c("span", {attributes: {style: "font-weight: bold;"}}));
      },
      update: function() {
        
      }
    },
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
    var component    = this.component;
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
            
            // Trigger dynProp change event
            component.triggerEvent("dynpropchange", {property: this.name});
          });
          
          // For 'special' instances
          curCtx.addStateListener(mainProp, function(value) {
            if (!curCtx.states[mainProp].dynamicProps || jSh.type(cb) !== "function")
              return;
            
            curCtx.states[mainProp].dynamicProps.forEach(function(i) {
              lces.dynText.onDynamicChange(propBase, i);
            });
            
            // Trigger dynProp change event
            component.triggerEvent("dynpropchange", {property: this.name});
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
      var entityType = lces.dynText.tags[entity.type] ? entity.type : "default";
      
      entity.element = lces.dynText.tags[entityType].node().element;
      entity.element.update = lces.dynText.tags[entityType].update;
      
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
    
    // Prop change event
    this.addEvent("dynpropchange");
    
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
  lces.ui.addEvent("resize");
  
  var resizeTimeout = null;
  var oldWidth  = 0;
  var oldHeight = 0;
  
  lces.ui.assertResized = function(e, init) {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    } else if (!init) {
      oldWidth  = innerWidth;
      oldHeight = innerHeight;
    }
    
    resizeTimeout = setTimeout(function() {
      lces.ui.triggerEvent("resize", {oldWidth: oldWidth, oldHeight: oldHeight, width: innerWidth, height: innerHeight});
      
      resizeTimeout = null;
    }, init ? 0 : 500);
  }
  
  window.addEventListener("resize", lces.ui.assertResized);
  
  
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
  
  // To know if using a mobile device
  var mobileVendors = /Android|webOS|iPhone|iPod|BlackBerry|Windows Phone/i;
  
  lces.ui.mobileDevice = Math.max(screen.width || screen.availWidth, screen.height || screen.availHeight, 800) === 800 && mobileVendors.test(navigator.userAgent);
  
  // LCES URL API
  
  
    lces.url = new lcComponent();

    // Store the triggers in the order of their appearance
    // e.g. .com/cp/go/furnitures/chairs
    //
    // Format:
    // url.triggers = {
    //   cp: {
    //     go: function(category, type) {
    //       // Do stuff
    //     }
    //   }
    // }
    // Or just:
    // url.triggers = {go: function(category, type) {...}}
    //
    // Which is called like this, if like the latter example then no cp.:
    //  lces.url.cp.go("furnitures", "chairs")
    lces.url.setState("triggers", {});
    
    lces.url.addStateCondition("triggers", function() {
      var triggers = this.stateStatus;
      
      if (jSh.type(triggers) === "object") {
        function removeParentLink(cur) {
          cur.__ = null;
          
          var triggerNames = Object.getOwnPropertyNames(cur);
          
          for (var i=0,l=triggerNames.length; i<l; i++) {
            if (triggerNames[i] !== "__" && jSh.type(cur[triggerNames[i]]) === "object")
              removeParentLink(cur[triggerNames[i]]);
          }
        }
        
        removeParentLink(triggers);
      }
      
      return true;
    });
    
    lces.url.addStateListener("triggers", function(triggers) {
      if (jSh.type(triggers) === "object") {
        function addParentLink(prev, cur) {
          if (prev)
            cur.__ = prev;
          
          var triggerNames = Object.getOwnPropertyNames(cur);
          
          for (var i=0,l=triggerNames.length; i<l; i++) {
            if (triggerNames[i] !== "__" && jSh.type(cur[triggerNames[i]]) === "object")
              addParentLink(cur, cur[triggerNames[i]]);
          }
        }
        
        addParentLink(null, triggers);
      }
    });

    // A count of the triggers in url.triggers
    lces.url.setState("triggerCount", 0);

    // If true LCESURL will react to popstate events
    lces.url.setState("acceptChange", false);


    // TriggerCount Getter
    lces.url.states["triggerCount"].get = function() {
      return Object.getOwnPropertyNames(lces.url.triggers).length;
    }

    // Events
    lces.url._onURLChange = function() {
      var func = lces.url.process();
      
      if (!func) {
        if (jSh.type(lces.url.triggers._default) === "function")
          lces.url.triggers._default();
        
        return false;
      }
      
      func.func.apply(this, func.args);
    }

    lces.url.addStateListener("acceptChange", function(accept) {
      if (accept) {
        window.addEventListener("popstate", lces.url._onURLChange);
      } else {
        window.removeEventListener("popstate", lces.url._onURLChange);
      }
    });

    // Methods
    lces.url.process = function() {
      var loc        = location.pathname.substr(1);
      
      // Remove trailing slash if any
      if (/^([^\/]+\/)+$/i.test(loc))
        loc = loc.substr(0, loc.length - 1);
      
      var url        = loc.split("/");
      var startIndex = null;
      
      url.every(function(i, index) {
        if (lces.url.triggers[i]) {
          startIndex = index;
          return false;
        }
        
        return true;
      });
      
      // Check if failed to locate starter object/function
      if (startIndex === null)
        return false;
      
      
      var func      = null;
      var args      = null;
      var curObject = null;
      
      function isFunction(o) {
        return typeof o === "function";
      }
      
      url.every(function(i, index, arr) {
        if (index >= startIndex) {
          var curr = curObject ? curObject[url[index]] : lces.url.triggers[url[index]];
          
          if (!curr) {
            return false;
          }
          
          if (index === arr.length - 1 && jSh.type(curr) === "object" && isFunction(curr["."])) {
            func = curr["."];
            args = url.slice(index + 1);
            
            return false;
          } else if (isFunction(curr)) {
            func = curr;
            args = url.slice(index + 1);
            
            return false;
          }
          
          curObject = curr;
        }
        
        return true;
      });
      
      
      if (!func)
        return false;
      
      return {func: func.bind(curObject), args: args};
    }
    
    var history = window.history;
    lces.url.set = function(url) {
      history.pushState(null, null, url);
    }
}
