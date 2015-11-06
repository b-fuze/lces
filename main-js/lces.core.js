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
