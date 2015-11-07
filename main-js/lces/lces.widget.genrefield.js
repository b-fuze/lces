
lces.rc[9] = function() {
  // =======================================================
  //             MAIN GENRE INTERFACE CONSTRUCTOR
  // =======================================================

  lces.ui.tagEditor = {};

  window.lcGenreGroup = function(mainElement) {
    lcGroup.call(this);
    var that = this;
    
    
    // Necessities for DOM relationships
    this.element = mainElement;
    
    this.addStateListener("parent", function(parent) {
      if (parent instanceof Node && parent.nodeType === Node.ELEMENT_NODE)
        parent.appendChild(mainElement);
    });
    
    
    // Some important things
    this.genreEdit  = null;
    this.genreList  = null;
    this.genreArray = null;
    
    // Interfacing Properties
    this.setState("string", "");
    this.states["string"].get = function() {
      var parent   = that.genreEdit.element.getChild(0);
      var genreArr = jSh.toArr(parent.childNodes).map(function(i) {if (i.nodeType !== Node.ELEMENT_NODE || !i.component) return ""; return i.component.value;}).filter(function(i) {return i != "";});
      var string   = genreArr.join(", ");
      
      return genreArr.length ? string : "";
    }
    
    this.addStateListener("string", function(s) {
      var parent = that.genreList.element.getChild(-1);
      var parent2 = that.genreEdit.element.getChild(0);
      that.genreArray.forEach(function(i) {parent.appendChild(i); i.component.genreToggled = false;});
      
      if (!s || s.trim() === "") {
        // throw Error("WHY. THE. HELL?!!: " + s); // Fixed I believe, but may still be prone to errors, will leave as is.
        
        that.genreEdit.noGenres = true;
        return;
      }
      
      var genres = s.toLowerCase().split(/\s*,\s*/g);
      
      if (genres.length >= 1 && that.genreEdit.noGenres) {
        parent2.innerHTML = "";
        that.genreEdit.noGenres = false;
      }
      
      // We might not get any genres
      var appendedGenres = 0;
      
      genres.forEach(function(i) {
        if (that.genreArray[i  + "genre"]) {
          parent2.appendChild(that.genreArray[i  + "genre"]);
          that.genreArray[i  + "genre"].component.genreToggled = true;
          
          appendedGenres += 1;
        }
      });
      
      if (!appendedGenres)
        that.genreEdit.noGenres = true;
    });
    
    // External interface function for value updates
    // Can be changed externally
    this.onchange = function() {
      // Replace function with anything
    }
    
    this._onchange = function(newValue) {
      if (newValue)
        return false;
      
      if (typeof this.onchange === "function")
        this.onchange();
    }
  }

  jSh.inherit(lcGenreGroup, lcGroup);



  // =======================================================
  //              lcGenreField() FUNCTION START
  // =======================================================


  window.lcGenreField = function(mainElement) {
    // Now the Genres, might get a little messy in here.
    if (!lces.ui.tagEditor.closeSVG) {
      lces.ui.tagEditor.closeSVG = jSh.svg(".genreremovesvg", 8, 8, [
        jSh.path(".genreremovecolor", "M1.7 0 0 1.7 2.3 4 0 6.3 1.7 8 4 5.7 6.3 8 8 6.3 5.7 4 8 1.7 6.3 0 4 2.3 1.7 0z")
      ]);
      // lces.ui.tagEditor.closeSVG = jSh.c("ns:svg:http://www.w3.org/2000/svg", undf, undf,
      //   jSh.c("ns:path:http://www.w3.org/2000/svg", "cp-color", undf, undf, {
      //     "ns:d:": "M1.7 0 0 1.7 2.3 4 0 6.3 1.7 8 4 5.7 6.3 8 8 6.3 5.7 4 8 1.7 6.3 0 4 2.3 1.7 0z",
      //     "class": "genreremovecolor"
      //   }), { // Attributes
      //   "version": "1.1",
      //   "width": 8,
      //   "height": 8,
      //   "class": "genreremovesvg"
      // });
    }
    
    // Make or retrieve the main element
    mainElement = mainElement || jSh.d("genres-edit", undf, [
      jSh.c("span", {class: "black", attr: {"no-select": ""}}),
      
      // Add Genre dummy genre
      jSh.d({class: "genre-item", attr: {"new-genre": ""}, child: [
        jSh.c("span", undf, ih("&nbsp;+ Add Genre&nbsp;")),
        jSh.c("span", undf, ih("&nbsp;+ Add Genre&nbsp;")),
        
        jSh.d("", undf, lces.ui.tagEditor.closeSVG.cloneNode(true)),
        jSh.c("section")
      ]}),
      
      // Genre popup selection box
      jSh.d("genre-list", undf, [
        jSh.c("input", {class: "genre-search", prop: {type: "text", placeholder: "Search Genres"}}),
        
        jSh.d("genre-dropcatcher", undf, [
          jSh.c("span", undf, "REMOVE GENRE"),
          jSh.d()
        ]),
        jSh.d({class: "genre-select", attr: {"no-select": ""}})
      ])
    ]);
    
    
    
    // =======================================================
    //             INITIALIZING GENRE INSTANCE
    // =======================================================
    
    
    // Array that contains all physical genres
    var genreArray = [];
    // Main genre interface for foreign exchange
    var genreGroup = new lcGenreGroup(mainElement);
    genreGroup.genreArray = genreArray;
    // window.genreGroup = genreGroup; // FIXME: FOR DEBUGGING PURPOSES ONLY
    
    var genreEdit = new lcWidget(mainElement);
    genreGroup.genreEdit = genreEdit;
    // genreEdit.LCESName = "ui-genre-edit";
    
    var genreList = new lcWidget(genreEdit.element.getChild(-1));
    genreGroup.genreList = genreList;
    var genreSearch = new lcTextField(mainElement.jSh(".genre-search")[0]);
    
    
    genreEdit.setState("editing", false);
    genreEdit.addStateListener("editing", function(editing) {
      if (editing) {
        genreList.visible = true;
      } else {
        genreList.visible = false;
      }
    });
    
    // Init cleanup
    genreGroup.hardLinkStates("value", "string");
    
    
    // Add pretty fade effect for genreList
    
    onTransitionEnd(genreList.element, function(e) {
      if (e.propertyName == "opacity" && getComputedStyle(this)["opacity"] == 0)
        this.style.display = "none";
    });
    genreList.addStateListener("visible", function(visible) {
      if (visible) {
        genreList.style.display = "block";
    
        setTimeout(function() {
          genreList.style.opacity = 1;
        }, 0);
      } else
        genreList.style.opacity = 0;
    });
    
    
    
    
    // =======================================================
    //               GENRE DnD EVENT HANDLERS
    // =======================================================
    
    
    var dragGenreSrc = null;
    
    function genreDragStart(e) {
      this.style.opacity = '0.5';  // this / e.target is the source node.
      
      dragGenreSrc = this;
      
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/html", "<span>genredroppinglikeaboss</span>");
      
      setTimeout(function() {
        genreEdit.element.setAttribute("dragging", "");
      }, 100);
    }
    
    function genreDragOver(e) {
      if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
      }

      e.dataTransfer.dropEffect = 'move';

      return false;
    }
    
    function genreDragEnter(e) {
      // this / e.target is the current hover target.
      if (dragGenreSrc !== this.genre && !this.genre.component && this !== genreDropCatcher ) {
        this.genre.setAttribute("dragover", "");
        
      } else if (dragGenreSrc !== this.genre) {
        if (this === genreDropCatcher && dragGenreSrc.component.genreToggled)
          return this.genre.setAttribute("dragover", "") ? true : true;
        
        if (this !== genreDropCatcher) {
          if (this.genre.component.genreToggled)
            return this.genre.setAttribute("dragover", "") ? true : true;
        }
      }
    }
    
    function genreDragLeave(e) {
      this.genre.removeAttribute("dragover");  // this / e.target is previous target element.
    }
    
    function genreDrop(e) {
      if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
      }
      
      if (dragGenreSrc !== this.genre && e.dataTransfer.getData("text/html") == "<span>genredroppinglikeaboss</span>") {
        function dropGenre() {
          if (this !== genreDropCatcher) {
            if (this === newGenre)
              genreSelectedContainer.appendChild(dragGenreSrc);
            else
              genreSelectedContainer.insertBefore(dragGenreSrc, this.genre);
            dragGenreSrc.component.genreToggled = true;
          } else {
            genreList.element.getChild(-1).appendChild(dragGenreSrc);
            dragGenreSrc.component.genreToggled = false;
          }
        }
        
        
        if (dragGenreSrc !== this.genre) {
          if (this === genreDropCatcher && dragGenreSrc.component.genreToggled)
            return dropGenre.call(this) + genreList.sort() + genreSearch.element.focus() ? true : true; // I'm really lazy, I know.
          
          if (this !== genreDropCatcher) {
            if (this === newGenre || this.genre.component.genreToggled) {
              dropGenre.call(this);
              if (!lces.ui.mobile)
                genreSearch.element.focus();
              return true;
            }
          }
        }
      }
      
      
      
      return false;
    }
    
    function genreDragEnd(e) {
      genreArray.forEach(function(i) {
        i.removeAttribute("dragover", "");
      });
      newGenre.genre.removeAttribute("dragover", "");
      
      
      this.removeAttribute("style");
      setTimeout(function() {
        genreEdit.element.removeAttribute("dragging");
      }, 100);
    }
    
    
    // Reference Selected Genres container
    var genreSelectedContainer = genreEdit.element.getChild(0);
    
    
    // Reference NewGenre Dummy item
    var newGenre = genreEdit.element.getChild(1).getChild(-1);
    newGenre.genre = newGenre.parentNode;
    
    // Reference Genre Garbage Collector
    var genreDropCatcher = genreList.element.getChild(1);
    genreDropCatcher.genre = genreDropCatcher;
    
    // Add DnD events
    [genreDropCatcher, newGenre].forEach(function(i) {
      i.addEventListener('dragenter', genreDragEnter, false);
      i.addEventListener('dragover', genreDragOver, false);
      i.addEventListener('dragleave', genreDragLeave, false);
      i.addEventListener('dragdrop', genreDrop, false);
      i.addEventListener('drop', genreDrop, false);
    });
    
    
    
    
    // =======================================================
    //             GENRE CREATION/REMOVAL METHODS
    // =======================================================
    
    
    var genres = AUCE.data.genres;
    var removeSVG = lces.ui.tagEditor.closeSVG;
    
    genreGroup.addGenre = function(genreName, value) {
      // Make our genre element with all it's children
      var genre = new lcWidget(jSh.d("genre-item", undf, [
        jSh.c("span", undf, genreName), // Genre name container
        jSh.d(undf, undf, removeSVG.cloneNode(true)), // SVG Close Button
        jSh.c("aside", undf, ","),      // Comma separator
        jSh.c("section")                // Dropcatcher to handle all drops
      ], undf, {draggable: true}));
      
      var genreValue = ((value !== undf ? value : genreName) + "").toLowerCase();
      
      // Append new genre
      genreArray.push(genre.element);
      genreArray[genreValue + "genre"] = genre.element;
      
      genre.string = genreName;
      genre.value  = genreValue;
      genre.element.string = genre.string;
      genre.element.value  = genreValue;
      
      genre.setState("genreToggled", false);
      
      
      genre.parent = genreList.element.getChild(-1);
      
      
      
      // Add genre DnD events
      genre.addEventListener('dragstart', genreDragStart, false);
      genre.addEventListener('dragend', genreDragEnd, false);
      
      
      // Add click event
      genre.element.addEventListener("click", function(e) {
        var target = e.target || e.srcElement;
        
        
        if (target === genre.element.getChild(1) || jSh.isDescendant(target, genre.element.getChild(1))) {
          genreList.element.getChild(-1).appendChild(this);
          this.component.genreToggled = false;
          genreList.sort();
          
        } else if (!genre.genreToggled) {
          genreEdit.element.getChild(0).appendChild(this);
          genre.genreToggled = true;
        }
        
        if (!lces.ui.mobile)
          genreSearch.element.focus();
      });
      
      
      // Drop catcher to prevent bad/unreliable DnD behaviour
      var dropCatcher = genre.element.getChild(-1);
      dropCatcher.genre = genre.element;
      dropCatcher.addEventListener('dragenter', genreDragEnter, false);
      dropCatcher.addEventListener('dragover', genreDragOver, false);
      dropCatcher.addEventListener('dragleave', genreDragLeave, false);
      dropCatcher.addEventListener('dragdrop', genreDrop, false);
      dropCatcher.addEventListener('drop', genreDrop, false);
      
      // Make it disabled by default
      genre.genreToggled = false;
    }
    
    genreGroup.removeGenre = function(source) {
      var genre = determineType(source);
      
      if (!genre)
        return false;
      
      genreArray.splice(genreArray.indexOf(genre), 1);
      genreArray[genre.string.toLowerCase() + "genre"] = undf;
      
      genre.component.parent.removeChild(genre);
    }
    
    function determineType(source) {
      if (!source)
        return null;
      
      if (jSh.type(source) === "string") {
        return genreArray[source.toLowerCase() + "genre"];
        
      } else if (source.states && source.states["genreToggled"]) {
        return source.element;
        
      } else if (source.component && source.component.states["genreToggled"]) {
        return source;
        
      } else {
        return null;
      }
    }
    
    // =======================================================
    //            GENRE LIST SORTING, ETC. METHODS
    // =======================================================
    
    
    // Setup GenreList Methods
    genreList.sort = function() {
      var sortedGenres = [];
      var parent = this.element.getChild(-1);
      
      jSh.toArr(parent.childNodes).forEach(function(i) {
        if (i.nodeType === Node.ELEMENT_NODE) {
          sortedGenres[i.component.string] = i;
          sortedGenres.push(i.component.string);
          parent.removeChild(i);
        }
      });
      
      sortedGenres.sort(function(a, b) {
        return a < b ? -1 : 1;
      });
      
      sortedGenres.forEach(function(genre) {
        parent.appendChild(sortedGenres[genre]);
      });
    }
    
    // Tidy up everything beforehand
    genreList.sort();
    
    
    
    // =======================================================
    //                  GENRE SEARCH FUNCTION
    // =======================================================
    
    
    // Now for search Function
    var destArray = [];
    var secondArray = [];
    var arrayMap = [];
    
    function regExSanitize(s) {
      return s.replace(/(\\|\[|\]|\||\{|\}|\(|\)|\^|\$|\:|\.|\?|\+|\*|\-|\!|\=)/g, "\\$1");
    }
    
    function onGenreSearch(s) {
      var parent   = genreList.element.getChild(-1);
      var children = jSh.toArr(parent.childNodes).filter(function(i) {return i.nodeType === Node.ELEMENT_NODE;});
      
      arrayMap = children.map(function(i) {i.passedSearch = false; i.style.display = "none"; parent.removeChild(i); return i;});
      arrayMap.forEach(function(i) {arrayMap[i.string] = i;});
      
      
      destArray   = [];
      secondArray = [];
      
      var firstRegex  = new RegExp("^" + regExSanitize(s), "i");
      var secondRegex = new RegExp(regExSanitize(s), "ig");
      
      
      children.forEach(function(i) {
        if (s.trim() === "")
          return i.removeAttribute("style");
        
        if (firstRegex.test(i.string)) {
          i.passedSearch = true;
          return destArray.push(i.string);
        }
        
        if (secondRegex.test(i.string)) {
          i.passedSearch = true;
          return secondArray.push(i.string);
        }
      });
      
      if (s.trim() === "") {
        children.forEach(function(i) {
          if (!i.passedSearch)
            parent.appendChild(i);
        });
        
        return genreList.sort();
      }
      
      destArray.sort(function(a, b) {
        return a < b ? -1 : 1;
      });
      
      secondArray.sort(function(a, b) {
        return a < b ? -1 : 1;
      });
      
      destArray.forEach(function(i) {
        i = arrayMap[i];
        
        
        parent.appendChild(i);
        i.removeAttribute("style");
      });
      
      secondArray.forEach(function(i) {
        i = arrayMap[i];
        
        parent.appendChild(i);
        i.removeAttribute("style");
      })
      
      children.forEach(function(i) {
        if (!i.passedSearch)
          parent.appendChild(i);
      });
    }
    
    // Remove default LCES styling
    genreSearch.classList.remove("lces");
    
    
    genreSearch.addEventListener("keyup", function(e) {
      var target = destArray[0] || secondArray[0];
      if (this.value.trim() !== "" && e.keyCode === 13 && target) {
        genreSelectedContainer.appendChild(arrayMap[target]);
        arrayMap[target].component.genreToggled = true;
        this.value = "";
        
        onGenreSearch(this.value);
      } else
        onGenreSearch(this.value);
    });
    
    // Add Genre dummy item fade in/out animation
    var addGenreDisplay = newGenre.parentNode.getChild(0);
    var curAddGenreInnerHTML = addGenreDisplay.innerHTML;
    addGenreDisplay.innerHTML = "";
    
    onTransitionEnd(newGenre.parentNode, function(e) {
      if (e.propertyName === "opacity" && getComputedStyle(this)["opacity"] == 0) {
        addGenreDisplay.innerHTML = "";
      }
    });
    
    
    
    
    // =======================================================
    //            MAIN GENREEDIT EVENT HANDLERS
    // =======================================================
    
    
    // Add genreEdit focus event handlers, etc.
    
    genreEdit.addStateListener("noGenres", function(state) {
      if (state) {
        genreEdit.element.setAttribute("no-genres", "");
        
        genreSelectedContainer.innerHTML = "<div class=\"genre-item dummy\" ><span><i>(No Genres)</i></span></div>&nbsp;&nbsp;&nbsp;";
        
        if (getComputedStyle(newGenre.parentNode)["opacity"] == 0)
          genreSelectedContainer.getChild(0).removeAttribute("style");
        
      } else {
        genreEdit.element.removeAttribute("no-genres");
      }
    });
    
    
    genreEdit.addStateListener("editing", function(editing) {
      if (editing) {
        if (genreEdit.noGenres)
          genreSelectedContainer.innerHTML = "";
        genreEdit.noGenres = false;
        
        genreEditIcon.element.removeAttribute("visible");
        
        addGenreDisplay.innerHTML = curAddGenreInnerHTML;
        
        genreList.style.display = "block";
        
        setTimeout(function() {
          genreEdit.classList.add("editing");
        }, 0);
        
        if (!lces.ui.mobile)
          genreSearch.element.focus();
        
      } else {
        genreEdit.classList.remove("editing");
        
        genreSearch.element.blur();
        
        
        if (!genreSelectedContainer.getChild(0)) {
          var newValue = genreGroup.string === genreGroup.states["string"].stateStatus;
          
          genreEdit.noGenres = true;
          genreGroup.string = "";
          genreGroup._onchange(newValue);
          
        } else {
          var newValue = genreGroup.string === genreGroup.states["string"].stateStatus;
          
          genreEdit.noGenres = false;
          genreGroup.string = genreGroup.string;
          genreGroup._onchange(newValue);
        }
      }
    });
    
    genreSearch.element.component = genreEdit;
    lces.focus.addMember(genreEdit);
    genreEdit.addStateListener("focused", function(focused) {
      genreEdit.editing = focused;
    });
    
    onTransitionEnd(genreList.element, function(e) {
      if (e.propertyName == "opacity" && getComputedStyle(this)["opacity"] == 0) {
        this.style.display = "none";
      }
    });
    
    
    // 'Edit This' icon
    var genreEditIcon = jSh(".editpropertysvg")[0] ? new lcWidget(jSh.d("editpropertyicon", undf, jSh(".editpropertysvg")[0].cloneNode())) : new lcWidget();
    
    genreEdit.element.insertBefore(genreEditIcon.element, genreList.element);
    genreEditIcon.style = {
      position: "relative",
      left: "-5px"
    }
    
    // Events
    
    genreEdit.addEventListener("mouseover", function(e) {
      if (!genreEdit.editing)
        genreEditIcon.element.setAttribute("visible", "");
    });
    genreEdit.addEventListener("mouseout", function(e) {
      genreEditIcon.element.removeAttribute("visible");
    });
    
    if (!genreSelectedContainer.getChild(0))
      genreEdit.noGenres = true;
    
    
    // End
    return genreGroup;
  };
}
