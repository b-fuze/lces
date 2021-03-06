// LCES Widget Extra Components
lces.rc[5] = function() {
  window.lcForm = function(e) {
    lcWidget.call(this, e || jSh.c("form"));
    
    // Something here, possibly, maybe?
  }

  jSh.inherit(lcForm, lcWidget);


  // Some extensions


  // TODO: Consider the best method of implementing user-driven events
  // function lcWidget

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
  ], {tabindex: 0})});

  lces.global.lcSlider = function(refElm) {
    // Check if called as a template child
    var isTemplChild = lces.template.isChild(arguments, this);
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
    var widthCheck    = false;
    
    scrubbar.addEventListener("mousedown", function(e) {
      e.preventDefault();
      var target = e.target || e.srcElement;
      
      // Focus scrubbar
      that.element.focus();
      
      // Update height in case of unforeseen changes
      scrubbarWidth = scrubbar.offsetWidth;
      scrubberWidth = scrubber.offsetWidth;
      
      var onScrub = function(e, scrubberTrig) {
        e.preventDefault();
        var sbRect = scrubbar.getBoundingClientRect();
        
        that.triggerEvent("scrubberX", {
          scrubberTriggered: !scrubberTrig,
          x: e.clientX - sbRect.left - scrubberWidth * 0.5
        });
      }
      
      onScrub(e, !(target === scrubber));
      that.classList.add("scrubbing");
      
      window.addEventListener("mousemove", onScrub);
      window.addEventListener("mouseup", function(e) {
        e.preventDefault();
        window.removeEventListener("mousemove", onScrub);
        
        that.classList.remove("scrubbing");
      });
    });
    
    this.on("scrubberX", function(e) {
      var maxOff = scrubbarWidth - scrubberWidth - 2;
      var newOff = e.x < 0 ? 0 : e.x;
      newOff = (newOff > maxOff ? maxOff : newOff);
      
      if (!widthCheck) {
        // Update value
        if (!e.valueTriggered) {
          that.updatingValue = true;
          
          var newValue = that.min + (that.max - that.min) * (newOff / (scrubbarWidth - scrubberWidth - 2));
          that.value = !that.decimals ? Math.round(newValue) : newValue;
        } else {
          that.states["value"].oldStateStatus = that.value;
          that.states["value"].stateStatus = that.min + (that.max - that.min) * (newOff / (scrubbarWidth - scrubberWidth - 2));
        }
        
        that.displayValue = Math.round(that.value * 100) / 100;
        
        if (!that.decimals)
          that.displayValue = Math.round(that.displayValue);
      }
      
      // Check if scrubber is the trigger
      if (!e.scrubberTriggered && !widthCheck)
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
    
    this.updateSliderWidth = function() {
      scrubbarWidth = scrubbar.offsetWidth;
      scrubberWidth = scrubber.offsetWidth;
    
      // Force scrubber update
      widthCheck = true;
      that.triggerEvent("scrubberX", {valueTriggered: true, x: (scrubbarWidth - scrubberWidth) * ((this.value - that.min) / (that.max - that.min))});
      widthCheck = false;
    }
    
    this.min = 0;
    this.max = 100;
    this.displayValue = 0;
    this.decimals = true;
    
    // For when focused
    var keyIncr = {"37": -1, "39": 1, "38": 5, "40": -5};
    
    this.element.addEventListener("keydown", function(e) {
      if (keyIncr[e.keyCode])
        e.preventDefault();
    });
    this.element.addEventListener("keyup", function(e) {
      if (e.keyCode === 37 || e.keyCode === 39) {
        var newValue = that.value + keyIncr[e.keyCode];
        
        if (newValue >= that.min && newValue <= that.max)
          that.value = !that.decimals ? Math.round(newValue) : newValue;
      } else if (e.keyCode === 38 || e.keyCode === 40) {
        var newValue = Math.max(Math.min(that.value + keyIncr[e.keyCode], that.max), that.min);
        
        that.value = !that.decimals ? Math.round(newValue) : newValue;
      } else {
        return false;
      }
      
      e.preventDefault();
    });
    
    document.body.removeChild(this.element);
    
    if (refElm) {
      var attrMin   = refElm.getAttribute("min");
      var attrMax   = refElm.getAttribute("max");
      var prefix    = refElm.getAttribute("prefix");
      var suffix    = refElm.getAttribute("suffix");
      var hideValue = refElm.getAttribute("hide-value");
      var decimals  = refElm.getAttribute("decimals");
      var steps     = refElm.getAttribute("steps");
      
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
    
    // Input events
    var inputEvents = ["change", "input", "focus", "blur", "click"];
    
    // Add event listener wrapper
    var _addListener = this.addEventListener;
    this.addEventListener = function(event, cb) {
      event = (event + "").toLowerCase();
      
      if (inputEvents.indexOf(event) !== -1)
        that.input.addEventListener(event, cb);
      else
        that.addEventListener(event, cb);
    }
    
    // Upload
    this.upload = function(url, keys, progressCb, readystatechangeCb) {
      var form = new lcForm();
      form.append(that.input);
      
      // Get keys from input elements
      if (jSh.type(keys) === "array")
        keys.forEach(function(i) {form.append(i);});
      
      // Create FormData
      var fd = new FormData(form.element);
      
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
      
      // Commence upload
      req.send();
      
      // Put input back in component
      that.append(that.input);
      
      return req;
    }
    
    var lcesph    = jSh.ph ? jSh.ph() : null;
    var resetForm = jSh.c("form");
    
    this.reset = function() {
      if (lcesph)
        lcesph.substitute(input);
      
      resetForm.appendChild(input);
      resetForm.reset();
      
      if (lcesph)
        lcesph.replace(input);
      else
        that.element.appendChild(input);
      
      textDisplay.textContent = "No file chosen";
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


  window.acceptableKeyCodes = {"9": "tab", "48": "0", "49": "1", "50": "2", "51": "3", "52": "4", "53": "5", "54": "6", "55": "7", "56": "8", "57": "9", "37": "left_arrow", "38": "up_arrow", "39": "right_arrow", "40": "down_arrow", "46": "delete", "8": "backspace", "13": "enter", "16": "shift", "17": "ctrl", "18": "alt", "35": "end", "36": "home", "96": "numpad_0", "97": "numpad_1", "98": "numpad_2", "99": "numpad_3", "100": "numpad_4", "101": "numpad_5", "102": "numpad_6", "103": "numpad_7", "104": "numpad_8", "105": "numpad_9", "109": "subtract", "110": "decimal_point", "190": "period", "189": "dash" };

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
    this.setState("min", null);
    this.setState("max", null);
    this.setState("integer", false);
    this.setState("digits", 5);
    this.setState("decimalPoints", 5);
    
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
    
    // Add event listeners to the element
    this.testInt = new RegExp("^\\d{0," + this.digits + "}$");
    this.testFloat = new RegExp("^\\d{0," + this.digits + "}(?:\\.\\d{0," + this.decimalPoints + "})?$");
    this.testInput = function() {
      var curValueFloat = parseFloat(this.value);
      var curValueInt   = parseInt(this.value);
      
      if (isNaN(curValueFloat) || that.integer && curValueFloat !== curValueInt) {
        this.value = that.oldValue;
      } else if (typeof that.min == "number" && curValueFloat < that.min) {
        this.value = that.min;
      } else if (typeof that.max == "number" && curValueFloat > that.max) {
        this.value = that.max;
      } else {
        that.oldValue = this.value;
        
        // New input has passed all tests
        return true;
      }
      
      return false;
    }
    
    this.addEventListener("change", this.testInput);
    
    this.increment = function() {
      var value = {value: parseFloat(that.element.value) + 1};
      
      var pass = that.testInput.call(value);
      if (pass) this.value = value.value;
      
      if (!lces.ui.mobileDevice)
        that.element.focus();
    }
    
    this.decrement = function() {
      var value = {value: parseFloat(that.element.value) - 1};
      
      var pass = that.testInput.call(value);
      if (pass) this.value = value.value;
      
      if (!lces.ui.mobileDevice)
        that.element.focus();
    }
    
    this.addEventListener("keydown", function(e) {
      if (e.ctrlKey)
        return;
      
      if (acceptableKeyCodes[e.keyCode.toString()] === undf)
        return e.preventDefault();
      
      switch (e.keyCode) {
        case 38:
          that.increment();
          break;
        case 40:
          that.decrement();
          break;
      }
      
      return;
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
    
    // Reset parent state function from lcWidget
    this.states["parent"].functions[0] = function(parent) {
      if (parent) {
        if (parent.isLCESComponent)
          parent = parent.element;

        parent.appendChild(that.container);
      } else if (that.parent)
        that.parent.removeChild(that.container);
    }
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
  
  
  lces.ui.CheckBoxSVG = jSh.svgm(".checkboxsvg", 14, 13, [
    jSh.pathm(".checkboxcolor", "M2.6 1 10.4 1C11.3 1 12 1.7 12 2.6l0 7.9C12 11.3 11.3 12 10.4 12L2.6 12C1.7 12 1 11.3 1 10.4L1 2.6C1 1.7 1.7 1 2.6 1z"),
    jSh.pathm(undf, "m2.6 2.3 7.7 0C10.6 2.3 10.8 2.4 10.8 2.6l0 7.7C10.8 10.6 10.6 10.8 10.4 10.8l-7.7 0C2.4 10.8 2.3 10.6 2.3 10.4l0-7.7C2.3 2.4 2.4 2.3 2.6 2.3z", "fill: #fff;"),
    jSh.pathm(".checkboxcolor", "M11.5 2.5 11 3.1 5.9 8.2 4.3 6.6 3.8 6.1 2.7 7.1 3.2 7.7 5.3 9.8 5.9 10.3 6.4 9.8 12.1 4.1 12.6 3.6 11.5 2.5z")
  ]);
  
  window.lcCheckBox = function(e) {
    // Check if called as a template child
    var isTemplChild = lces.template.isChild(arguments, this);
    if (isTemplChild)
      return isTemplChild;
    
    lcTextField.call(this, jSh.d("lcescheckbox"));
    var that = this;
    
    this.type = "LCES CheckBox Widget";
    
    // Check for reference InputElement
    if (e) {
      e.style.display = "none";
      e.parentNode.insertBefore(this.element, e);
    } else
      e = {checked: false};
    
    var svg = lces.ui.CheckBoxSVG.conceive(true);
    
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
    
    this.setState("label", null);
    this.addStateListener("label", function(label) {
      if (label && (label.tagName + "").toLowerCase() === "label") {
        function onClickLabel(e) {
          that.checked = !that.checked;
          that.focused = true;

          e.preventDefault();
        }
        
        // Add listener and component reference
        label.addEventListener("mousedown", onClickLabel);
        label.component = that;
      }
    });
    
    if (e && e.id) {
      // Add component reference to reference element
      e.component = this;
      
      // Check for associated labels
      var labels = LCESLoopLabels();
      
      if (labels[e.id]){
        this.label = labels[e.id];
      }
    }
  }

  jSh.inherit(lcCheckBox, lcTextField);
  
  window.lcToggleField = function(e) {
    lcWidget.call(this, jSh.d(".lces-togglebox", undf, [
      jSh.d(".lces-togglebox-handle", undf, jSh.d(".lces-togglebox-inner", undf, [
        jSh.d(".lces-togglebox-text", "OFF")
      ]))
    ]));
    
    this.type = "LCES Toggle Field";
    var that = this;
    var text = this.jSh(".lces-togglebox-text")[0];
    var main = this.element;
    
    main.tabIndex = 0;
    main.addEventListener("keyup", function(e) {
      if (e.keyCode === 32) {
        that.checked = !that.checked;
        e.preventDefault();
      }
    });
    
    main.addEventListener("keydown", function(e) {
      if (e.keyCode === 32)
        e.preventDefault();
    });
    
    this.setState("checked", null);
    this.addStateListener("checked", function(checked) {
      if (checked) {
        that.element.classList.add("checked");
        text.innerHTML = "ON";
        
      } else {
        that.element.classList.remove("checked");
        text.innerHTML = "OFF";
      }
    });
    
    this.addEventListener("click", function() {
      that.checked = !that.checked;
      
      main.focus();
    });
    
    this.addEventListener("mousedown", function(e) {
      e.preventDefault();
    });
    
    // Check for reference element
    if (e) {
      var checked = e.getAttribute("checked");
      var refID   = e.getAttribute("id");
      
      if (checked !== null && checked.toLowerCase() !== "false")
        this.checked = true;
      else
        this.checked = false;
      
      if (typeof refID === "string" && refID.trim()) {
        var labels = LCESLoopLabels();
        
        if (labels[refID])
          labels[refID].addEventListener("click", function() {
            that.checked != that.checked;
          });
      }
      
      e.parentNode.insertBefore(this.element, e);
      this.parent.removeChild(e);
    } else {
      this.checked = false;
    }
  }
  
  jSh.inherit(lcToggleField, lcCheckBox);
  
  // -------------
  // LCES Dropdown
  // -------------
  
  var uiddown = new lcComponent();
  lces.ui.dropdown = jSh.extendObj(uiddown, {
    // options: {}, TODO: Check if required
    optionCount: 0,
    
    display: null,
    screen: new lcWidget(jSh.d(".lces-dropdown-screen.lces-themify")),
    screenSet: false,
    
    cancelHide: function(e) {
      e.preventDefault();
      uiddown.screenVisible = false;
    },
    show: function(ddown) {
      this.active = ddown;
      
      this.screenVisible = true;
    },
    hide: function() {
      this.screenVisible = false;
      
      if (this.active.highlightedOption !== this.active.selectedOption)
        this.active.selectedOption = this.active.highlightedOption;
    }
  });
  
  uiddown.addStateListener("active", function(ddown) {
    var screen = uiddown.screen;
    
    // Remove current options and append new ones
    uiddown.display.removeAllOptions();
    uiddown.display.options = ddown.options;
    uiddown.display.optionsContainer.append(ddown.options.map(o => o[2]));
    
    uiddown.display.selectedDisplay.html = ddown.selectedDisplay.html;
    uiddown.display.updateDropdownSize();
    
    uiddown.display.style.width = getComputedStyle(ddown.element)["width"];
  });
  
  uiddown.addStateListener("screenVisible", function(visible) {
    var ddown   = uiddown.active;
    var display = uiddown.display;
    var screen  = uiddown.screen;
    
    if (visible) {
      screen.classList.add("visible");
      
      var cRect = ddown.element.getBoundingClientRect();
      display.style = {
        top: cRect.top + "px",
        left: cRect.left + "px"
      }
      display.classList.add("visible");
      display.checkFlipped();
    } else {
      display.classList.remove("visible");
      
      setTimeout(function() {
        screen.classList.remove("visible");
      }, 260);
    }
  });
  
  uiddown.screen.addEventListener("mouseover", function(e) {e.preventDefault()});
  uiddown.screen.addEventListener("wheel", uiddown.cancelHide);
  uiddown.screen.addEventListener("click", function(e) {
    var target = e.target || e.srcElement;
    
    while (target !== this) {
      var targetId = target.getAttribute("lces-dropdown-option-id");
      
      if (targetId) {
        uiddown.active.selectOption(targetId);
        uiddown.active.element.focus();
        break;
      }
      
      target = target.parentNode;
    }
    
    uiddown.hide();
  });
  
  // Create screen dummy dropdown
  lces.addInit(function() {
    uiddown.screen.parent = document.body;
    uiddown.screenSet = true;
    
    uiddown.display = new lcDropDown(null, true);
    uiddown.display.parent = uiddown.screen;
  }, 2);
  
  window.lcDropDownOption = function(value, content, dropdown) {
    lcWidget.call(this, jSh.d(".lcesoption"));
    
    var that   = this;
    this.type  = "LCES Option Widget";
    this.value = value;
    this.opId  = uiddown.optionCount++;
    
    this.setAttr("lces-dropdown-option-id", this.opId);
    
    // Check content type
    if (jSh.type(content) === "array")
      this.append(content);
    else
      this.append(this._determineType(content));
    
    this.setState("selected", false);
    this.addStateListener("selected", function(state) {
      if (state) {
        that.highlighted = true;
        
        // Unselect the previous option
        var oldOption = dropdown.states["selectedOption"].oldStateStatus;
        if (oldOption)
          oldOption.selected = false;
      } else {
        that.highlighted = false;
      }
    });
    
    this.setState("highlighted", false);
    this.addStateListener("highlighted", function(state) {
      if (state)
        that.element.setAttribute("lces-selected", "");
      else
        that.element.removeAttribute("lces-selected");
    });
  }
  
  jSh.inherit(lcDropDownOption, lcWidget);
  
  window.lcDropDown = function(e, screenDummy) {
    lcTextField.call(this, jSh.d(".lcesdropdown", undf, [
      jSh.d(".lcesdropdown-arrow", undf, [
        jSh.svg(undf, 10, 5, [
          jSh.path(undf, "m0 0 10 0-5 5z", "fill: #fff;")
        ])
      ])
    ], screenDummy ? undf : {tabindex: 0}));

    var that = this;
    this.type = "LCES DropDown Widget";
    
    this.options = [];
    this.setState("selectedOption", false);
    
    // Check for refElement
    if (e)
      this.selectElement = e;
    
    // Create necessary elements
    this.selectedDisplay = new lcWidget(jSh.d("lcesselected"));
    this.appendChild(this.selectedDisplay);
    
    // Check if the designated screen dropdown
    if (screenDummy) {
      this.optionsContainer = new lcWidget(jSh.d("lcesoptions"));
      this.appendChild(this.optionsContainer);
      
      // Events for displaying options
      function onWindowScroll() {
        checkFlipped();
      }
      
      // Event for knowing if menu goes below the viewport
      this.setState("flipped", false);
      this.addStateListener("flipped", function(flipped) {
        that.classList[flipped ? "add" : "remove"]("flipped");
      });
      
      this.checkFlipped = function() {
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
      
      if (e)
        e.value = value;
    });
    
    // Disable annoying default browser functionality
    this.addEventListener("mousedown", function(e) {
      e.preventDefault();
      
      if (!screenDummy) {
        that.element.focus();
        uiddown.show(that);
      }
    });
    
    // Normal dropdown
    if (!screenDummy) {
      that.addEventListener("keydown", function(e) {
        var cancel = false;
        
        // Space/Enter Key - Open dropdown
        if (e.keyCode === 32 || e.keyCode === 13) {
          if (!uiddown.screenVisible)
            uiddown.show(that);
          else
            uiddown.hide();
          
          cancel = true;
          
        // Tab Key - Close dropdown
        } else if (e.keyCode === 9) {
          uiddown.hide();
          
        // Up/Down Arrow Key - Highlight different options
        } else if (e.keyCode === 38 || e.keyCode === 40) {
          var hOption = that.highlightedOption;
          var nextOption;
          
          if (e.keyCode === 38)
            nextOption = that.options[hOption.opIndex - 1];
          else
            nextOption = that.options[hOption.opIndex + 1];
          
          if (nextOption)
            that.highlightedOption = nextOption[2];
          
          cancel = true;
          
        // Esc key - Cancel arrowkey selection and close dropdown
        } else if (e.keyCode === 27) {
          that.highlightedOption = that.selectedOption;
          uiddown.hide();
          
          cancel = true;
        }
        
        if (cancel)
          e.preventDefault();
      });
      
      this.addStateListener("highlightedOption", function(option) {
        if (this.oldStateStatus)
          this.oldStateStatus.highlighted = false;
        
        option.highlighted = true;
      });
      
      this.addStateListener("selectedOption", function(option) {
        if (!option) {
          that.selectedDisplay.html = "&nbsp;";
          return false;
        }
        
        that.selectedDisplay.html = option.html;
        that.value = option.value;
        option.selected = true;
        
        // Update highlightedOption if not already
        that.highlightedOption = option;
      });
      
      // When focused by lces.focus
      this.removeAllStateListeners("focused");
      this.addStateListener("focused", function(state) {
        this.component.menuvisible = state;
      });
      
      this.setState("menuvisible", false);
      this.addStateListener("menuvisible", function(mvisible) {
        if (mvisible) {
          uiddown.show(this);
        } else {
          uiddown.hide();
        }
      });
      
      this.selectOption = function(id) {
        this.selectedOption = this.options[id + "id"];
      }
    }
    
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
        
        var newWidth = parseInt(getComputedStyle(that.selectedDisplay.element)["width"]) + 5;
        if (newWidth > longestOptionSize)
          longestOptionSize = newWidth;
      });
      
      // Set new width
      this.selectedDisplay.style = {width: (longestOptionSize + 3) + "px"};
      this.selectedDisplay.html = displayValue;
      
      // Put dropdown back in it's place
      ph.replace(this);
    }
    
    // LCES DROPDOWN METHODS
    // ---------------------
    
    // Add option
    this.addOption = function(value, content) {
      var newOption = new lcDropDownOption(value, content, this);
      
      this.options.push([value + "op", newOption.html, newOption]);
      this.options[value + "op"] = newOption;
      this.options[newOption.opId + "id"] = newOption;
      
      // Add option index
      newOption.opIndex = this.options.length - 1;
      
      if (this.options.length === 0)
        this.selectedOption = newOption;
      that.updateDropdownSize();
      
      return newOption;
    }
    
    // Remove option
    this.removeOption = function(option) {
      var index   = typeof option === "number" ? option : null;
      var value   = typeof option === "string" ? option : null;
      var element = index === null && value === null ? this._determineType(option) : null;
      
      var removeOptions = [];
      
      if (index !== null) {
        removeOptions.push([this.options[index], index]);
      } else {
        this.options.forEach(function(opt, i) {
          if (value !== null) {
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
          that.options[i[0].value + "op"] = undf;
          that.options[i[0].opId + "id"] = undf;
          
          if (that.selectedOption === i[0][2])
            that.selectedOption = that.options[0][2];
        }
      });
      
      // Update option option indexes
      for (var i=0,l=this.options.length; i<l; i++) {
        this.options[i][2].opIndex = i;
      }
      
      that.updateDropdownSize();
    }
    
    this.removeAllOptions = function() {
      that.options = [];
      that.value   = null;
      
      if (screenDummy)
        that.optionsContainer.remove(that.optionsContainer.children);
      else
        that.updateDropdownSize();
    }
    
    // Check for refElement and options
    if (e) {
      if (e.parentNode)
        e.parentNode.insertBefore(this.element, this.selectElement);
      
      // Add options
      var endValue = null;
      
      // Loop option elements
      if (e.tagName.toLowerCase() === "select") {
        var refOptions = jSh(e).jSh("option");
        
        refOptions.forEach(function(i, index) {
          var newOption = that.addOption(i.value, jSh.toArr(i.childNodes));
          
          if (i.value == e.value || index === 0)
            endValue = newOption;
        });
      } else if (e.tagName.toLowerCase() === "lces-widget") {
        var refOptions = jSh(e).jSh("lces-option");
        
        refOptions.forEach(function(option, index) {
          var valueAttr    = option.getAttribute("value");
          var selectedAttr = option.getAttribute("selected") !== null && option.getAttribute("selected") !== "false";
          
          var value = valueAttr || "value" + that.options.length;
          var newOption = that.addOption(value, jSh.toArr(option.childNodes));
          
          if (selectedAttr || index === 0)
            endValue = newOption;
        });
      }
      
      this.selectedOption = endValue;
      
      // End refElement
      e.style.display = "none";
    }
    
    // End
    var selectedOption = this.selectedOption;
    this.value = undefined;
    this.value = selectedOption ? selectedOption.value : "";
  }
  
  jSh.inherit(lcDropDown, lcTextField);
  
  // -----------------
  // LCES Table Widget
  // -----------------
  
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
      
      if (this.tbody)
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
    "togglefield": lcToggleField,
    // "radio":
    "textfield": lcTextField,
    "textarea": lcTextArea,
    "slider": lcSlider,
    "numberfield": lcNumberField,
    "fileinput": lcFileInput,
    "table": lcTable,
    
    "accordion": lcAccordion
  });
}
