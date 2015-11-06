lces.rc[12] = function() {
  // CSS compiler code
  window.addEventListener("load", function() {
    var cssInput  = lces("css-input");
    var cssOutput = lces("css-output");
    
    var compileBtn  = lces("compile-btn");
    var clearBtn    = lces("clear-btn");
    var btnControl  = lces("compile-btn-ctrl");
    var compileChk  = lces("css-compile-chkbox");
    var colorizeChk = lces("css-colorize");
    var colorize    = lces("css-color");
    
    // Disable buttons if no input
    cssInput.addEventListener("input", function() {
      btnControl.disabled = this.value === "";
    });
    
    compileBtn.addEventListener("click", function() {
      var css = cssInput.value;
      
      if (compileChk.checked) {
        css = css.replace(/([\w\-]+)\s*:\s*/g,"$1:");
        css = css.replace(/\/\*(?:[^](?!\*\/))*[^]\*\//g, "");
        css = css.replace(/\n\s*/g, "");
        css = css.replace(/([^])\s*,\s*/g, "$1,");
        css = css.replace(/([^])\s*{/g, "$1{");
        css = css.replace(/\{\s*([^])/g, "{$1");
      }
      
      if (colorizeChk.checked)
        css = lces.css.colorize(css, colorize.value[0], colorize.value[1], colorize.value[2]);
      
      cssOutput.value = css.trim();
      
      compileBtn.text = "Reprocess";
    });
    
    clearBtn.addEventListener("click", function() {
      cssInput.value = "";
      
      btnControl.disabled = true;
    });
    
    cssOutput.addEventListener("click", function() {
      cssOutput.select();
    });
    
    // End
    btnControl.disabled = true;
  });
}
