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
