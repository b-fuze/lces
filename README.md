# LCES
LCES, the Linked Component Event System, is a Javascript library that features custom styled elements with a sophisticated state system, a templating system, dynamicText for dynamicly updating content what/wherever it may be, and more.



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



## Getting started

In LCES you have two things, a component and it's states. A component's just a thing, and it can be anything, a car, box, cat, elephant, anything you want it to be. It's states are properties that linked with listeners and invoke them on every little change. Let's start with a cat, then add a sleeping state.

```javascript
var cat = new lcComponent();

cat.setState("sleeping", null);
cat.addStateListener("sleeping", function(value) {
  console.log("The cat is" + (value ? " " : "n't ") + "sleeping :3");
});

cat.sleeping = true;  // > The cat is sleeping.
cat.sleeping = false; // > The cat isn't sleeping.
```

