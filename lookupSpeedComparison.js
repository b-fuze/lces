var largeObj  = {};
var largeArr  = [];
var findItem  = 750000;
var findItemW = -750000;
var found     = 0;

// ADDING

console.time("add-to-obj");
for (let i=0; i<1000000; i++) {
  largeObj["item" + i] = 1;
}
console.timeEnd("add-to-obj");

console.time("add-to-arr");
for (let i=0; i<1000000; i++) {
  largeArr.push("item" + i);
}
console.timeEnd("add-to-arr");

// FINDING VALID
console.time("find-valid-obj");
if (largeObj["item" + findItem])
  found++;
console.timeEnd("find-valid-obj");

console.time("find-valid-arr");
if (largeArr.indexOf("item" + findItem) !== -1)
  found++;
console.timeEnd("find-valid-arr");

// FINDING INVALID
console.time("find-noexist-obj");
if (largeObj["item" + findItemW])
  found++;
console.timeEnd("find-noexist-obj");

console.time("find-noexist-arr");
if (largeArr.indexOf("item" + findItemW) !== -1)
  found++;
console.timeEnd("find-noexist-arr");
