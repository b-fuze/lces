# LCES
LCES, the Linked Component Event System, is a Javascript library that features custom styled elements with a sophisticated state system, a templating system, dynamicText for dynamicly updating content what/wherever it may be, and more.



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

Is the basic functonality of lcWidget, and from it is derived many other components.

## LCES Widget in HTML Markup

You can set elements in your HTML markup to be widgets of a specific type via the `lces-widget` or `type` attribute when the page loads, if you leave it empty LCES will determine the type by itself.

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

They'll be rendered into their respective forms `lces.init();` is invoked for you to manipulate them in JS afterwards:

```javascript
var litterBox  = lces("litter-box");
var kittyCheck = lces("kitty-check");
var catWindow  = lces("cat-window");

litterBox.text = "All clean!";
kittyCheck.checked = true;
catWindow.visible = true;
```


## lcWidget Derived Components

A component is just a building block, and it's used to build many other components. Here are some default components included with LCES.

### new lcTextField([Input Element]);

*HTML:*
```HTML
Name: <input type="text" lces-widget lces-name="name-input" />
```

*Javascript:*
```javascript
var input = new lcTextField(); 
```

### lcTextField Properties

#### input.value

An LCES state. Returns the input value, and assigning will change it. 

### lcTextField Methods

#### input.focus();

#### input.blur();

`lcTextArea` functions the same way

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

#### numField.min

LCES state. Number.

#### numField.max

LCES state. Number.

#### numField.digits

LCES state. Number.

#### numField.integer

LCES state. Boolean. If false, won't accept any decimal values.

#### numField.decimalPoints

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

#### file.upload(url, keys, progress, readystatechange);
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

#### chkBox.checked

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

#### dropDown.addOption(value, content);

**value** - Either a `number` or `string`.

**content** - Either a `string`, `DOMNode`, or `lcWidget`.

#### dropDown.removeOption(option);

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

#### table.setHeadings(headings);
**headings** - Array of headings, each indice will take one column, and can either be a `string`, `DOMNode`, or `lcWidget`.

#### table.addHeading(heading);
**heading** - Either a `string`, `DOMNode`, or `lcWidget`.

#### table.removeHeading(heading);
**heading** - Either an index (zero indexed), `DOMNode`, or `lcWidget`.

#### table.addRow(content);
**content** - Array of row columns, each indice will take one column, and can either be a `string`, `DOMNode`, or `lcWidget`.

#### table.removeRow(row);
**row** - Either an index (zero indexed), `DOMNode`, or `lcWidget`.

#### table.insertBeforeRow(content, row);
**content** - Array of row columns, each indice will take one column, and can either be a `string`, `DOMNode`, or `lcWidget`.

**row** - Either an index (zero indexed), `DOMNode`, or `lcWidget`.



## Why I made LCES

LCES (pronounced "Elsis") was originally created to solve a problem that I had with OOP programming in Javascript, the seperation of simple properties and their mutation methods. For example, if you have a square object with a `width` property, but that `width` property cannot be changed without invoking a seperate `setWidth` method: 

```javascript
// To get the width
var width = square.width; // or square.getWidth() if you will

// Use a seperate method to change it
square.setWidth(width + 2);
```


This has a few problems, the first being that `width` and `setWidth()` are two seperate things, so if you wanted to add another property, `height` for example, you would make a `height` property AND a `setHeight()` method. Sometimes this is OK, but for simple straigtforward properties it can get annoying. And if other things are manipulating them then things can get really hectic.

LCES solves this problem by introducing this construct called **states**, similar to normal properties:

```javascript
// Firstly it combine the two previous procedures into one.
square.width += 2;

// Another problem it solves is that you can know WHEN the width state changes
square.addStateListener("width", function(newValue) {
  console.log("Hey, width just changed! It's " + newValue);
});
```

So in essence, LCES is a getter/setter system with extra features.


## Getting Started with LCES Core

LCES has two things, a component and it's states. A component can be anything, a car, box, cat, elephant, anything you want it to be. It's states are properties that are linked with listeners that are invoked on every little change. Let's make with a cat component, then add a hungry state:

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

Making custom component constructors is just like making any other constructor:

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

More documation here soon
