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

  lces.ui.colorChooserTemplate = lces.template({render: jSh.dm(".lces-colorchooser.visible", undf, [
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
    // Check if called as a template child
    var isTemplChild = checkTemplateChild(arguments, this);
    if (isTemplChild)
      return isTemplChild;
    
    // Inherit textfield traits
    lcTextField.call(this);
    
    // Check for main color chooser modal container
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
