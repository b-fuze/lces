// LCES User module core
lces.rc[10] = function() {
  var jSh     = lces.global.jSh;
  // var lces    = window.lces;
  var Object  = lces.global.Object;
  var Boolean = lces.global.Boolean;
  
  var lcComponent = lces.global.lcComponent;
  
  // Check if valid number.
  function numOp(src, def) {
    return !isNaN(src) && jSh.type(src) === "number" && src > -Infinity && src < Infinity ? parseFloat(src) : def;
  }
  
  function multipleIndex(multiple, setting) {
    if (jSh.type(multiple) === "array") {
      var newDump = [];
      
      for (var i=0,l=multiple.length; i<l; i++) {
        var item   = multiple[i];
        var type   = jSh.type(item);
        var formal = "item" + (i + 1);
        var key;
        var index;
        
        if (type === "array" && item.length === 2) {
          type   = jSh.type(item[0]);
          formal = item[1] || formal;
          
          item = item[0];
        }
        
        switch (type) {
          case "date":
            key = item.toJSON();
          break;
          default:
            key = item + "";
          break;
        }
        
        key  = "key" + key;
        index = newDump.length;
        newDump.push([item, formal]);
        
        if (typeof newDump[key] !== "number")
          newDump[key] = index;
      }
      
      return newDump;
    } else {
      return null;
    }
  }
  
  // Create user module
  lces.user = new lcComponent();
  
  // LCES User module settings feature
  lces.user.settings = new lcComponent();
  var settings = lces.user.settings;
  
  // Setting entry constructor
  //
  // multiple: Array. Optional.
  settings.Setting = function Setting(name, types, defValue, multiple, options) {
    // Check if not initialized
    if (!(this instanceof Setting))
      return new Setting(name, types, defValue, multiple, options);
    
    var that  = this;
    this.type = "LCES User Setting Entry";
    
    this.name       = null; // Will be set during the manifest scan
    this.settName   = name;
    
    this.settMultiple   = jSh.type(multiple) === "array" && multiple.length > 1;
    this.multipleValues = this.settMultiple ? multipleIndex(multiple) : null;
    this.currentIndex   = this.settMultiple ? numOp(defValue, 0) : null;
    this.formalMultiple = this.settMultiple ? multiple.map(a => a[1]) : null;
    
    this.defValue   = this.settMultiple ? this.multipleValues[numOp(defValue, 0)] : defValue;
    this.settType   = null;
    
    // If multiple check the default value
    if (this.settMultiple && jSh.type(this.defValue) === "array")
      this.defValue = this.defValue[0];
    
    // Check the types for the setting type
    types   = typeof types === "string" ? types.toLowerCase() : "";
    options = jSh.type(options) === "object" ? options : {};
    
    var numType  = types.indexOf("number") !== -1;
    var integer  = types.indexOf("integer") !== -1;
    var min      = numOp(options.min, null);
    var max      = numOp(options.max, null);
    
    var boolType = types.indexOf("boolean") !== -1;
    var dateType = types.indexOf("date") !== -1;
    var strType  = (!numType && !boolType && !dateType) || types.indexOf("string") !== -1;
    
    var multiple = this.settMultiple;
    var mixed    = types.indexOf("mixed") !== -1;
    
    // Setting object properties
    this.min = min;
    this.max = max;
    
    if (!types) {
      this.settType = "string";
    } else {
      if (numType)
        this.settType = "number";
      else if (boolType)
        this.settType = "boolean";
      else if (dateType)
        this.settType = "date";
      else {
        if (multiple)
          mixed = true;
        
        this.settType = "string";
      }
    }
    
    // Decided to repeat to relieve engine of redundant if condition checking and smaller functions
    if (multiple) {
      if (mixed || strType) {
        this.condition = function(value) {
          var index = jSh.type(value) === "number" ? value : that.multipleValues["key" + value];
          
          if (typeof index !== "number")
            return false;
          
          that.currentIndex  = index;
          this.proposedValue = that.multipleValues[index][0];
          return true;
        }
      } else if (dateType) {
        this.condition = function(value) {
          value = jSh.type(value) === "date" ? value.toJSON() : (typeof value === "number" ? new Date(value) : value);
          var index = that.multipleValues["key" + value];
          
          if (typeof index !== "number")
            return false;
          
          that.currentIndex  = index;
          this.proposedValue = that.multipleValues[index][0];
          return true;
        }
      } else if (numType) {
        this.condition = function(value) {
          var index = that.multipleValues["key" + value];
          
          if (typeof index !== "number")
            return false;
          
          that.currentIndex  = index;
          this.proposedValue = that.multipleValues[index][0];
          return true;
        }
      }
    } else if (numType) {
      this.condition = function(value) {
        if (jSh.type(value) !== "number") {
          var pi = parseFloat(value);
          
          if (integer)
            pi = Math.round(pi);
          
          if ((min !== null && pi < min) || (max !== null && pi > max))
            value = Math.max(Math.min(min, value), max);
          
          if (!isNaN(pi))
            this.component.setState(this.name, pi);
          
          return false;
        }
        
        return true;
      }
    } else if (boolType) {
      this.condition = function(value) {
        if (jSh.type(value) !== "boolean") {
          var bool = Boolean(value);
          
          this.component.setState(this.name, bool);
          return false;
        }
        
        return true;
      }
    } else if (dateType) {
      this.condition = function(value) {
        var date;
        
        if (jSh.type(value) !== "date") {
          date = new Date(value);
        } else {
          date = value;
        }
        
        if (isNaN(date.getTime()))
          return false;
        
        this.component.setState(this.name, date);
        return true;
      }
    } else { // Default string type
      this.condition = function(value) {
        if (jSh.type(value) !== "string") {
          this.component.setState(this.name, value + "");
          
          return false;
        }
        
        return true;
      }
    }
  }
  
  jSh.inherit(settings.Setting, lcComponent);
  
  function onSettChange() {
    settings.triggerEvent("settingChange", {setting: this.name, value: this.stateStatus});
    this.component.triggerEvent(this.name, {value: this.stateStatus});
  }
  
  settings.addEvent("settingChange");
  
  settings.manifest = function(defSettings) {
    function scan(group, userGroup, path) {
      Object.getOwnPropertyNames(group).forEach(function(name) {
        var sett = group[name];
        var userValue;
        var thisPath = (path ? path.concat([name]) : null) || [name];
        
        if (typeof sett === "object") {
          if (sett instanceof settings.Setting && !sett.name) {
            sett.name = name;
            
            sett.userGroup = userGroup;
            sett.functions = [];
            
            userGroup.addEvent(name);
            userGroup.events[name].listeners = sett.functions;
            
            // Check if the value was set here before
            if (userGroup[name] !== undf)
              userValue = userGroup[name];
            
            userGroup.setState(name, sett.defValue);
            var settObj = userGroup.states[name];
            
            userGroup.addStateListener(name, onSettChange.bind(settObj));
            userGroup.addStateCondition(name, sett.condition);
            
            userGroup._settings.push(name);
            
            // Attempt to set it's initial value
            if (userValue !== undf)
              lateSettings.push([thisPath.join("."), userValue]);
          } else if (!(sett instanceof settings.Setting)) {
            var subGroup = userGroup[name];
            
            if (!(subGroup instanceof lces.type())) {
              subGroup = subGroup ? jSh.extendObj(new lces.new(), subGroup) : lces.new();
              
              userGroup[name] = subGroup;
              userGroup._groups.push(name);
              
              subGroup._settings = [];
              subGroup._groups   = [];
            }
            
            scan(sett, subGroup, thisPath);
          }
        }
      });
    }
    
    // Remove current settings
    // TODO: Removing the settings shouldn't be necessary
    if (defSettings && !settings.default)
      settings.user = new lcComponent();
    
    // Scan and check all settings
    scan(defSettings || settings.default || {}, userSettings);
  }
  
  settings.settObtain = function(path, user) {
    var groupPath = path.split(".");
    var settName  = groupPath.pop();
    
    var group = settings.groupObtain(groupPath.join("."), !user);
    var setting;
    
    if (!group)
      return undf;
    
    setting = group[settName];
    
    // Verify the setting object
    if (!(setting instanceof settings.Setting) && !user)
      setting = "lces.user.settings.get - " + path + " failed";
    
    // Check for errors during obtaining phase
    if (typeof setting === "string" && !user) {
      console.error("LCES User Module ERROR: " + setting);
      
      return false;
    }
    
    return setting;
  }
  
  settings.groupObtain = function(path, getDefault) {
    if (jSh.type(settings.default) !== "object" || typeof path !== "string")
      return false;
    
    path = path.split(".");
    
    var curGroup = getDefault ? settings.default : settings.user;
    var group;
    
    for (var i=0,l=path.length; i<l; i++) {
      var obj = curGroup[path[i]];
      
      if (!obj) {
        group = path.join(".") + " failed, no such group '" + path[i] + "'";
        
        break;
      } else {
        if (obj instanceof settings.Setting) {
          group = path.join(".") + " failed, '" + path[i] + "' " + (i + 1) + " is a setting and not a group";
          
          break;
        } else if (jSh.type(obj) !== "object") {
          group = path.join(".") + " failed, '" + path[i] + "' is " + jSh.type(obj);
          
          break;
        }
        
        curGroup = obj;
      }
    }
    
    // Check for errors during obtaining phase
    if (typeof group === "string") {
      console.error("LCES User Module ERROR: " + group);
      
      return false;
    } else {
      group = curGroup;
    }
    
    return group;
  }
  
  settings.set = function(path, value, recurring) {
    var groupPath = path.split(".");
    var settName  = groupPath.pop();
    
    var setting = settings.settObtain(path);
    
    // Check if setting exists
    if (!setting) {
      return false;
    } else {
      setting.userGroup.setState(settName, value, recurring);
    }
    
    return true;
  }
  
  settings.get = function(path) {
    return settings.settObtain(path, true);
  }
  
  settings.getDetails = function(path) {
    var setting = settings.settObtain(path);
    
    return setting ? {
      path: path,
      type: setting.settType,
      name: setting.settName,
      value: settings.settObtain(path, true),
      formalName: setting.settName,
      formalMultiple: setting.formalMultiple,
      multipleValues: setting.multipleValues ? setting.multipleValues.map(a => a[0]) : null,
      currentIndex: setting.currentIndex,
      defValue: setting.defValue,
      min: setting.min,
      max: setting.max
    } : null;
  }
  
  // LCES on event method
  settings._on = settings.on;
  var preloadEvents = [];
  
  settings.on = function() {
    var path;
    var callback;
    var first;
    
    jSh.toArr(arguments).forEach(function(arg) {
      if (typeof arg === "string" && !path)
        path = arg;
      else if (typeof arg === "function" && !callback)
        callback = arg;
      else if (first === undf && typeof arg === "boolean")
        first = arg;
    });
    
    if (!callback)
      return false;
    
    if (!path) {
      settings._on("settingChange", callback);
      
      return true;
    }
    
    var setting = settings.settObtain(path);
    
    if (!setting)
      return false;
    
    if (first && path)
      callback({value: settings.settObtain(path, true)});
    
    setting.functions.push(callback);
    return true;
  }
  
  settings.clearLate = function() {
    var late = lateSettings.slice();
    lateSettings = [];
    
    for (var i=0,l=late.length; i<l; i++) {
      settings.set(late[i][0], late[i][1]);
    }
  }
  
  // Default settings, the template/base for any user settings
  settings.setState("default", null);
  
  // Settings from user as based off of default.
  var userSettings = {
    _settings: [],
    _groups: []
  };
  
  // Setting values that are initialized late
  var lateSettings = [];
  
  settings.setState("user", null);
  settings.states["user"].get = function() {
    var plainSettings = {};
    
    function scan(obj, newObj) {
      var objSettings = obj._settings;
      var objGroups   = obj._groups;
      
      // Loop settings
      for (var i=0,l=objSettings.length; i<l; i++) {
        var settName = objSettings[i];
        
        newObj[settName] = obj[settName];
      }
      
      // Loop groups
      for (var i=0,l=objGroups.length; i<l; i++) {
        var groupName = objGroups[i];
        
        newObj[groupName] = {};
        
        scan(obj[groupName], newObj[groupName]);
      }
      
      return newObj;
    }
    
    return scan(userSettings, plainSettings);
  };
  
  // Add new settings
  settings.addStateListener("default", settings.manifest);
  
  settings.addStateCondition("default", function(newDef) {
    if (jSh.type(newDef) !== "object" || newDef.constructor !== Object)
      return false;
    else
      return true;
  });
  
  settings.addStateListener("user", function(sett) {
    if (jSh.type(sett) !== "object" || sett.constructor !== Object) // Only pure object allowed for user settings
      return;
    
    jSh.mergeObj(userSettings, sett, true);
  });
  
  window.sett = settings;
}
