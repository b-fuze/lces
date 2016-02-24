// LCES User module core
lces.rc[10] = function() {
  var jSh     = lces.global.jSh;
  // var lces    = window.lces;
  var Object  = lces.global.Object;
  var Boolean = lces.global.Boolean;
  
  var lcComponent = lces.global.lcComponent;
  
  // Create user module
  lces.user = new lcComponent();
  
  // LCES User module settings feature
  lces.user.settings = new lcComponent();
  var settings = lces.user.settings;
  
  // Setting entry constructor
  settings.Setting = function Setting(name, types, defValue, multiple) {
    // Check if not initialized
    if (this === lces.global || this === settings)
      return new Setting(name, types, defValue, multiple);
    
    this.type = "LCES User Setting Entry";
    
    this.name     = null; // Will be set during the manifest scan
    this.settName = name;
    
    this.defValue     = defValue;
    this.settType     = null;
    this.settMultiple = jSh.type(multiple) === "array" && multiple.length > 1 && multiple.indexOf(defValue) !== -1;
    
    // Check the types for the setting type
    types = typeof types === "string" ? types.toLowerCase() : "";
    
    var numType  = types.indexOf("number") !== -1;
    var boolType = types.indexOf("boolean") !== -1;
    var dateType = types.indexOf("date") !== -1;
    var strType  = (!numType || !boolType || !dateType) || types.indexOf("string") !== -1;
    
    // Extra modifiers
    // var range = // Extra fun stuff here, etc.
    
    if (!types) {
      this.settType = "string";
    } else {
      if (numType)
        this.settType = "number";
      else if (boolType)
        this.settType = "boolean";
      else if (dateType)
        this.settType = "date";
      else
        this.settType = "string";
    }
    
    // Decided to repeat to relieve engine of redundant if condition checking and smaller functions
    if (numType) {
      this.condition = function(value) {
        if (jSh.type(value) !== "number") {
          var pi = parseFloat(value);
          
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
          
          if (isNaN(date.getTime()))
            return false;
          
          this.component.setState(this.name, date);
        } else {
          date = value;
          
          if (isNaN(date.getTime()))
            return false;
        }
        
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
    function scan(group, userGroup) {
      Object.getOwnPropertyNames(group).forEach(function(name) {
        var sett = group[name];
        
        if (typeof sett === "object") {
          if (sett instanceof settings.Setting && !sett.name) {
            sett.name = name;
            
            sett.userGroup = userGroup;
            sett.functions = [];
            
            userGroup.addEvent(name);
            userGroup.events[name].listeners = sett.functions;
            
            userGroup.setState(name, sett.defValue);
            userGroup.addStateListener(name, onSettChange.bind(userGroup.states[name]));
            userGroup.addStateCondition(name, sett.condition);
            
            userGroup._settings.push(name);
          } else {
            var newGroup = new lcComponent();
            
            userGroup[name] = newGroup;
            userGroup._groups.push(name);
            
            newGroup._settings = [];
            newGroup._groups   = [];
            
            scan(sett, newGroup);
          }
        }
      });
    }
    
    // Remove current settings
    settings.user = new lcComponent();
    
    // Scan and check all settings
    scan(defSettings, userSettings);
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
  
  // LCES on event method
  settings._on = settings.on;
  
  settings.on = function() {
    var path;
    var callback;
    
    jSh.toArr(arguments).forEach(function(arg) {
      if (typeof arg === "string" && !path)
        path = arg;
      else if (typeof arg === "function" && !callback)
        callback = arg;
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
    
    setting.functions.push(callback);
    return true;
  }
  
  // Default settings, the template/base for any user settings
  settings.setState("default", null);
  
  // Settings from user as based off of default.
  var userSettings = {
    _settings: [],
    _groups: []
  };
  
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
}