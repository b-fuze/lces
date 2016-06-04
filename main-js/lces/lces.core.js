// LCES Core code, depends on jShorts2.js

lces.rc[2] = function() {
  // LCES JS code (Acronym Galore! :D)
  // On another note, these *LV* things might be useless...
  
  lces.global.LCESVar = function(n) {
    this.LCESVAR = true; // Might be needed in the future.
    this.id = n;
  }
  lces.global.LV = function(n) {
    return new LCESVar(n);
  }
  lces.global.isLV = function(v) {
    return v instanceof LCESVar;
  }

  lces.global.LCES = {
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
  
  // For faster reference
  var Object = lces.global.Object || window.Object;
  
  lces.global.lcComponentMethods = {
    setState: function(state, stateStatus, recurring, recurred) {
      if (!this.states[state]) {
        // Since we don't have it, we'll make it.

        this.states[state] = {
          component: this,
          name: state,
          set: function(stateStatus) {this.component.setState(state, stateStatus);},
          get: function() {return this.stateStatus;},
          stateStatus: stateStatus,
          oldStateStatus: {nullStuff: null}, // Just to ensure that it doesn't match.
          functions: [],
          conditions: [],
          getter: null,
          data: {},
          private: false, // If true then data links (lcGroup) can't change it.
          flippedStateCall: false,
          linkedStates: {} // {state: "state", func: func}
        }

        var that = this;
        Object.defineProperty(this, state, {configurable: true, set: function(stateStatus) { that.setState(state, stateStatus); }, get: function() { return that.getState(state); }});
      }

      var stateObject = this.states[state];
      var stateCond   = stateObject.conditions;
      var canContinue = true;
      
      // Propose value during condition check
      stateObject.proposedValue = stateStatus;
      
      for (var i=0,l=stateCond.length; i<l; i++) {
        var condFunc = stateCond[i];
        
        if (condFunc)
          canContinue = condFunc.call(stateObject, stateStatus, recurred);
        
        if (!canContinue)
          return false;
      }
      
      // Set from proposedValue
      stateStatus = stateObject.proposedValue;
      
      if (stateObject.stateStatus === stateStatus && !recurring)
        return false;

      // If we're here then everything seems to be okay and we can move on.
      // Set the state.
      stateObject.oldStateStatus = stateObject.stateStatus;
      stateObject.stateStatus = stateStatus;
      
      var stateObjectFuncs = stateObject.functions;
      
      // Now call listeners...
      for (var j=0,l2=stateObjectFuncs.length; j<l2; j++) {
        var func = stateObjectFuncs[j];
        
        if (func)
          func.call(stateObject, stateStatus, recurring);
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
        // console.warn(state + " doesn't exist"); // NOTICE: Removed for redundancy
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
      if (group)
        group.removeMember(this);
    },
    
    removeAllGroupLinks: function() {
      var groups = this.groups;
      
      for (var i=0,l=groups.length; i<l; i++) {
        var group = groups[i];
        
        if (group)
          group.removeMember(this);
      }
    },

    removeStateListener: function(state, listener) {
      if (!this.states[state])
        throw ReferenceError("No such state");

      var stateObject = this.states[state];
      var index = stateObject.functions.indexOf(listener);
      
      if (index !== -1) {
        stateObject.functions.splice(index, 1);
        
        return true;
      }

      return false; // We failed it seems :/
    },

    removeAllStateListeners: function(state) {
      if (!this.states[state])
        throw ReferenceError("No such state");
      
      var functions = this.states[state].functions;
      var listenersLength = functions.length;
      
      for (var i=0; i<listenersLength; i++) {
        functions.splice(i, 1);
      }
      
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
      
      var stateObj = this.states[state];
      
      if (!stateObj)
        throw ReferenceError("No such state");
      
      var linkedStates = Object.getOwnPropertyNames(stateObj.linkedStates);
      var unlinkStates = this.unlinkStates.bind(this);
      
      for (var i=0,l=linkedStates.length; i<l; i++) {
        if (this.states[linkedStates[i]])
          unlinkStates(state, linkedStates[i]);
      }
      
      stateObj.component = undf;
      
      this.states[state] = undf; // NOTICE: Used delete keyword FIX
      delete this[state];        // TODO: FIX THIS
    },
    
    removeAllStates: function() {
      var states = Object.getOwnPropertyNames(this.states);
      
      for (var i=0,l=states.length; i<l; i++) {
        this.removeState(states[i]);
      }
      
      return true;
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
        var callback = listener.callback;
        var state1   = listener.state1;
        var state2   = listener.state2;
        
        var state1Value = that.getState(state1);
        var state2Value = that.getState(state2);
        
        if (!callback && state1Value === state2Value)
          return true;
        
        // Now to set the state in question
        if (state === state2)
          that.setState(state1, callback ? callback(state2Value) : state2Value);
        else if (state === state1 && !callback)
          that.setState(state2, state1Value);
      };
      
      listener.callback = callback;
      listener.state1   = state1;
      listener.state2   = state2;

      this.states[state1].linkedStates[state2] = listener;
      this.states[state2].linkedStates[state1] = listener;

      this.setState(state2, this.getState(state1));
      this.addStateListener("statechange", listener);
    },

    unlinkStates: function(state1, state2) {
      var stateObj1 = this.states[state1];
      var stateObj2 = this.states[state2];
      
      if (!stateObj1 || !stateObj2)
        throw ReferenceError("No such state");

      if (!stateObj1.linkedStates[state2])
        throw TypeError("[" + state1 + "] isn't linked to [" + state2 + "]");


      this.removeStateListener("statechange", stateObj1.linkedStates[state2]);
      
      stateObj1.linkedStates[state2] = undf;
      stateObj2.linkedStates[state1] = undf;

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
    
    removeAllEvents: function() {
      var events = this.events;
      
      for (var i=0,l=events.length; i<l; i++) {
        events[i] = undf;
      }
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
      var evtObj = this.events[event];
      
      if (!event || jSh.type(event) !== "string" || !evtObj)
        return false;
      
      var index = evtObj.listeners.indexOf(listener);
      
      if (index !== -1)
        evtObj.listeners.splice(index, 1);
    }
  }
  
  // lcComponent custom setState method
  function lcComponentSetState(state, stateStatus, recurring) {
    var states    = this.states;
    var _setState = this._setState.bind(this);
    var stateObj  = states[state];
    
    var statechange = states.statechange;
    
    if (!recurring && stateObj && stateObj.stateStatus === stateStatus) {
      _setState(state, stateStatus, recurring, true);
      return false;
    }
      
    var newstate = false;
    if (!stateObj)
      newstate = true;

    if (!stateObj || !stateObj.flippedStateCall) {
      _setState(state, stateStatus, recurring);
      
      var stateObj  = states[state];
      
      if (stateObj.oldStateStatus !== stateObj.stateStatus) {
        if (!statechange.states[state])
          statechange.states[state] = {};
        
        statechange.states[state].recurring = recurring;
        
        _setState("statechange", state, true);
      }
    } else {
      if (stateObj.oldStateStatus !== stateObj.stateStatus) {
        if (!statechange.states[state])
          statechange.states[state] = {};
        
        statechange.states[state].recurring = recurring;
        
        _setState("statechange", state, true);
      }
      
      _setState(state, stateStatus, recurring);
    }

    if (newstate)
      _setState("newstate", state, true);
  }
  
  // AUCP LCES Constructors

  lces.global.lcComponent = function() {
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
    
    // Statechange state specifics
    this.states["statechange"].states = {};

    this._setState = this.setState;
    this.setState  = lcComponentSetState;
    
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
        throw TypeError("Listener " + listener + " is not of type 'function'");
      
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


  lces.global.lcGroup = function() {
    var extended = lcComponent.call(this);
    if (!extended)
      this.type = "LCES Group";
    
    var that = this;
    var members  = [];
    this.members = members;
    this.lastTrigger = {}; // lastTrigger[state] = LastTriggeringMember
    
    var thatStates = that.states;
    
    // Add our main stuffs.
    jSh.extendObj(this, lcGroupMethods);
    
    // Update members after a trigger
    var updatingGroupState = false;
    
    function updateMembers(state, value, recurring) {
      var that = updateMembers.that;
      var members = updateMembers.members;
      
      for (var i=0,l=members.length; i<l; i++) {
        var member = members[i];
        
        if (member.states[state] && !member.states[state].private && member.states[state].stateStatus !== value || recurring){
          if (!that.exclusiveMembers[state]) {
            member._setState(state, value, recurring);
            member._setState("statechange", state, true);
          } else if (that.exclusiveMembers[state]) {
            member._setState(state, that.isExclusiveMember(state, member) ? !that.getState(state) : that.getState(state));
            member._setState("statechange", state, true);
          }
        }
      }
    }
    
    updateMembers.that    = that;
    updateMembers.members = members;
    
    this.recurring = true;
    this.recurringMemberTrigger = true;
    this.memberMethod = function mmethod(state) {
      var that = mmethod.that;
      var component = this.component;
      
      if (that.states[state] && state !== "LCESName" && !that.states[state].private) {
        // Now to tell everyone else the news...

        that.lastTrigger[state] = component;
        
        if (that.states[state].isExclusive) {
          that.setState(state, that.getState(state), that.recurringMemberTrigger);
        } else {
          updateMembers(state, component.states[state].stateStatus);
          
          updatingGroupState = true;
          that.setState(state, component.states[state].stateStatus);
          updatingGroupState = false;
        }
      }
    }
    
    this.memberMethod.that = that;
    
    this.setState("newmember", null);

    this.addStateListener("statechange", function(state) {
      if (updatingGroupState) {
        updatingGroupState = false;
        
        return;
      }
      
      if (state !== "LCESName")
        updateMembers(state, that.states[state].stateStatus, this.states[state].recurring);
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

  lces.global.lcData = function() { // This should be for stuff that is shared with the server's DB
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

  lces.global.lcRequest = function(args) { // args: {method, uri | url, callback, query, formData, async}
    // Check for args
    args = jSh.type(args) === "object" ? args : null;
    if (args === null)
      return null;
    
    var extended = lcComponent.call(this);
    if (!extended)
      this.type = "LCES Request";
    
    var that   = this;
    this.xhr   = typeof args.__XMLHttpRequest === "function" ? new args.__XMLHttpRequest() : new XMLHttpRequest();
    var  xhr   = this.xhr;
    this.abort = xhr.abort.bind(xhr);
    
    if (typeof (args.callback || args.success || args.fail) === "function") {
      xhr.onreadystatechange = function() {
        if (typeof args.callback === "function")
          args.callback.call(this);
        
        if (this.readyState === 4) {
          if (this.status === 200) {
            if (typeof args.success === "function")
              args.success.call(this);
          } else {
            if (typeof args.fail === "function")
              args.fail.call(this);
          }
        }
      }
    }

    if (args.setup && typeof args.setup === "function")
      args.setup.call(xhr);

    var queryString = "";
    
    if (args.query) {
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
      var oldCookies = document.cookie.split(/\s*;\s*/).map(function(c) {return [c.split("=")[0], c.split("=")[1]]});
      
      if (args.cookies === false) { // Remove all cookies
        var time = (new Date());
        time.setTime(0);
        
        oldCookies.forEach(function(c) {document.cookie = c[0] + "=; expires=" + time + "; path=/"});
      }
      
      xhr.send(method == "POST" ? queryString : undf);
      
      if (args.cookies === false) { // Readd the cookies
        setTimeout(function(){ oldCookies.forEach(function(c) {document.cookie = c[0] + "=" + c[1] + "; expires=; path=/"}) }, 50);
      }
    }
  }

  jSh.inherit(lcRequest, lcComponent);


  // LCES Main functions

  if (!window.lces) // TODO: Likely redundant code, FIXME
    window.lces = function(lcesname) {
      return LCES.components[lcesname];
    }

  // Global container of all lces.types
  lces.types = {
    "component": lcComponent,
    "group": lcGroup
  }
  
  // lces.noReference = Bool
  //
  // If true LCES won't save any reference to any components created
  // it's set. But if set back to false LCES will store a refernce for every component.
  lces.noReference = false;
  
  // lces.new(type, [, arg1[, arg2[, ...]]])
  //
  // type: String. LCES Constructor type as registered in lces.types
  //
  // Returns a new instance of an LCES constructor of
  lces.new = function(type) {
    var args = jSh.toArr(arguments).slice(1);
    var func = lces.types[type || "component"];
    
    return typeof func === "function" ? new (Function.prototype.bind.apply(func, [null].concat(args))) : null;
  }
  
  lces.type = function(type) {
    return lces.types[type || "component"];
  }
  
  // lces.deleteComponent
  //
  lces.deleteComponent = function(component) {
    if (!component || !(component instanceof lcComponent)) {
      console.error("LCES ERROR: Deleting component failed, invalid LCES component");
      
      return false;
    }
    
    var LCESComponents = LCES.components;
    
    var LCESName = component.LCESName;
    
    LCESComponents[component.LCESID] = undf;
    component.removeAllGroupLinks();
    component.removeAllStates();
    component.removeAllEvents();
    
    if (LCESName && LCESComponents[LCESName] === component)
      LCESComponents[LCESName] = undf;
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
      for (var i=0,l=priorityArrays.length; i<l; i++) {
        var pArray = that.initPriority[priorityArrays[i]];
        
        for (var j=0,l2=pArray.length; j<l2; j++) {
          try {
            pArray[j](); // Covers ears and hopes nothing blows up
          } catch (e) {
            // Ehhh, so, what happened????
            console.error(e);
          }
        }
      }
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
      
      var index = priority.indexOf(oldFunc);
      
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
