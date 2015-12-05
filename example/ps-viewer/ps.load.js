function loadAll(k){function l(b){var a=document.createElement("script");a.async=true;a.type="text/javascript";a.onload=function(){d.push(b);g()};e.appendChild(a);a.src=b;return a}function m(b){var a=document.createElement("link");a.rel="stylesheet";a.type="text/css";a.onload=function(){d.push(b);g()};e.appendChild(a);a.href=b;return a}function g(){d.length===c.length&&f&&f()}var e=document.getElementsByTagName("head")[0];var d=[],h=[],c=Array.prototype.slice.call(arguments).slice(1),f;"function"===typeof c[c.length-1]&&(f=c.pop());switch(k){case "js":c.forEach(function(b){h.push(l(b))});break;case "css":c.forEach(function(b){h.push(m(b))})}};
var lces = function(lcesname){return LCES.components[lcesname];}
lces.rc  = [];

// Prevent default LCES themify colorize
// lces.appendColorize = false;

var titleText = "PS Viewer - ";
var basePath  = "198/";
var pattern   = "ps$1.png";
var max = 19;

// Load deps
loadAll("js",
  "http://b-fuze.github.io/lces/main-js/lces-min/lces.min.current.js",
  function() {
    lces.rc.forEach(function(i) {i();});
    
    window.addEventListener("load", function() {
      lces.init(); // Load LCES
      
      // Page manager
      var pageMgr = new lcComponent();
      pageMgr.setState("page", 0);
      
      // Buttons & main
      var main  = lces("lc-main");
      var prev  = lces("prev-btn");
      var next  = lces("next-btn");
      prev.ctrl = lces("prev-ctrl");
      next.ctrl = lces("next-ctrl");
      
      // Increment for each button
      prev.incr = -1;
      next.incr = 1;
      
      // Event fired for every page change
      pageMgr.addStateListener("page", function(page) {
        if (page === 1) {
          prev.ctrl.disabled = true;
        } else {
          prev.ctrl.disabled = false;
        }
        
        if (page === max) {
          next.ctrl.disabled = true;
        } else {
          next.ctrl.disabled = false;
        }
        
        var padding = "00";
        var number  = page - 1;
        
        // Set the <img>'s new src via main's imageSrc state
        main.imageSrc = basePath + pattern.replace("$1", padding.substr((number + "").length) + number);
        main.currentPage = "Page " + number;
        
        jSh("title")[0].innerHTML = titleText + "page " + number;
      });
      
      // Callback for button clicks to change the page manager's page
      function btnClick() {
        pageMgr.page += this.component.incr;
      }
      
      prev.addEventListener("click", btnClick);
      next.addEventListener("click", btnClick);
      
      // Go to initial page 0
      pageMgr.page = 1;
      
      // Prevent memory bloat - Not required at all, copied and pasted from AUC, but good to keep nonetheless
      lces.noReference = true;
      // Colorize UI
      lces.themify.colorize(191, 0, 0);
    });
  }
);
