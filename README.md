# LCES
LCES, the Linked Component Event System, is a Javascript library that features custom styled elements with a sophisticated state system, a templating system, dynamicText for dynamically updating content no matter what/where it may be, and more.

## Including LCES in your project

Add the following code to your page:

```javascript
// A quick little utility for loading a bunch of js/css files at once
function loadAll(k){function l(b){var a=document.createElement("script");a.async=true;a.type="text/javascript";a.onload=function(){d.push(b);g()};e.appendChild(a);a.src=b;return a}function m(b){var a=document.createElement("link");a.rel="stylesheet";a.type="text/css";a.onload=function(){d.push(b);g()};e.appendChild(a);a.href=b;return a}function g(){d.length===c.length&&f&&f()}var e=document.getElementsByTagName("head")[0];var d=[],h=[],c=Array.prototype.slice.call(arguments).slice(1),f;"function"===typeof c[c.length-1]&&(f=c.pop());switch(k){case "js":c.forEach(function(b){h.push(l(b))});break;case "css":c.forEach(function(b){h.push(m(b))})}};

// LCES main function that holds everything & LCES rc for the init sequence
function lces(lcesname) {
  return LCES.components[lcesname];
}

lces.rc = [];
lces.loadedDeps = false;

loadAll("js",
  "https://b-fuze.github.io/lces/main-js/lces-min/lces.min.current.js",
  // Can add more JS files to load here
  function() {
    // This callback is called when all the previously listed js files are loaded
    // lces.rc will hold each LCES component in their correct init order
    lces.rc.forEach(function(i) {i();});
    lces.loadedDeps = true;
    
    // If your code runs after the page is loaded, you won't need this event listener
    window.addEventListener("load", function() {
      lces.init(); // Start LCES
      
      // LCES is loaded, now do magic :D
    });
  }
);

```

## LCES Widget

The main reason for all this to begin with was DOM manipulation. I wanted an easier way to make elements and manipulate their states/properties.

**lcWidget** is a component tailored for that purpose:

```javascript
var widget = new lcWidget(element); // If no element provided, will create a <div> by default

widget.element; // The real DOM element

// Set innerHTML
widget.html = "<h1>Cat News Daily</h1>";

// Set textContent (Isn't parsed like innerHTML)
widget.text = "Cat News Daily";

// Append widget to <body>
widget.parent = document.body; 

// Remove widget from <body>
widget.parent = null;

// Append other elements
widget.append(element, element2, element3); // Can append more than one element at a time
// Or
widget.append(childArray);

widget.remove(element, element2, element3);
// Or
widget.remove(childArray);

widget.children; // Array of childNodes

// Setting CSS styles, does not change any other properties
widget.style = {
  margin:  4,
  color:   "red",
  opacity: 0.5
}

// widget.classList is the same as widget.element.classList()
widget.classList.add("cat-news");

// Set attribute
widget.setAttr("attribute", "value");

// Remove attribute, can take multiple attributes
widget.removeAttr("attribute1", "attribute2", "attribute3");
```

...is the basic functionality of **lcWidget**, and from it is derived many other components.

## LCES Widget in HTML Markup

You can set elements in your HTML markup to be widgets of a specific type via the `lces-widget` or `type` attribute for `<lces-widget>` tags when the page loads, if you leave it empty LCES will determine the type by itself.

```HTML
<div lces-widget="widget" lces-name="litter-box">Dirty stuff to change here</div>

Will just be a normal widget...

<input type="checkbox" lces-widget lces-name="kitty-check" />

Will default to a checkbox type widget.

And the following tag is used for more complicated widgets, it uses type instead of lces-widget to set the type

<lces-widget type="window" name="cat-window">
  ...
</lces-widget>
```

They'll be rendered into their respective forms after `lces.init();` sets things up for you to manipulate them in JS afterwards:

```javascript
var litterBox  = lces("litter-box");
var kittyCheck = lces("kitty-check");
var catWindow  = lces("cat-window");

litterBox.text = "All clean!";
kittyCheck.checked = true;
catWindow.visible = true;
```


## lcWidget Derived Components

A component is just a building block, and it can be used to build many other components. Here are some default components included with LCES:

### new lcTextField([Input Element]);

*HTML:*
```HTML
<input type="text" lces-widget lces-name="text-input" />
```

*Javascript:*
```javascript
var input = new lcTextField(); 
```

### lcTextField Properties

 * #### input.value
   
   An LCES state. Returns the input value, and assigning will change it. 

### lcTextField Methods

 * #### input.focus();
   
 * #### input.blur();

`new lcTextArea([Textarea Element])` functions the same way

### new lcNumberField([Input Element]);

*HTML:*
```HTML
<input type="text" lces-widget="numberfield" lces-name="date-input" lces-digits="2" lces-min="1" lces-max="31" placeholder="DD" value=""/>
```

*Javascript:*
```javascript
var numField = new lcNumberField();
```

### lcNumberField Properties

 * #### numField.value
  
  LCES state. Number.

 * #### numField.min
   
   LCES state. Number.

 * #### numField.max
   
   LCES state. Number.

 * #### numField.digits
   
   LCES state. Number.

 * #### numField.integer
   
   LCES state. Boolean. If false, won't accept any decimal values.

 * #### numField.decimalPoints
   
   LCES state. Number.

### new lcFileInput([Input Element]);

*HTML:*
```HTML
<input type="file" lces-widget lces-name="file-input" />
```

*Javascript:*
```javascript
var file = new lcFileInput();
```

 * #### file.upload(url, keys, progress, readystatechange);
   **url** - String. Upload url
   
   **keys** - Optional. Either array of input elements (lcWidget wrappers allowed), or normal key-value object to be included in the request. If omitted, substitute with any falsy value to use the following arguments.
   
   **progress** - Optional. Callback for [`progress events`](https://developer.mozilla.org/en/docs/Web/API/ProgressEvent). If omitted, substitute with any falsy value.
   
   **readystatechange** - Optional. Callback for [`readystatechange events`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/onreadystatechange).

### new lcCheckBox([Input Element]);

*HTML:*
```HTML
Optimized: <input type="checkbox" checked="checked" lces-widget lces-name="optimized-chkbox"/>
```

*Javascript:*
```javascript
var chkBox = new lcCheckBox();
```
### lcCheckBox Properties

 * #### chkBox.checked
   
   LCES State. Boolean.


### new lcDropDown([Select Element]);

*HTML:*
```HTML
<select lces-widget lces-name="package-select">
  <option value="free">Free</option>
  <option value="Premium">Premium</option>
  <option value="Business">Business</option>
</select>
```
*Javascript:*
```javascript
var dropDown = new lcDropDown();
```

 * #### dropDown.addOption(value, content);

   **value** - Either a `number` or `string`.
   
   **content** - Either a `string`, `DOMNode`, or `lcWidget`.

 * #### dropDown.removeOption(option);
   
   **option** - Either an index (zero indexed), `DOMNode`, or `lcWidget`.

### new lcTable([Table Element]);

*HTML:*
```HTML
<table lces-widget lces-name="score-table">
  <thead>
    <th>Name</th>
    <th>Grade</th>
    <th>Score</th>
  </thead>
  <tbody>
    <tr>
      <td>Bobby</td>
      <td>11th Grade</td>
      <td>72%</td>
    </tr>
    <tr>
      <td>Mark</td>
      <td>12th Grade</td>
      <td>87%</td>
    </tr>
  </tbody>
</table>
```

*Javascript:*
```javascript
var table = new lcTable();
```

 * #### table.setHeadings(headings);
  **headings** - Array of headings, each indice will take one column, and can either be a `string`, `DOMNode`, or `lcWidget`.

 * #### table.addHeading(heading);
   **heading** - Either a `string`, `DOMNode`, or `lcWidget`.

 * #### table.removeHeading(heading);
   **heading** - Either an index (zero indexed), `DOMNode`, or `lcWidget`.

 * #### table.addRow(content);
   **content** - Array of row columns, each indice will take one column, and can either be a `string`, `DOMNode`, or `lcWidget`.

 * #### table.removeRow(row);
   **row** - Either an index (zero indexed), `DOMNode`, or `lcWidget`.

 * #### table.insertBeforeRow(content, row);
   **content** - Array of row columns, each indice will take one column, and can either be a `string`, `DOMNode`, or `lcWidget`.
   
   **row** - Either an index (zero indexed), `DOMNode`, or `lcWidget`.

### new lcAccordion([Reference Element]);

Creates an accordion with expandable sections.

*HTML:*
```HTML
<lces-widget type="accordion" name="new-accordion" section-height="150" max-open="1" closeable>
  <lces-section>
    <lces-title>Section title</lces-title>
      Section content goes here
  </lces-section>
</lces-widget>
```

*Javascript:*
```javascript
var accordion = new lcAccordion();
```

### lcAccordion Properties

 * #### accordion.sectionHeight
   
   Number. Section open height in pixels

 * #### accordion.sectionsCloseable
   
   Boolean. If true, clicking section titles will toggle them opening or closing

 * #### accordion.maxOpen
   
   LCES state. Number. Maximum sections tht can be opened at a time.

### lcAccordion Methods

 * #### accordion.addSection(title, content);
   
   **title** - Either a `string`, `DOMNode`, `lcWidget`, or array of the latter two.
   
   **content** - Either a `string`, `DOMNode`, `lcWidget`, or array of the latter two.

### new lcColorChooser([Reference Element]);

*HTML:*
```HTML
<lces-widget type="colorchooser" name="color-chooser" color="rgb(128, 0, 112)"></lces-widget>
```

The attribute `color` is optional.

*Javascript:*
```javascript
var color = new lcColorChooser();
```

 * #### color.value
   
   LCES state. Array of three numerical 0-255 values representing RGB in that order respectively.

### new lcSlider([Reference Element]);

*HTML:*
```HTML
<lces-widget type="slider" name="slider" min="0" max="100" prefix="$" suffix="%" hide-value="false"></lces-widget>
```

The attributes `min`, `max`, `prefix`, `suffix`, and `hide-value` are optional.

*Javascript:*
```javascript
var slider = new lcSlider();
```

### Slider Properties

 * #### slider.min
   
   LCES state. Number. Minimum value for the slider

 * #### slider.max
   
   LCES state. Number. Maximum value for the slider

 * #### slider.hideValue
   
   LCES state. Boolean. If true, will hide the value on the slider

### new lcWindow([Reference Element]);

*HTML:*
```HTML
<lces-widget type="window" name="aucp-animeupdates" lces-visible="false" width="500" height="300" centered title-visible="false" buttonpanel-visible="true">
  <lces-title>Window Title</lces-title>
  
  <lces-contents>
    <!-- The contents of the window -->
  </lces-contents>
  
  <lces-buttons>
          <button onclick="lces('').visible">Close</button>
  </lces-buttons>
</lces-widget>
```

All the attributes are optional except for `type="window"`, the title and buttonpanel are visible by default, even if empty.
`<lces-contents>` is the only required tag in the window widget.

```javascript
var win = new lcWindow();
```

### Window properties

 * #### win.title
    
   String. The windows title's InnerHTML.

 * #### win.visible
    
   Boolean. The window's visibility.

 * #### win.titleVisible
    
   Boolean. The title's visibility.

 * #### win.buttonPanelVisible
    
   Boolean. The button panel's visibility.

 * #### win.centered
    
   Boolean. If true the window will always be centered in the viewport.

 * #### win.draggable
    
   Boolean. If true the window will be draggable from it's title. Only works when win.centered is false.

 * #### win.width
    
   Number. The windows innercontent (NOT the window itself) container's overall width.

 * #### win.height
    
   Number. The windows innercontent (NOT the window itself) container's overall height.

All the listed properties are LCES states.


### Window methods

* #### win.addButton(text, click);
    
   **text** String. The button's text.
   
   **click** Function. Function invoked on click.
   
   *Returns* lcWidget wrapped button element.

* #### win.removeButton(button);
    
   **button** lcWidget wrapper for the button.
   
   *Returns* Nothing.


## Why I made LCES

LCES (pronounced "Elsis") was originally created to solve a problem that I had with OOP programming in Javascript, the separation of simple properties and their mutation methods. For example, if you have a square object with a `width` property, but that `width` property cannot be changed without invoking a separate `setWidth` method: 

```javascript
// To get the width
var width = square.width; // or square.getWidth() if you will

// Use a separate method to change it
square.setWidth(width + 2);
```


This has a few problems, the first being that `width` and `setWidth()` are two separate things, so if you wanted to add another property, `height` for example, you would make a `height` property AND a `setHeight()` method. Sometimes this is OK, but for simple straightforward properties it can get annoying. And if other things are manipulating them then things can get really hectic.

LCES solves this problem by introducing this construct called **states**, similar to normal properties:

```javascript
// Firstly it combine the two previous procedures into one.
square.width += 2;

// Another problem it solves is that you can know WHEN the width state changes
square.addStateListener("width", function(newValue) {
  console.log("Hey, width just changed! It's " + newValue);
});
```

So in essence, LCES is a sophisticated getter/setter system.


## Getting Started with LCES Core

LCES has two things, a component and it's states. A component can be anything, a car, box, cat, elephant, anything you want it to be. It's states are properties that are linked with **listeners** that are invoked on every little change. Let's make a cat component, then add a hungry state:

```javascript
var cat = lces.new();

cat.setState("hungry", false);
cat.addStateListener("hungry", function(value) {
  console.log("The cat is" + (value ? " " : "n't ") + "hungry :O");
});

// Whenever you need to change the cat's hunger
cat.hungry = true;  // > The cat is hungry :O
cat.hungry = false; // > The cat isn't hungry :O

// Whenever you need to know if the cat's hungry
var hungryKitty = cat.hungry;
```

Making custom component constructors is just like making any other constructor:

```Javascript
function Cat(name) {
  lces.types.component.call(this); // Make an LCES component
  
  this.name = name; // Simple Object property
  var that  = this;
  
  this.setState("hungry", false); // LCES state
  this.addStateListener("hungry", function(value) {
    console.log(that.name + " is" + (value ? " " : "n't ") + "hungry :O");
  });
}

// jSh (jShorts) is a separate library that LCES depends on
jSh.inherit(Cat, lces.types.component); // To inherit prototype chain

var kitty = new Cat("Socks");

kitty.hungry = true; // > Socks is hungry
```


## LCES Component Namespace

LCES components have their own namespace, a unique ID of sorts referenced with the `lces(name)` function. New components don't have a name, so you can set it in Javascript:
```javascript
cat.LCESName = "unique-kitty"; // Set the name

// Get the component
var cat = lces("unique-kitty");
```

And in HTML:

```HTML
<div lces-widget lces-name="litter-box">Dirty stuff to change here</div>
```

A component constructor can be used to create components to be instanced like ordinary constructors, you can also change the prototype after inheriting from another LCES component with `jSh.inherit()` (See jSh below)


## LCES Group Component

More documation here soon

## jSh (jShorts2)

jSh (jShorts2) is a library created to shorten normal coding procedures, like selecting and creating elements, extending objects, checking real object types, and so on.

### jSh(selector | element);

 * **selector** - String. Returns elements located with `selector`.
 
 * **element** - Element node

*Example:*
```HTML
<div id="pet-store">
  <div class="pets" id="cats">
    Kitties
    <div class="details">
      3 Available
    </div>
  </div>
  <div class="pets" id="dogs">
    Puppies
    <div class="details">
      5 Available
    </div>
  </div>
  <div class="pets" id="fish">
    Fishies
    <div class="details">
      1 Available
    </div>
  </div>
</div>
```

`jSh()` is chainable, as it adds a `.jSh()` method to it's returned elements:

```javascript
jSh("#pet-store")        // <div id="pet-store" ...
jSh(".pets")             // [<div class="pets"...,  <div class="pets"..., ...]
jSh("div")               // [<div ...,  <div ..., <div ..., ...]
jSh("#cats").textContent // "Kitties 3 Available" *

// Chaining jSh()
jSh("#pet-store").jSh(".details")              // [<div class="details"...,  <div class="details"..., ...]
jSh("#fish").jSh(".details")[0].textContent    // "1 Available" *
jSh(".pets")[1].jSh(".details")[0].textContent // "5 Available" *
```
\* textContent will most likely contain redundant whitespace which I didn't show for simplified illustrative purposes. A nice way to clean it up could be: `jSh(".details")[0].textContent.trim().replace(/\s+/g, " ");`

Calling `jSh()` with an element as an argument simply adds a `.jSh()` method and returns the element:

```javascript
jSh(document.body).jSh(".pets")[0] // <div class="pets" id="cats"...
```


### 1 - jSh.d(idAndClass, content, child, attributes, properties, events);

Returns a `DOMNode` <div> element created with the arguments provided. Aims to be similar to normal HTML markup nesting.

*All of the arguments may be omitted by substituting undf (undefined) in their place*

 * **idAndClass** - A string that contains the id and classname.

   Valid formats are:
    * `"#id.class"`
    * `"#id.class.class.class"` - No limit on class count
    * `"#id"`
    * `".class.class"`

 * **content** - The textContent of the element. To make it innerHTML instead use the `ih()` function:
```javascript
jSh.d(..., ih("<img src=\"url.com\"/>"), ...);
```

 * **child** - Either a `DOMNode` or array of `DOMNodes`

 * **attributes** - Object with properties and their values for the element's attributes.

 * **properties** - Object with properties to be mapped the to the element created.

### 2 - jSh.d(options);

 * **Options** - Optional. Object containing alternative properties for all the arguments above.

Format:
```javascript
var options = {
  "class":  IdAndClass,
  "text":   TextContentOrInnerHTML,
  "child":  ChildOrArray,
  "attr":   Attributes,
  "prop":   Properties,
  "events": Events
};
```

#### Example
```javascript
// Method 1 - Ordered arguments
var div = jSh.d("#id.class1.class2", ih("<br/> Some innerHTML..."), [
  jSh.d(undf, "And TextContent here..."),
  jSh.d(".avatar", undf, jSh.c("img", undf, undf, undf, undf, {src: "http://somesite.com/image.png"})),
  jSh.d(),
  jSh.c("br"),
  jSh.d(undf, ih("<b>It all works.</b>"))
]);

// Method 2 - Using options object
var div = jSh.d({
  class: "#id.class1.class2",
  text: ih("<br/> Some innerHTML..."),
  child: [
    jSh.d({text: "And TextContent here..."}),
    jSh.d({class: ".avatar", child: jSh.c("img", {prop: {src: "http://somesite.com/image.png"}})}),
    ...
  ]
});

// You could use whatever method you want, mixing the two for profit, your choice.
```

### jSh.c(tagName, args...);

 * **tagName** - String. Name of the element's tag name, like `img`, `div`, `button`, and so forth.

 * **args** - Optional. The same arguments as `jSh.d()`.

### jSh.svg(idAndClass, width, height, path);

Creates an SVG element with it's paths that is normally a pain to achieve.

 * **idAndClass** - Id or class with the same format as `jSh.d();`

 * **width** - Width of SVG in pixels

 * **height** - Height of SVG in pixels

 * **path** - Either one path or array of paths created with `jSh.path();`

### jSh.path(idAndClass, points, style);

 * **idAndClass** - Id or class with the same format as `jSh.d();`

 * **points** - SVG points, see example.

 * **style** - Style attribute. See example.

#### Example
```javascript
// Create a simple triangle (Used in lcAccordion)
jSh.svg(".svg-triangle", 15, 15, [
  jSh.path(undf, "M3.8 1.9L3.8 7.5 3.8 13.1 7.5 10.3 11.3 7.5 7.5 4.7 3.8 1.9z", "fill: #000;")
])
```

### jSh.extendObj(extended, extension);

Copies the own properties from `extension` to `extended`.

 * **extended** - Object to be extended.

 * **extension** - Object with own properties to be copied to the extended.

#### Example
```javascript
jSh.extendObj(lces.types, {
  "dropdown": lcDropDown,
  "checkbox": lcCheckBox,
  "textfield": lcTextField
});

// Is the same as

lces.types["dropdown"] = lcDropDown;
lces.types["checkbox"] = lcCheckBox;
lces.types["textfield"] = lcTextField;
```

### jSh.toArr(arraylikeobject);

Converts any array-like object into an array. e.g. `Element.childNodes`, the function scope `arguments` object, `strings`, and more.

 * **arraylikeobject** - Any array-like data.

#### Example
```javascript
jSh.toArr(arguments).forEach(function(argument) {
  // Do whatever
});
```

### jSh.type(data);

Returns the correct type of `data`, e.g. `"null"` for `null` instead of `"object"` etc. 

 * **data** - Anything.

### jSh.nChars(string, n);

Returns `string` multiplied `n` times.

 * **string** - String. String to be multiplied.

 * **n** - Number. Number of times to multiply string.
