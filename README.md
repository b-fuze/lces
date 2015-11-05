# LCES
LCES, the Linked Component Event System, is a Javascript library that features custom styled elements with a sophisticated state system, a templating system, dynamicText for dynamicly updating content what/wherever it may be, and more.

If you want to see all the lcWidget components see lcWidget Derived Components


## Why I made LCES

LCES (pronounced "Elsis") was originally created to solve a problem that I had with OOP programming, the seperation of simple properties and their mutation methods. For example, if you have a square object with a `width` property, but that `width` property cannot be changed without invoking a seperate `setWidth` method: 

```javascript
// To get the width
var width = square.width; // square.getWidth() if you will

// Use a seperate method to change it
square.setWidth(width + 2);
```


This has a few problems, the first being that `width` and `setWidth()` are two seperate things, so if you wanted to add another property, height for example, you would make a `height` AND a `setHeight()`. In some instances, this is perfectly OK, but for simple straigtforward properties that don't require a bunch of redundant methods, it can get annoying. And since you're dependant on both, if other things are manipulating them then things can get hectic.

LCES solves this problem by introducing this construct that I call states to enable the following:

```javascript
// Firstly it combine the two previous procedures into one.
square.width += 2;

// Another problem it solves is that you can know WHEN the width state changes
square.addStateChange("width", function(newValue) {
  console.log("Hey, width just changed! It's " + newValue);
});
```

So in essence, LCES is a getter/setter system with extra features.


## Getting Started with LCES Core

In LCES you have two things, a component and it's states. A component is just a thing, and it can be anything, a car, box, cat, elephant, anything you want it to be. It's states are properties that are linked with listeners and invoke them on every little change. Let's start with a cat, then add a sleeping state.

```javascript
var cat = new lcComponent();

cat.setState("hungry", false);
cat.addStateListener("hungry", function(value) {
  console.log("The cat is" + (value ? " " : "n't ") + "hungry :O");
});

cat.hungry = true;  // > The cat is hungry :O
cat.hungry = false; // > The cat isn't hungry :O

// Whenever you need to know if the cat's hungry
var hungryKitty = cat.hungry;
```

Making your own component constructor is just like making any other constructor:

```Javascript
function Cat(name) {
  lcComponent.call(this); // Make an LCES component
  
  this.name = name; // Simple Object property
  
  this.setState("hungry", false); // LCES state
  this.addStateListener("hungry", function(hungry) {
    console.log("The cat is" + (value ? " " : "n't ") + "hungry :O");
  });
}

// jSh (jShorts) is a seperate library that LCES depends on
jSh.inherit(Cat, lcComponent); // To inherit prototype chain

var kitty = new Cat("Socks");

kitty.hungry = true; // Same as before
```


### LCES Component Namespace

LCES components have their namespace, a unique ID of sorts that you can reference with the `lces(name)` function. Components can not share a name. When you make a component it doesn't have an name, so you can set it in Javascript:
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
widget.appendChild(element, element2, element3); // Can append more than one element at a time
// Or
widget.appendChild(childArray);

widget.children; // Array of childNodes

// Setting CSS styles, does not change any other properties
widget.style = {
  margin: 4,
  color: "red",
  opacity: 0.5
}

// widget.classList is the same as widget.element.classList()
widget.classList.add("cat-news");

// Set attribute
widget.setAttr("attribute", "value");

// Remove attribute, can take multiple attributes
widget.removeAttr("attribute1", "attribute2", "attribute3");
```

Is most of the the basic functonality provided in lcWidget, and with I have derived many other helpful components.

## LCES Widget in HTML Markup

You can set elements in your HTML markup to be widgets when the page loads: 

```HTML
<div lces-widget lces-name="litter-box">Dirty stuff to change here</div>

And the following tag is used for more complicated widgets

<lces-widget type="window" name="cat-window">
  ...
</lces-widget>
```

They'll be rendered into their respective forms when you invoke `lces.init();` for you to manipulate them in JS afterwards:

```javascript
var litterBox = lces("litter-box");
var catWindow = lces("cat-window");

litterBox.text = "All clean!";
catWindow.visible = true;
```

### lcGroup

More documation here soon

###
