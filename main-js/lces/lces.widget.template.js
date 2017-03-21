// LCES Templating System
lces.rc[4] = function() {
  lces.template = function template(options) {
    if (!options)
      throw Error("lces.template() requires one options object as the first argument");
    
    if (!options.render)
      throw Error("lces.template(options) options object must contain a MockupElement as a render property");
    
    if (!(options.render instanceof jSh.MockupElement))
      throw Error("Element provided does not implement the jSh.MockupElement interface");
    
    return template.build(options);
  }
  
  // Template add initiation function method
  lces.template.addInit = function(func) {
    if (typeof func === "function")
      this.__initFuncs.push(func);
  }
  
  // Template remove initiation function method
  lces.template.removeInit = function(func) {
    var index = this.__initFuncs.indexOf(func);
    
    if (index !== -1)
      this.__initFuncs.splice(index, 1);
  }
  
  lces.template.tokenTypes = {
    GROUP: 0, // Parens
    REFERENCE: 1, // Variable reference
    PRIMITIVE: 2, // String or number
    MODIFIER: 3, // Addition, subtraction, etc
    COMPARISON: 4, // Equality or greater/less than
    BOOLEAN: 5 // Logical operators: && or ||
  };
  
  lces.template.expressionLexer = function(source, options) {
    var tokenTypes = lces.template.tokenTypes;
    
    var mainTokens = [];
    var tokens     = mainTokens;
    
    mainTokens.map   = {};
    mainTokens.depth = [];
    mainTokens.refs  = [];
    
    var isIdentifierStart = /[a-zA-Z_$]/;
    var isIdentifier      = /[a-zA-Z_\d\.\s$]/;
    var isNumberStart     = /\d/;
    var isNumber          = /[\d\.]/;
    var isCondOperator    = /[=<>!]/;
    var isGLTOperator     = /[><]/; // Greater/Less Than
    var isBoolOperator    = /[&|]/;
    var isMutOperator     = /[*\-+\/%]/;
    var isUnaryOperator   = /[!-]/;
    var isStringStart     = /["']/;
    
    var char = "";
    var curGroup = null;
    var curToken = null;
    var curTokenContent = null;
    var inString = false;
    var strQuote = '"';
    var inIdentifier = false;
    var finishIdentifierName = false;
    var negated = false;
    var negatedLogical = false;
    
    function getLastTokenType() {
      var lastToken = tokens[tokens.length - 1];
      
      return (lastToken || {}).type;
    }
    
    function checkValidValueToken(type, i) {
      var lastToken = tokens[tokens.length - 1];
      
      if (lastToken instanceof Object) {
        var lastTokenType = lastToken.type;
        
        // Confirm valid token order
        switch (lastTokenType) {
          case tokenTypes.PRIMITIVE:
          case tokenTypes.GROUP:
          case tokenTypes.REFERENCE:
            throw new SyntaxError("LCES Template Expression: Unexpected " + type + " at col " + i);
            break;
        }
      }
    }
    
    function checkValidOperatorToken(type, i) {
      var lastToken = tokens[tokens.length - 1];
      
      if (lastToken instanceof Object) {
        var lastTokenType = lastToken.type;
        
        // Confirm valid token order
        switch (lastTokenType) {
          case tokenTypes.MODIFIER:
          case tokenTypes.COMPARISON:
          case tokenTypes.BOOLEAN:
            throw new SyntaxError("LCES Template Expression: Unexpected " + type + " at col " + i);
            break;
        }
      } else {
        throw new SyntaxError("LCES Template Expression: Unexpected " + type + " at col " + i);
      }
    }
    
    // Token ID for reference purposes
    var curTokenID = 0;
    var curDepth   = -1;
    
    for (var i=0,l=source.length; i<l; i++) {
      char = source[i];
      
      if (!inString) {
        if (char === " ") {
          // Do nothing in whitespace
        } else if (isIdentifierStart.test(char)) {
          if (options.noReference)
            throw new SyntaxError("LCES Template Expression: Reference variables disabled in expression. At col " + i);
          
          checkValidValueToken("identifier", i);
          
          // Add identifier
          curToken = [];
          curTokenContent = "";
          finishIdentifierName = false;
          
          while (isIdentifier.test(char) && char) {
            if (char !== "." && char !== " ") {
              if (finishIdentifierName)
                throw new SyntaxError("LCES Template Expression: Unexpected token \"" + char + "\" at col " + i + " expected \".\"");
              
              inIdentifier = false;
              curTokenContent += char;
            } else if (char === " ") {
              finishIdentifierName = true;
              
              curToken.push(curTokenContent);
              curTokenContent = "";
            } else {
              if (!finishIdentifierName) {
                curToken.push(curTokenContent);
                curTokenContent = "";
              }
              
              inIdentifier = true;
              finishIdentifierName = false;
            }
            
            i++;
            char = source[i];
          }
          
          if (inIdentifier)
            throw new SyntaxError("LCES Template Expression: Unexpected token \"" + char + "\" at col " + i + " expected identifier");
          
          if (curTokenContent)
            curToken.push(curTokenContent);
          
          // `a.b` in `a.b.c`
          var lastIndex = curToken.length - 1;
          var ctxPath   = curToken.slice(0, lastIndex);
          var varName   = curToken[lastIndex];
          
          var newReference = {
            id: curTokenID,
            type: tokenTypes.REFERENCE,
            name: curToken,
            nameStr: curToken.join("."),
            varName: varName,
            context: ctxPath,
            contextStr: ctxPath.join("."),
            value: null,
            negated: negated,
            negatedLogical: negatedLogical
          };
          
          tokens.push(newReference);
          mainTokens.refs.push(newReference);
          curToken = null;
          curTokenContent = null;
          mainTokens.map[curTokenID] = newReference;
          
          curTokenID++;
          
          // Go back to previous char, since we're now on a char that's not
          // part of the identifier
          if (char)
            i--;
          
          negated = false;
        } else if (isNumberStart.test(char)) {
          if (options.noNumbers)
            throw new SyntaxError("LCES Template Expression: Number primitives disabled in expression. At col " + i);
          
          checkValidValueToken("number", i);
          
          curTokenContent = "";
          var passedDecimalPoint = false;
          var numbersAfterDecimal = false;
          
          while (isNumber.test(char)) {
            if (char === ".") {
              if (passedDecimalPoint) {
                throw new SyntaxError("LCES Template Expression: Unexpected token \"" + char + "\" at col " + i);
              } else {
                passedDecimalPoint = true;
              }
            } else if (passedDecimalPoint) {
              // Make sure no erronous trailing periods
              numbersAfterDecimal = true;
            }
            
            curTokenContent += char;
            
            i++;
            char = source[i];
          }
          
          if (passedDecimalPoint && !numbersAfterDecimal)
            throw new SyntaxError("LCES Template Expression: Unexpected token \"" + char + "\" at col " + i + " expected decimal numbers");
          
          var tokenValue = parseFloat(curTokenContent);
          
          if (negated) {
            tokenValue *= -1;
          }
          
          tokens.push({
            id: curTokenID,
            type: tokenTypes.PRIMITIVE,
            value: tokenValue
          });
          curToken = null;
          curTokenContent = null;
          
          curTokenID++;
          
          // Go back to previous char, since we're now on a char that's not
          // part of the number
          if (char)
            i--;
          
          negated = false;
        } else if (isStringStart.test(char)) {
          if (options.noStrings)
            throw new SyntaxError("LCES Template Expression: String primitives disabled in expression. At col " + i);
          
          checkValidValueToken("string", i);
          
          inString = true;
          strQuote = char;
          
          curToken = [];
          curTokenContent = "";
          negated = false;
        } else if (char === "(") {
          checkValidValueToken("open paren", i);
          
          curGroup = {
            id: curTokenID,
            type: tokenTypes.GROUP,
            value: [], // Tokens stored here
            negated: negated
          };
          
          mainTokens.map[curTokenID] = curGroup;
          curTokenID++;
          curDepth++;
          
          tokens.push(curGroup);
          curGroup.value.parent = tokens;
          
          // Add to depth array
          var curDepthArray = mainTokens.depth[curDepth];
          
          if (!curDepthArray) {
            curDepthArray = [];
            mainTokens.depth[curDepth] = curDepthArray;
          }
          
          curDepthArray.push(curGroup);
          
          tokens = curGroup.value;
          negated = false;
        } else if (char === ")") {
          checkValidOperatorToken("close paren", i); // Make sure no weird tokens ending it
          
          if (!tokens.parent || tokens.length === 1) {
            throw new SyntaxError("LCES Template Expression: Unexpected closing paren \"" + char + "\" at col " + i);
          } else {
            tokens = tokens.parent;
          }
          
          curDepth--;
        } else if (isUnaryOperator.test(char) &&
                  (getLastTokenType() === tokenTypes.MODIFIER ||
                   getLastTokenType() === tokenTypes.COMPARISON ||
                   getLastTokenType() === tokenTypes.BOOLEAN ||
                   curTokenID === 0)) {
          negated = true;
          negatedLogical = char === "!";
        } else if (isMutOperator.test(char)) {
          if (options.noArithmetic)
            throw new SyntaxError("LCES Template Expression: Arithmetic operators disabled in expression. At col " + i);
          
          checkValidOperatorToken(char, i);
          
          tokens.push({
            id: curTokenID,
            type: tokenTypes.MODIFIER,
            value: char
          });
          
          curTokenID++;
          
          curToken = null;
          curTokenContent = null;
        } else if (isCondOperator.test(char)) {
          if (options.noCompare)
            throw new SyntaxError("LCES Template Expression: Comparison operators disabled in expression. At col " + i);
          
          checkValidOperatorToken(char, i);
          
          var next   = source[i + 1];
          var curCol = i;
          
          if (isGLTOperator.test(char) && next === "=") {
            tokens.push({
              id: curTokenID,
              type: tokenTypes.COMPARISON,
              value: char + "=",
              col: curCol
            });
            
            i++;
          } else {
            var extraChars = "";
            
            if (char === "=" || char === "!") {
              var next  = source[i + 1];
              var next2 = source[i + 2];
              
              if (next !== "=")
                throw new SyntaxError("LCES Template Expression: Unexpected token \"" + next + "\" at col " + i + " expected \"=\"");
              
              if (next2 === "=") {
                extraChars += "=";
                i++;
              }
              
              extraChars += "=";
              i++;
            }
            
            tokens.push({
              id: curTokenID,
              type: tokenTypes.COMPARISON,
              value: char + extraChars,
              col: curCol
            });
          }
          
          curToken = null;
          curTokenContent = null;
          
          curTokenID++;
        } else if (isBoolOperator.test(char)) {
          checkValidOperatorToken(char, i);
          
          var next = source[i + 1];
          
          if (next !== char)
            throw new SyntaxError("LCES Template Expression: Unexpected token \"" + next + "\" at col " + i + " expected \"" + char + "\"");
          
          tokens.push({
            id: curTokenID,
            type: tokenTypes.BOOLEAN,
            value: char + char,
            col: curCol
          });
          
          curToken = null;
          curTokenContent = null;
          
          i += 1;
          curTokenID++;
        } else {
          throw new SyntaxError("LCES Template Expression: Illegal character \"" + char + "\" at col " + i);
        }
      } else {
        if (char === "\\") {
          // Skip over next char
          i += 1;
          
          curTokenContent += source[i];
        } else if (char === strQuote) {
          tokens.push({
            id: curTokenID,
            type: tokenTypes.PRIMITIVE,
            value: curTokenContent
          });
          
          curToken = null;
          curTokenContent = null;
          
          curTokenID++;
          inString = false;
        } else {
          curTokenContent += char;
        }
      }
    }
    
    if (tokens !== mainTokens) {
      throw new SyntaxError("LCES Template Expression: Unterminated parens in: `" + source + "`");
    } else if (inString) {
      throw new SyntaxError("LCES Template Expression: Unterminated string literal in: `" + source + "`");
    }
    
    checkValidOperatorToken("termination of input", i); // Make sure no weird tokens ending it
    
    return mainTokens;
  }
  
  lces.template.processTokens = function(tokens) {
    var tree  = [];
    var depth = tokens.depth;
    var tokenTypes = lces.template.tokenTypes;
    
    var currentTokens = null;
    var compareTree   = [];
    var compareMap    = {};
    
    compareTree.tokenMap   = tokens.map;
    compareTree.groupMap   = {};
    compareTree.references = []; // Variable references
    compareTree.rawValue   = false;
    
    var overallTokenCount = 0;
    
    // Check for comparisons
    for (var i=depth.length-1; i>=-1; i--) {
      var groupDepth = depth[i];
      var newDepth   = [];
      
      compareTree.push(newDepth);
      
      if (!groupDepth) {
        // i must be -1, Reached the first group, ground zero i.e. not in a parens anymore
        groupDepth = [{
          value: tokens
        }];
      }
      
      for (var j=groupDepth.length-1; j>=0; j--) {
        var group    = groupDepth[j];
        var gTokens  = group.value;
        var newGroup = {
          sides: [[[], []]],
          operator: [null],
          bool: [null], // && or ||
          value: 0, // During evaluation phases
          negated: group.negated
        };
        
        if ("id" in group) {
          newGroup.id = group.id;
          compareMap[group.id] = newGroup;
        } else {
          newGroup.id = "zero";
        }
        
        newDepth.push(newGroup);
        
        var curSides      = newGroup.sides[0];
        var curSidesIndex = 0;
        
        var lhs = curSides[0];
        var rhs = curSides[1];
        
        var onRightSide     = false;
        var compareOperator = null;
        
        for (var k=0,l=gTokens.length; k<l; k++) {
          var token         = gTokens[k];
          var tokenIsString = false;
          var tokenType     = token.type;
          var valueType     = typeof token.value;
          
          overallTokenCount++;
          
          if (tokenType === tokenTypes.BOOLEAN) {
            onRightSide = false;
            compareOperator = null;
            
            curSides = [[], []];
            newGroup.sides.push(curSides);
            newGroup.operator.push(null);
            newGroup.bool.push(null);
            newGroup.bool[curSidesIndex] = token.value;
            
            lhs = curSides[0];
            rhs = curSides[1];
            
            curSidesIndex++;
          } else if (tokenType === tokenTypes.COMPARISON) {
            if (onRightSide)
              throw new SyntaxError("LCES Template Expression: Unexpected token \"" + token.value + "\" at col " + token.col + ", multiple adjacent comparison operators aren't allowed");
            
            onRightSide     = true;
            compareOperator = token.value;
            newGroup.operator[curSidesIndex] = compareOperator;
          } else {
            switch (tokenType) {
              case tokenTypes.PRIMITIVE:
                if (valueType === "string")
                  tokenIsString = true;
                break;
              case tokenTypes.REFERENCE:
                compareTree.references.push(token);
                break;
            }
            
            if (onRightSide) {
              rhs.push(token);
              
              if (tokenIsString)
                rhs.string = true;
            } else {
              lhs.push(token);
              
              if (tokenIsString)
                lhs.string = true;
            }
          }
        }
      }
      
      newDepth.reverse();
    }
    
    var opRankArr = ["-", "+", "*", "%", "/"];
    function opRank(char) {
      return opRankArr.indexOf(char);
    }
    
    // Order and convert tokens to operations
    for (var i=0,l=compareTree.length; i<l; i++) {
      var curDepth = compareTree[i];
      
      for (var j=0,l2=curDepth.length; j<l2; j++) {
        var curGroup = curDepth[j];
        var sidesArr = curGroup.sides;
        
        for (var jj=0,ll=sidesArr.length; jj<ll; jj++) {
          var sides = sidesArr[jj];
          
          var lhs = [];
          var rhs = [];
          
          for (var k=0; k<sides.length; k++) {
            var side = sides[k];
            
            var add = [];
            var subtract = [];
            var special = []; // Multiplication, division, modulo...
            var lastOperation = "+";
            var oldLastOperation = lastOperation;
            var olderLastOperation = lastOperation;
            var oldLastMajorOperation = null;
            var oldLastMajorAdditive = true;
            var lastSign = 1;
            var lastSpecial = null;
            // var curSpecial = null; // FIXME: This might be useless
            var lastToken = null;
            var lastValueToken = null;
            var lastMergedSpecial = null;
            var swapNextToken = false; // Since the previous had a low value
            
            function determineGroup(op) {
              switch (op) {
                case "+":
                  return add;
                  break;
                case "-":
                  return subtract;
                  break;
                default:
                  return lastSpecial;
                  break;
              }
            }
            
            for (var ii=0,l3=side.length; ii<l3; ii++) {
              var token     = side[ii];
              var nextToken = side[ii + 1];
              
              switch (token.type) {
                case tokenTypes.GROUP:
                case tokenTypes.REFERENCE:
                case tokenTypes.PRIMITIVE:
                  switch (lastOperation) {
                    case "*":
                    case "/":
                    case "%": {
                      var higherOpValue = !nextToken || opRank(lastOperation) >= opRank(nextToken.value);
                      
                      if (!nextToken || higherOpValue) {
                        if (token.type === tokenTypes.PRIMITIVE)
                          lastSpecial.push(token.value);
                        else
                          lastSpecial.push({id: token.id, type: token.type, LCESValueType: true}); // Group or reference
                        
                        lastValueToken = null;
                      } else {
                        lastValueToken = token;
                        
                        if (!higherOpValue)
                          swapNextToken = true;
                      }
                      
                      break;
                    }
                    
                    case "+":
                    case "-": {
                      var array = lastOperation === "+" ? add : subtract;
                      
                      if (!nextToken || opRank(lastOperation) >= opRank(nextToken.value) || nextToken.value === "+") {
                        if (token.type === tokenTypes.PRIMITIVE)
                          array.push(token.value);
                        else
                          array.push({id: token.id, type: token.type, LCESValueType: true}); // Group or reference
                        
                        lastValueToken = null;
                      } else {
                        lastValueToken = token;
                      }
                      
                      break;
                    }
                    
                    default: {
                      lastValueToken = token;
                    }
                  }
                  
                  break;
                case tokenTypes.MODIFIER:
                  olderLastOperation = oldLastOperation;
                  oldLastOperation = lastOperation;
                  oldLastMajorOperation = special[special.length - 1];
                  lastOperation = token.value;
                  
                  switch (lastOperation) {
                    case "-": {
                      lastSign = -1;
                      oldLastMajorAdditive = true;
                      break;
                    }
                    
                    case "+": {
                      lastSign = 1;
                      oldLastMajorAdditive = true;
                      break;
                    }
                    
                    case "*":
                    case "/":
                    case "%": {
                      var prevOpHigher = opRank(oldLastOperation) > opRank(lastOperation);
                      var secondMergedWithLastSpecial = false;
                      
                      if ((lastOperation === oldLastOperation ||
                          prevOpHigher)) {
                        if (lastValueToken) {
                          var opGroup = determineGroup(oldLastOperation);
                          
                          if (lastValueToken.type === tokenTypes.PRIMITIVE)
                            opGroup.push(lastValueToken.value);
                          else
                            opGroup.push({id: lastValueToken.id, type: lastValueToken.type}); // Group or reference
                          
                          lastValueToken = null;
                        }
                        
                        if (prevOpHigher && lastOperation !== "+" && lastOperation !== "-") {
                          if (!oldLastMajorAdditive && oldLastOperation !== "+" && oldLastOperation !== "-" && oldLastMajorOperation && oldLastMajorOperation[0] === lastOperation) {
                            secondMergedWithLastSpecial = true;
                          } else {
                            var lastSpecial = [lastOperation, lastSign, lastSpecial];
                            var mergedWithLastSpecial = true;
                          }
                        } else {
                          var mergedWithLastSpecial = false;
                        }
                      } else {
                        var lastSpecial    = [lastOperation, lastSign];
                        var oldLastSpecial = special[special.length - 1];
                        
                        if (lastValueToken) {
                          if (lastValueToken.type === tokenTypes.PRIMITIVE)
                            lastSpecial.push(lastValueToken.value);
                          else
                            lastSpecial.push({id: lastValueToken.id, type: lastValueToken.type}); // Group or reference
                          lastValueToken = null;
                        }
                        
                        if (!oldLastMajorAdditive && oldLastSpecial) {
                          var oldLastSpecialOp = oldLastSpecial[0];
                          
                          if (opRank(oldLastSpecialOp) < opRank(lastOperation)) {
                            secondMergedWithLastSpecial = true;
                            oldLastSpecial.push(lastSpecial);
                          }
                        }
                        
                        var mergedWithLastSpecial = false;
                      }
                      
                      if (!secondMergedWithLastSpecial) {
                        if (mergedWithLastSpecial) {
                          special[special.length - 1] = lastSpecial;
                        } else if (lastOperation !== oldLastOperation) {
                          special.push(lastSpecial);
                        }
                      }
                      
                      oldLastMajorAdditive = false;
                      lastSign = 1; // Since any following operations will likely be merged with this one
                      break;
                    }
                  }
                  
                  break;
              }
              
              lastToken = token;
            }
            
            sides[k] = {
              add: add,
              subtract: subtract,
              special: special
            };
          }
        }
      }
    }
    
    if (overallTokenCount === 1 && compareTree.references.length)
      compareTree.rawValue = true;
    
    // compareTree.reverse(); // No need to reverse
    return compareTree;
  }
  
  // parseExpression(String expr[, Object options])
  //
  // expr: String: Non-empty string of expression
  // options: Optional. Object: Options to observe over the parsing phase
  //
  // Example `options`: (default values)
  //  {
  //    noStrings: false,
  //    noNumbers: false,
  //    noCompare: false, // Comparison operators: ===, !==, >, <, <=, etc
  //    noArithmetic: false,
  //    noReference: false
  //  }
  //
  // Description: Parses expressions whilst observing options provided (if any)
  //              and a structured tree that is fit evaluation in the Expression
  //              Evaluator. @see `lces.template.evaluateExpression()`
  lces.template.parseExpression = function(expr, options) {
    if (typeof expr !== "string" || !expr.trim())
      throw new Error("LCES Expression must be a valid non-empty string");
    
    // Parse and tokenize expression
    var tokens = lces.template.expressionLexer(expr, options || {});
    
    // Group and organize tokens in tree/operation order
    var compiledTokens = lces.template.processTokens(tokens);
    
    return compiledTokens;
  }
  
  // Return variable reference values from {context}, e.g. `a.b` in: a.b * 5
  function expressionLoadReferenceValue(reference, context, cache) {
    var ctxStr  = reference.contextStr;
    var varName = reference.varName;
    var negated = reference.negated;
    
    if (!ctxStr) {
      var value = context[varName];
      
      if (negated) {
        if (reference.negatedLogical) {
          return !value;
        } else {
          switch (typeof value) {
            case "number":
              return value * -1;
              break;
            default:
              return !value;
          }
        }
      } else {
        return value;
      }
    }
    
    var ctx      = reference.context;
    var path     = reference.name;
    var pathStr  = reference.nameStr;
    var cacheCtx = cache[ctxStr];
    
    if (cacheCtx) {
      return cacheCtx[varName];
    }
    
    var lastObject = context;
    
    for (var i=0,l=ctx.length; i<l; i++) {
      try {
        lastObject = lastObject[ctx];
      } catch (e) {
        throw new ReferenceError("LCES Expression Eval: Context object lacks sufficient depth");
      }
    }
    
    cache[ctxStr] = lastObject;
    var value = lastObject[varName];
    
    if (negated) {
      if (reference.negatedLogical) {
        return !value;
      } else {
        switch (typeof value) {
          case "number":
            return value * -1;
            break;
          default:
            return !value;
        }
      }
    } else {
      return value;
    }
  }
  
  // Evaluate * % / multiplication, modulo, division
  function expressionEvalSpecial(special, context, cache) {
    var out  = null;
    var op   = special[0];
    var sign = special[1];
    
    for (var i=2,l=special.length; i<l; i++) {
      var value     = special[i];
      var realValue = 0;
      
      if (isNaN(value)) {
        if (value instanceof Array) {
          realValue = expressionEvalSpecial(value, context, cache);
        } else if (value.type === tokenTypes.GROUP) {
          realValue = groupValueMap[value.id];
        } else {
          // It's a reference...
          realValue = expressionLoadReferenceValue(tokenMap[value.id], context, cache);
        }
      } else {
        realValue = value;
      }
      
      if (out !== null) {
        switch (op) {
          case "*":
            out *= realValue;
            break;
          case "%":
            out %= realValue;
            break;
          case "/":
            out /= realValue;
            break;
        }
      } else {
        out = realValue;
      }
    }
    
    return out * sign;
  }
  
  lces.template.evaluateExpression = function(compiledExpr, context, cache) {
    var tokenTypes    = lces.template.tokenTypes;
    var tokenMap      = compiledExpr.tokenMap;
    var groupValueMap = {};
    var rawValue      = compiledExpr.rawValue;
    
    if (!context) {
      context = {};
    }
    
    if (!cache) {
      cache = {};
    }
    
    for (var i=0,l=compiledExpr.length; i<l; i++) {
      var depth = compiledExpr[i];
      
      depthLoop:
      for (var j=0,l2=depth.length; j<l2; j++) {
        var group = depth[j];
        
        var curSidesValues = [];
        
        sidesLoop:
        for (var jj=0,ll=group.sides.length; jj<ll; jj++) {
          var outValue  = []; // Store value for each side
          var operator  = group.operator[jj];
          var sides     = group.sides[jj];
          var sideCount = operator ? 2 : 1;
          
          perSideLoop:
          for (var k=0; k<sideCount; k++) {
            var curSide = sides[k];
            
            if (curSide.string)
              var curValue = "";
            else
              var curValue = 0;
            
            var add      = curSide.add;
            var subtract = curSide.subtract;
            var special  = curSide.special;
            
            for (var ii=0,l3=add.length; ii<l3; ii++) {
              var curTokenValue = add[ii];
              
              if (curTokenValue.LCESValueType) {
                if (curTokenValue.type === tokenTypes.GROUP) {
                  curTokenValue = groupValueMap[curTokenValue.id];
                } else {
                  // It's a reference...
                  curTokenValue = expressionLoadReferenceValue(tokenMap[curTokenValue.id], context, cache);
                }
              }
              
              if (!rawValue)
                curValue += curTokenValue;
              else
                outValue = curTokenValue;
            }
            
            for (var ii=0,l3=subtract.length; ii<l3; ii++) {
              var curTokenValue = subtract[ii];
              
              if (curTokenValue.LCESValueType) {
                if (curTokenValue.type === tokenTypes.GROUP) {
                  curTokenValue = groupValueMap[curTokenValue.id];
                } else {
                  // It's a reference...
                  curTokenValue = expressionLoadReferenceValue(tokenMap[curTokenValue.id], context, cache);
                }
              }
              
              curValue -= curTokenValue;
            }
            
            for (var ii=0,l3=special.length; ii<l3; ii++) {
              curValue += expressionEvalSpecial(special[ii], context, cache);
            }
            
            if (!rawValue)
              outValue.push(curValue);
          }
          
          if (operator) {
            switch (operator) {
              case "==":
                curSidesValues.push(outValue[0] == outValue[1]);
                break;
              case "===":
                curSidesValues.push(outValue[0] === outValue[1]);
                break;
              case "!=":
                curSidesValues.push(outValue[0] != outValue[1]);
                break;
              case "!==":
                curSidesValues.push(outValue[0] !== outValue[1]);
                break;
              case ">=":
                curSidesValues.push(outValue[0] >= outValue[1]);
                break;
              case "<=":
                curSidesValues.push(outValue[0] <= outValue[1]);
                break;
              case ">":
                curSidesValues.push(outValue[0] > outValue[1]);
                break;
              case "<":
                curSidesValues.push(outValue[0] < outValue[1]);
                break;
            }
          } else {
            curSidesValues.push(curValue);
          }
        }
        
        if (curSidesValues.length === 1) {
          // No boolean && or || operators in this group (yay)
          group.value = curSidesValues[0];
        } else {
          // Ugh, got work to do
          
          var booleanResultSummary = true;
          var boolOps = group.bool;
          var continueBool = false;
          var lastValue = curSidesValues[0];
          // var lastResultSummary = 0;
          
          curSideValueLoop:
          for (var i=0,l=curSidesValues.length - 1; i<l; i++) {
            var curBool = boolOps[i];
            
            if (curBool === "&&") {
              if (continueBool) {
                // A chain of &&
                var curBoolVal = curSidesValues[i];
                
                if (!curBoolVal) {
                  booleanResultSummary = false;
                  lastValue = curBoolVal;
                } else if (i + 1 === l && !curSidesValues[i + 1]) {
                  // The last value after this last && is false, result isn't truthy anymore
                  booleanResultSummary = false;
                  lastValue = curSidesValues[i + 1];
                }
                
                if (booleanResultSummary)
                  lastValue = curBoolVal;
              } else {
                booleanResultSummary = !!curSidesValues[i];
                
                if (booleanResultSummary)
                  lastValue = curSidesValues[i + 1];
                
                continueBool = true;
              }
            } else {
              continueBool = false;
              
              if (!lastValue)
                lastValue = curSidesValues[i + 1];
              else
                break curSideValueLoop; // This value is positive, stop
            }
          }
          
          group.value = lastValue;
        }
        
        groupValueMap[group.id] = group.value;
      }
    }
    
    if (!rawValue)
      return groupValueMap["zero"];
    else {
      groupValueMap["zero"] = outValue;
      return outValue;
    }
  }
  
  // LCES Template Building method. Builds every LCES template constructor
  lces.template.build = function build(options) {
    
    // Build new function
    var newFunc = function LCESTemplate(args, appendNodes) {
      if (this instanceof lces.template) {
        var newContext;
        
        // Check if dynContext object was provided as args — Élégānce
        if (!args || !(args instanceof lcComponent)) {
          newContext = LCESTemplate.context && LCESTemplate instanceof lcComponent ? LCESTemplate.context : new lcWidget();
          
          if (jSh.type(args) === "object") {
            // Check if LCESTemplate.context was provided as an object that isn't constructed with lcComponent
            if (jSh.type(LCESTemplate.context) === "object" && newContext !== LCESTemplate)
              jSh.extendObj(args, LCESTemplate.context);
            
            jSh.extendObj(newContext, args, "LCESName");
          }
          
          args = newContext;
        } else {
          // dynContext was provided, but the true context might be within
          if (jSh.type(LCESTemplate.context) === "string" && jSh.type(args[LCESTemplate.context]) === "object") {
            if (!(args[LCESTemplate.context] instanceof lcComponent)) {
              var newArgsContext = new lcWidget();
              
              jSh.extendObj(newArgsContext, args[LCESTemplate.context], "LCESName");
              
              args = newArgsContext;
            } else {
              args = args[LCESTemplate.context];
            }
          }
        }
        
        // Add dynText to context
        lcDynamicText.call(args);
        
        // Add context loopback
        args.context = args;
        
        // Conceive new native DOMNode
        var newElement = LCESTemplate.render.conceive(true, args);
        
        // Run init functions on the new DOMNode
        LCESTemplate.__initFuncs.forEach(function(i) {
          i(newElement, (args || LCESTemplate.context));
        });
        
        // If no dynContext was provided, link the alternative newContext
        if (newContext) {
          newElement.component = newContext;
          newContext.element = newElement;
        }
        
        // Main context reference for encapsulating contexts
        newElement.mainComponent = newContext || args;
        
        // If there's an appending function and appendNodes, run function
        if (appendNodes && LCESTemplate.append)
          LCESTemplate.append(appendNodes, newElement);
        
        return newElement;
        
      } else {
        var newOptions = {
          render: LCESTemplate.render.cloneNode(true),
          __initFuncs: LCESTemplate.__initFuncs.slice(),
          context: (args ? args.context : null) || LCESTemplate.context
        };
        
        // Check for appending function
        if (args && args.append && typeof args.append === "function" && args.length >= 2)
          newOptions.append = args.append;
        
        // Check for initiation function
        if (args && args.init) {
          var argType = jSh.type(args.init);
          
          if (argType === "array")
            newOptions.__initFuncs = newOptions.__initFuncs.concat(args.init);
          else if (argType === "function")
            newOptions.__initFuncs.push(args.init);
        }
        
        return lces.template.build(newOptions);
      }
    }
    
    newFunc.render = options.render;
    
    // Initiation functions array
    Object.defineProperty(newFunc, "__initFuncs", {
      value: options.__initFuncs ? options.__initFuncs.slice() : [],
      enumerable: false,
      configurable: false,
      writable: false
    });
    
    newFunc.addInit    = lces.template.addInit;
    newFunc.removeInit = lces.template.removeInit;
    
    // Add init function if any
    newFunc.addInit(options.init);
    
    newFunc.context = options.context;
    
    // Make the new function instance of lces.template
    jSh.inherit(newFunc, lces.template);
    
    return newFunc;
  }
  
  /**
   * Checks whether the constructor is invoked as a child of a template's
   * MockupElement.
   *
   * @param {object} args The arguments passed to the constructor
   * @param {object} that The this context of the constructor
   * @returns {boolean} Returns false for a negative assertion, otherwise the newFunction to be appended to the MockupElement
   */
  lces.template.isChild = function(args, that) {
    if (that === lces.global) {
      var newFunction = function templChild() {
        if (this !== lces.global) {
          var newElm = new templChild.templChildFunc();
          
          newElm.Component = newElm.component;
          
          if (templChild.templChildOptions)
            jSh.extendObj(newElm, templChild.templChildOptions);
          
          return newElm.element;
        } else {
          return templChild;
        }
      }
      
      newFunction.templChildFunc = args.callee;
      newFunction.templChildOptions = args[0];
      
      return newFunction;
    } else {
      return false;
    }
  }
  
  // jSh MockupElement Methods
  jSh.MockupElementMethods = {
    // Conversion/Copying functions
    construct: function(deep, clone, dynContext) {
      var that     = this;
      var notLogic = !(!clone && this.__lclogic);
      var newElm   = clone ? jSh.MockupElement(this.tagName) : jSh.e(this.tagName.toLowerCase());
      var nsElm    = newElm.nsElm;
      
      // Disallow tags in the dynText compiling
      if (dynContext)
        dynContext.dynText.allowTags = false;
      
      // Make sure if we're conceiving it's not an lclogic element
      if (notLogic) {
        // Set the attributes
        var checkNSAttr   = /^ns:[^:]+:[^]*$/i;
        var attributeList = Object.getOwnPropertyNames(this.attributes);
        
        for (var i=0,l=attributeList.length; i<l; i++) {
          var curAttr = attributeList[i];
          
          if (curAttr === "dynClass")
            continue;
          
          var isNS    = checkNSAttr.test(curAttr);
          
          var nsURI, nsAttr, oldAttrForm = curAttr;
          
          if (isNS) {
            nsURI  = curAttr.replace(/^ns:[^:]+:([^]*)$/i, "$1");
            nsAttr = curAttr.replace(/^ns:([^:]+):[^]*$/i, "$1");
            
            curAttr = nsAttr;
          }
          
          if (dynContext) {
            var dynAttr = dynContext.dynText.compile(this.attributes[oldAttrForm], function(s) {
              if (!isNS)
                newElm.setAttribute(curAttr, s);
              else
                newElm.setAttributeNS(nsURI ? nsURI : null, nsAttr, s);
            }, dynContext);
            
            if (!dynAttr) {
              if (!isNS)
                newElm.setAttribute(curAttr, this.attributes[curAttr]);
              else
                newElm.setAttributeNS(nsURI ? nsURI : null, nsAttr, this.attributes[oldAttrForm]);
            }
          } else {
            if (!isNS)
              newElm.setAttribute(curAttr, this.attributes[curAttr]);
            else
              newElm.setAttributeNS(nsURI ? nsURI : null, nsAttr, this.attributes[oldAttrForm]);
          }
        }
        
        // Add event listeners
        var eventList = Object.getOwnPropertyNames(this.__events);
        
        for (var i=eventList.length-1; i>=0; i--) {
          var evtName = eventList[i];
          var evt     = that.__events[evtName];
          var cb, bubble;
          
          for (var j=0; j<evt.length; j+=2) {
            cb     = evt[j];
            bubble = evt[j + 1];
            
            newElm.addEventListener(evtName, cb, bubble);
          }
        }
        
        if (dynContext) {
          newElm.lces = {
            ctx: dynContext
          }
        }
      }
      
      // TODO: This is probably overly redundant
      if (this.getAttribute("style"))
        newElm.setAttribute("style", this.getAttribute("style"));
        
      // Check innerHTML and textContent
      if (dynContext && notLogic) {
        dynContext.dynText.element = newElm;
        
        // Remove the innerHTML/textContent from the exclusion array
        jSh.extendObj(jSh.MockupElementOnlyPropsMap, { // FIXME: This is applied globally, which is stupid
          "innerHTML": 0,
          "_innerHTML": 0,
          "textContent": 0,
          "_textContent": 0
        });
        
        if (this._textContent) {
          var textNode = jSh.c("span", undf, this._textContent);
          
          var resC = dynContext.dynText.compile(this._textContent, function(s) {
            textNode.textContent = s;
          }, dynContext);
          
          newElm.appendChild(textNode);
          
          jSh.extendObj(jSh.MockupElementOnlyPropsMap, {
            "textContent": 1,
            "_textContent": 1
          });
        } else if (this._innerHTML) {
          dynContext.dynText.allowTags = true;
          
          var c = dynContext.dynText.compile(this._innerHTML, null, dynContext);
          
          jSh.extendObj(jSh.MockupElementOnlyPropsMap, {
            "innerHTML": 1,
            "_innerHTML": 1
          });
        }
        
        dynContext.dynText.allowTags = false;
        dynContext.dynText.element   = null;
      }
      
      if (notLogic) {
        // Add own properties from initial MockupElement
        var jShMUpOnlyProps = jSh.MockupElementOnlyPropsMap;
        var newPropNames    = Object.getOwnPropertyNames(this);
        
        for (var i=0,l=newPropNames.length; i<l; i++) {
          let newPropName = newPropNames[i];
          
          if (!jShMUpOnlyProps[newPropName]) {
            let propValue = that[newPropName];
            
            if (dynContext && typeof propValue === "string") {
              let dyn = dynContext.dynText.compile(propValue + "", function(s) {
                newElm[newPropName] = s;
              }, dynContext);
              
              if (!dyn)
                newElm[newPropName] = propValue;
            } else if (propValue)
              newElm[newPropName] = propValue;
          }
        }
        
        // Finally add the classNames if any
        if (this.className) {
          if (!nsElm)
            newElm.className = this.className;
          else
            newElm.setAttribute("class", this.className);
        }
        
        // Check for dynClass
        if (!clone && dynContext) {
          if (this.dynClass instanceof Object) {
            var classExpressions = Object.getOwnPropertyNames(this.dynClass);
            var classExprRefs = [];
            var refCache = {};
            var classStates = {};
            
            for (var i=0,l=classExpressions.length; i<l; i++) {
              var curRawClassExpr = classExpressions[i];
              
              var classes = this.dynClass[curRawClassExpr].replace(/\s+/g, "").split(".").filter(function(c) {
                return c;
              });
              
              var curCompiledExpr = lces.template.parseExpression(curRawClassExpr);
              var curClassExpr = {
                rawExpr: curRawClassExpr,
                expr: curCompiledExpr,
                classes: classes
              };
              
              for (var j=0,l2=classes.length; j<l2; j++) {
                var className = classes[j];
                var classObj  = classStates[className];
                
                if (!classObj) {
                  classObj = classStates[className] = {};
                  classObj.actualState = false;
                  classObj.stateExpr = {};
                  classObj.states = [];
                }
                
                classObj.stateExpr[curRawClassExpr] = classObj.states.length;
                classObj.states.push(false);
              }
              
              for (var j=0,l2=curCompiledExpr.references.length; j<l2; j++) {
                var ref = curCompiledExpr.references[j];
                var refName = ref.nameStr;
                var refObj = classExprRefs["ref" + refName];
                
                if (!refObj) {
                  refObj = classExprRefs["ref" + refName] = {};
                  refObj.expr = [];
                  refObj.ref = ref;
                  
                  classExprRefs.push(refObj);
                }
                
                refObj.expr.push(curClassExpr);
              }
            }
            
            function classDynTrigger(classExprRef, dynContext) {
              var refObj = classExprRef;
              
              for (var j=0,l2=refObj.expr.length; j<l2; j++) {
                var curExpr = refObj.expr[j];
                var curExprRaw = curExpr.rawExpr;
                var classes = curExpr.classes;
                
                var result = !!lces.template.evaluateExpression(curExpr.expr, dynContext);
                for (var k=0,l3=classes.length; k<l3; k++) {
                  var className = classes[k];
                  var classObj = classStates[className];
                  var classInd = classObj[curExprRaw];
                  var curClassStates = classObj.states;
                  
                  curClassStates[classInd] = result;
                  var setClass = result;
                  
                  if (!setClass) {
                    for (var i=0,l=curClassStates.length; i<l; i++) {
                      if (curClassStates[i]) {
                        setClass = true;
                        break;
                      }
                    }
                  }
                  
                  if (classObj.actualState !== setClass) {
                    classObj.actualState = setClass;
                    
                    if (setClass) {
                      newElm.classList.add(className);
                    } else {
                      newElm.classList.remove(className);
                    }
                  }
                }
              }
            }
            
            function dynClassCallback(name) {
              return function LCESDynClassCallback(value) {
                var refObj = classExprRefs["ref" + name];
                
                classDynTrigger(refObj, this.component);
              }
            }
            
            // Add listeners to states
            for (var i=0,l=classExprRefs.length; i<l; i++) {
              var ref     = classExprRefs[i].ref;
              var ctxStr  = ref.ctxStr;
              var pathStr = ref.nameStr;
              
              if (!refCache[pathStr]) {
                if (!ctxStr) {
                    dynContext.addStateListener(pathStr, dynClassCallback(pathStr));
                    refCache[pathStr] = dynContext;
                } else {
                  var varName = ref.varName;
                  
                  if (refCache[ctxStr]) {
                    refCache[ctxStr].addStateListener(varName, dynClassCallback(pathStr));
                  } else {
                    var ctxPath = ref.context;
                    var curObj  = dynContext;
                    
                    for (var j=0,l2=ctxPath.length; j<l2; j++) {
                      curObj = curObj[ctxPath[j]];
                      refCache[ctxPath.slice(0, j + 1).join(".")] = curObj;
                    }
                    
                    curObj.addStateListener(varName, trigger);
                    refCache[pathStr] = curObj;
                  }
                }
              }
              
              // Try to initially update states
              try {
                classDynTrigger(classExprRefs[i], dynContext);
              } catch(e) {
                // Welp...
              }
            }
          }
        }
      }
      
      // If deep is true, then traverse all the children
      if (deep) {
        var childNodes = this.childNodes;
        
        if (clone) {
          for (var i=0,l=childNodes.length; i<l; i++) {
            newElm.appendChild(childNodes[i].cloneNode(true, dynContext));
          }
        } else {
          if (notLogic) {
            for (var i=0,l=childNodes.length; i<l; i++) {
              newElm.appendChild(childNodes[i].conceive(true, dynContext));
            }
          } else {
            var logicMarker = document.createComment("  LCES LOGIC - " + this.__lclogic + (this.__lcexprStr ? ": " + this.__lcexprStr : "") + "  ");
            this.__lcinit(logicMarker, newElm, childNodes, dynContext);
          }
        }
      }
      
      if (!clone && this.tagName.toLowerCase() === "lces-placeholder") {
        var phName = this.phName;
        
        var ph = new lcPlaceholder(newElm);
        ph.phName = phName;
      }
      
      // End
      if (notLogic)
        return jSh(newElm, null, true);
      else
        return logicMarker;
    },
    
    // Return a full fledged DOM Node
    conceive: function(deep, dynContext) {
      return this.construct(deep, false, dynContext);
    },
    
    // Return a MockupElement copy
    cloneNode: function(deep) {
      return this.construct(deep, true);
    },
    
    // Child manipulation methods
    __childCheck: function(args, e, error) {
        if (args && jSh.hasMultipleArgs(args, this))
          return false;
        
        if (!(e instanceof jSh.MockupElement)) {
          if (jSh.type(e) === "function" && e.prototype)
          if (e.prototype instanceof lces.template)
            return true;
          else; // TODO: Lacking? Maybe?
          else
            throw TypeError(error || "Element provided doesn't implement the jSh.MockupElement interface");
        }
        
        return true;
    },
    
    __childDetermineType: function(e, create) {
      if (typeof e === "function") {
        if (create || !e.lcesTemplateMockupWrapper)
          return jSh.cm("lces-template-constructor", e);
        else
          return e.lcesTemplateMockupWrapper;
      }
      
      return e;
    },
    
    appendChild: function(e) {
      if (!this.__childCheck(arguments, e))
        return undf;
      
      e = this.__childDetermineType(e);
      
      this.childNodes.push(e);
      e.__privParentNode = this;
    },
    removeChild: function(e) {
      if (!this.__childCheck(arguments, e))
        return false;
      
      e = this.__childDetermineType(e);
      
      var index = this.childNodes.indexOf(e);
      
      if (index !== -1) {
        this.childNodes.splice(index, 1);
        e.__privParentNode = null;
      }
    },
    insertBefore: function(e, e2) {
      if (!this.__childCheck(undf, e, "Element provided doesn't implement the jSh.MockupElement interface"))
        return false;
      
      e  = this.__childDetermineType(e);
      e2 = this.__childDetermineType(e2);
      
      var index = this.childNodes.indexOf(e2);
      
      if (index !== -1) {
        this.childNodes.splice(index, 0, e);
        e.__privParentNode = this;
      }
    },
    
    // A function for traversing all children of the element
    traverse: function(e, cb) {
      var that = this;
      
      var children = e.childNodes;
      
      for (var i=0,l=children.length; i<l; i++) {
        var child = children[i];
        
        if (child.childNodes[0])
          this.traverse(child, cb);
      }
    },
    
    // Query selectors
    getElementsByTagName: function(tagname) {
      var elements = [];
      
      this.traverse(this, function(e) {
        if (e.tagName.toLowerCase() === tagname.toLowerCase())
          elements.push(e);
      });
      
      return elements;
    },
    getElementsByClassName: function(classname) {
      var elements = [];
      
      this.traverse(this, function(e) {
        if (e.classList.contains(classname))
          elements.push(e);
      });
      
      return elements;
    },
    getElementById: function(id) {
      var element = null;
      
      this.traverse(this, function(e) {
        if (e.id === id)
          element = e;
      });
      
      return element;
    },
    
    // Event handling
    addEventListener: function(evt, callback, bubble) {
      var evtArray = this.__events[evt];
      
      // Check for event array
      if (!evtArray) {
        evtArray = [];
        this.__events[evt] = evtArray;
      }
      
      evtArray.push(callback, bubble);
    },
    removeEventListener: function(evt, callback) {
      var evtArray = this.__events[event];
      
      if (!evtArray)
        return null;
      
      var index = evtArray.indexOf(e);
      
      if (index !== -1)
        evtArray.splice(index, 1);
    },
    
    // Set the styles from an attribute assignment
    __setStyleFromAttr: function(styles) {
      var that = this;
      
      this.style   = {};
      var styleObj = this.style;
      
      var properties = styles.split(/\s*;\s*/g);
      
      properties.forEach(function(i) {
        if (!i.trim(""))
          return;
        
        var nameVal = i.split(/\s*:\s*/);
        
        var nameSplit = nameVal[0].split("-");
        nameSplit = nameSplit.map(function(n, i) {if (i!==0) var c = n[0].toUpperCase(); else var c = n[0].toLowerCase(); return c + n.substr(1);}).join("");
        
        styleObj[nameSplit] = nameVal[1];
      });
    },
    __JSProp2CSS: function(prop) {
      var upper = /[A-Z]/;
      prop = prop.split("");
      
      return prop.map(function(i) {return upper.test(i) ? "-" + i.toLowerCase() : i;}).join("");
    },
    __getStyleFromAttr: function() {
      var that  = this;
      var style = this.style;
      
      return Object.getOwnPropertyNames(style).map(function(i) {return that.__JSProp2CSS(i) + ": " + style[i] + ";";}).join("");
    },
    
    // Attribute handling
    setAttribute: function(attr, value) {
      attr  = attr + ""; // Quick n' dirty to string conversion
      value = value + "";
      
      this.attributes[attr] = value;
      
      if (attr === "style")
        this.__setStyleFromAttr(value);
    },
    getAttribute: function(attr) {
      return attr !== "style" ? this.attributes[attr] : this.__getStyleFromAttr();
    },
    removeAttribute: function(attr) {
      attr = attr + "";
      
      this.attributes[attr] = undf;
    },
    setAttributeNS: function(nsURI, nsAttr, value) {
      this.setAttribute("ns:" + nsAttr + ":" + (nsURI ? nsURI : ""), value);
    }
  };

  jSh.MockupElementClassList = {
    manipulateClass: function(classn, add) {
      if (!add && classn === undefined) { // Remove all classnames
        this.classes     = [];
        this.classlookup = {};
      } else if (typeof classn === "string" && classn.trim()) {
        var classes    = classn.split(/\s+/);
        var classArray = this.classes;
        var classObj   = this.classlookup;
        
        for (var i=classes.length-1; i>=0; i--) {
          var curClass = classes[i];
          var exists   = !!classObj[curClass];
          
          if (add && !exists || !add && exists) {
            if (add) {
              classArray.push(curClass);
              classObj[curClass] = true;
            } else {
              var curIndex = classArray.indexOf(curClass);
              
              classArray.splice(curIndex, 1);
              classObj[curClass] = false;
            }
          }
        }
      }
    },
    add: function(classn) {
      this.manipulateClass(classn, true);
    },
    remove: function(classn) {
      this.manipulateClass(classn, false);
    },
    contains: function(classn) {
      return !!this.classlookup[classn];
    },
    toggle: function(classn) {
      if (this.contains(classn))
        this.remove(classn);
      else
        this.add(classn);
    }
  };
  
  // Array of properties to NOT copy to the real element
  jSh.MockupElementOnlyProps = [];
  jSh.MockupElementOnlyProps = jSh.MockupElementOnlyProps.concat(Object.getOwnPropertyNames(jSh.MockupElementMethods));
  jSh.MockupElementOnlyProps = jSh.MockupElementOnlyProps.concat([
    "classList", "style", "childNodes", "tagName",
    "__events", "attributes", "jSh", "parentNode",
    "previousSibling", "nextSibling", "getChild",
    "on", "__privParentNode", "__apch", "__rmch",
    "nodeType", "className",
    
    // For LCES logic mockup elements
    "__lclogic"
  ]);
  
  // Assign to object for faster hash lookup
  jSh.MockupElementOnlyPropsMap = {};
  jSh.MockupElementOnlyProps.forEach(p => (jSh.MockupElementOnlyPropsMap[p] = 1));
  
  // Elements that CANNOT contain children
  jSh.MockupElementsBarren = ["img", "input", "link", "meta"];

  // jSh Mockup Element
  jSh.MockupElement = function MockupElement(tagname) {
    if (!(this instanceof MockupElement))
      return new MockupElement(tagname);
    
    // We're in our protective bubble, nice.
    var that = this;
    tagname  = jSh.type(tagname) === "string" ? tagname : "div";
    
    // Set our fake nodeType
    this.nodeType = Node.ELEMENT_NODE;
    this.isjShMockup = true;
    
    // Add the tagname
    Object.defineProperty(this, "tagName", {
      value: tagname.toUpperCase(),
      enumerable: true,
      configurable: false,
      writable: false
    });
    
    // Add the styles object
    var privStyle = {};
    
    Object.defineProperty(this, "style", {
      enumerable: true,
      configurable: false,
      get: function() {return privStyle}
    });
    
    // Add the parentNode property
    Object.defineProperty(this, "__privParentNode", {
      value: null,
      enumerable: false,
      configurable: false,
      writable: true
    });
    
    Object.defineProperty(this, "parentNode", {
      enumerable: true,
      configurable: false,
      get: function() {return that.__privParentNode}
    });
    
    // Previous and Next Sibling
    Object.defineProperty(this, "previousSibling", {
      enumerable: true,
      configurable: false,
      get: function() {
        if (!that.parentNode)
          return null;
        
        var index  = that.parentNode.childNodes.indexOf(that);
        // var length = that.parentNode.childNodes.length;
        
        if (index === 0)
          return null;
        
        return that.parentNode.childNodes[index - 1];
      }
    });
    
    Object.defineProperty(this, "nextSibling", {
      enumerable: true,
      configurable: false,
      get: function() {
        if (!that.parentNode)
          return null;
        
        var index  = that.parentNode.childNodes.indexOf(that);
        var length = that.parentNode.childNodes.length;
        
        if (index === length - 1)
          return null;
        
        return that.parentNode.childNodes[index + 1];
      }
    });
    
    // Add the childNodes array
    Object.defineProperty(this, "childNodes", {
      value: [],
      enumerable: true,
      configurable: false,
      writable: false
    });
    
    // Add the children array, lists functions are they were originally appended
    Object.defineProperty(this, "children", {
      enumerable: true,
      configurable: false,
      get: function() {
        return that.childNodes.map(function(i) {
          if (i.tagName && i.tagName.toLowerCase() === "lces-template-constructor")
            return i.__lcesTemplateConstructor;
          
          return i;
        });
      }
    });
    
    // An object that contains all the event callbacks
    Object.defineProperty(this, "__events", {
      value: {
        // Will contain all the event callbacks here
      },
      enumerable: true,
      configurable: false,
      writable: false
    });
    
    // Add attributes
    Object.defineProperty(this, "attributes", {
      value: {},
      enumerable: true,
      configurable: false,
      writable: false
    });
    
    // Add classList functionality
    Object.defineProperty(this, "classList", {
      value: jSh.extendObj({classes: [], classlookup: {}, element: this}, jSh.MockupElementClassList),
      enumerable: true,
      configurable: false,
      writable: false
    });
    
    // Add classList length property
    Object.defineProperty(this.classList, "length", {
      enumerable: true,
      configurable: false,
      get: function() {return that.classList.length;}
    });
    
    // Add dynamic className property
    Object.defineProperty(this, "className", {
      enumerable: true,
      configurable: false,
      get: function() {return that.classList.classes.join(" ");},
      set: function(classes) {
        if (jSh.type(classes) && classes.trim()) {
          that.classList.remove();
          that.classList.add(classes);
        } else {
          that.classList.remove();
        }
      }
    });
  }
  
  jSh.MockupElement.prototype.constructor = jSh.MockupElement;
  
  // Add all the methods
  jSh.extendObj(jSh.MockupElement.prototype, jSh.MockupElementMethods);
  
  // MockupText, similar to document.createTextNode
  jSh.__MockupTextConceive = function(d, dynContext) {
    if (dynContext) {
      dynContext.dynText.allowTags = true;
      dynContext.dynText.element   = document.createDocumentFragment();
      
      var compiled = dynContext.dynText.compile(this.nodeValue);
      
      if (compiled)
        return dynContext.dynText.element;
      else
        return jSh.t(this.nodeValue);
      
    } else {
      // No context provided
      return jSh.t(this.nodeValue);
    }
  }

  jSh.MockupText = function MockupText(text) {
    if (!(this instanceof jSh.MockupText))
      return new jSh.MockupText(text);
    
    this.nodeValue = text;
    this.nodeType  = Node.TEXT_NODE;
    
    // Conceive Method
    this.conceive = jSh.__MockupTextConceive;
  }

  jSh.inherit(jSh.MockupText, jSh.MockupElement);

  // MockupElement Creation Functions
  jSh.dm = function nodeM(className, text, child, attributes, properties, events) { // Div MockupElement
    return jSh.d.call({lcesElement: jSh.MockupElement("div")}, className, text, child, attributes, properties, events);
  }

  jSh.cm = function nodeCM(type, className, text, child, attributes, properties, events) { // Custom MockupElement
    if (type !== "lces-template-constructor")
      return jSh.d.call({lcesElement: jSh.MockupElement(type)}, className, text, child, attributes, properties, events);
    else
      return jSh.d.call({lcesElement: jSh.MockupElement(type)}, {prop: {
        __lcesTemplateConstructor: className,
        conceive: function(d, dynContext) {
          // console.log(dynContext);
          return new this.__lcesTemplateConstructor(dynContext);
        }
      }});
  }
  
  jSh.svgm = function(className, width, height, paths) {
    return jSh.cm("ns:svg:http://www.w3.org/2000/svg", className, undf, paths, {
      "version": "1.1",
      "width": width,
      "height": height
    });
  }
  
  jSh.pathm = function(className, points, style) {
    return jSh.cm("ns:path:http://www.w3.org/2000/svg", className, undf, undf, {
      "ns:d:": points,
      "ns:style:": style || ""
    });
  }
  
  jSh.tm = function textM(text) {
    return jSh.MockupText(text);
  }
  
  // LCES Templating Logic Elements
  jSh.m = {};
  
  lces.template.initIf = function(marker, newElm, childNodes, dynContext) {
    // var anchor    = document.createComment();
    var children   = [];
    var logicNodes = [];
    var refCache   = {};
    var exprCache  = {};
    var expr       = this.__lcexpr;
    var refs       = expr.references;
    var visible    = false;
    
    for (var i=0,l=childNodes.length; i<l; i++) {
      var newChild = childNodes[i].conceive(true, dynContext);
      children.push(newChild);
      
      if (newChild.LCESTrigger)
        logicNodes.push(newChild);
    }
    
    function trigger(change) {
      if (!marker.parentNode)
        return false;
      
      var result = !!lces.template.evaluateExpression(expr, dynContext, exprCache);
      
      if (result !== visible || change) {
        if (result) {
          var frag = jSh.docFrag();
          
          for (var i=0,l=children.length; i<l; i++) {
            frag.appendChild(children[i]);
          }
          
          if (marker.nextSibling) {
            marker.parentNode.insertBefore(frag, marker.nextSibling);
          } else {
            marker.parentNode.appendChild(frag);
          }
          
          // Trigger logic nodes
          for (var i=0,l=logicNodes.length; i<l; i++) {
            logicNodes[i].LCESInvisible(false);
          }
        } else {
          var parent = marker.parentNode;
          
          if (children[0].parentNode) {
            for (var i=0,l=children.length; i<l; i++) {
              var child = children[i];
              
              // Check if logic is to be removed
              if (child.LCESInvisible) {
                child.LCESInvisible(true);
              }
              
              parent.removeChild(child);
            }
          }
        }
        
        visible = result;
      }
    }
    
    function invisible(notvisible) {
      if (!notvisible) {
        trigger(true);
      } else {
        if (visible) {
          var parent = marker.parentNode;
          
          for (var i=0,l=children.length; i<l; i++) {
            var child = children[i];
            
            if (child.LCESInvisible) {
              child.LCESInvisible(false);
            }
            
            parent.removeChild(child);
          }
        }
      }
    }
    
    marker.LCESTrigger = trigger;
    marker.LCESInvisible = invisible;
    
    for (var i=0,l=refs.length; i<l; i++) {
      var ref     = refs[i];
      var ctxStr  = ref.ctxStr;
      var pathStr = ref.nameStr;
      
      if (!refCache[pathStr]) {
        if (!ctxStr) {
            dynContext.addStateListener(pathStr, trigger);
            refCache[pathStr] = dynContext;
        } else {
          var varName = ref.varName;
          
          if (refCache[ctxStr]) {
            refCache[ctxStr].addStateListener(varName, trigger);
          } else {
            var ctxPath = ref.context;
            var curObj  = dynContext;
            
            for (var j=0,l2=ctxPath.length; j<l2; j++) {
              curObj = curObj[ctxPath[j]];
              refCache[ctxPath.slice(0, j + 1).join(".")] = curObj;
            }
            
            curObj.addStateListener(varName, trigger);
            refCache[pathStr] = curObj;
          }
        }
      }
    }
    
    setTimeout(function() {
      trigger(); // It's showtime baby!
    }, 0);
  }
  
  // jSh.m.if
  //
  // Will show elements if `condition` is true, will remove otherwise
  jSh.m.if = function(condition, onChange, child) {
    var element = jSh.cm("lces-template-if", null, null, child);
    
    element.__lclogic   = "if";
    element.__lcinit    = lces.template.initIf;
    element.__lcexpr    = lces.template.parseExpression(condition);
    element.__lcexprStr = condition;
    
    return element;
  }
  
  lces.template.initArray = function() {
    
  }
  
  // jSh.m.array
  //
  // Loops an array
  jSh.m.array = function(iterate, itemIdentifier, indexIdentifier, onAdd, onRemove) {
    var element = jSh.cm("lces-template-array");
    
    element.__lclogic     = "array";
    element.__lcitemName  = jSh.strOp(itemIdentifier, null) || "_item";
    element.__lcindexName = jSh.strOp(indexIdentifier, null) || "_i";
    element.__lcinit      = lces.template.initArray;
    element.__lcexpr      = lces.template.parseExpression(iterate, {
      noStrings: true,
      noNumbers: true,
      noCompare: true,
      noArithmetic: true
    });
    element.__lcexprStr = iterate;
    
    return element;
  }
  
  lces.template.initTimes = function(marker, newElm, childNodes, dynContext) {
    // var anchor    = document.createComment();
    var children  = [];
    var refCache  = {};
    var exprCache = {};
    var expr      = this.__lcexpr;
    var refs      = expr.references;
    var count     = 0;
    var rendering = false;
    var countName = this.__lccountName;
    var initTimes = false;
    
    var noAutoStateObj = jSh.extendObj(Object.create(dynContext._noAutoState), {[countName]: 1});
    
    function trigger(change) {
      if (!marker.parentNode || rendering)
        return;
      
      rendering = true;
      var result = parseInt(lces.template.evaluateExpression(expr, dynContext, exprCache));
      
      if (result !== count) {
        if (result > count) {
          var frag = jSh.docFrag();
          var diff = result - count;
          var last = children[children.length - 1];
          
          for (var i=0; i<diff; i++) {
            for (var j=0,l=childNodes.length; j<l; j++) {
              var newContext = Object.create(dynContext); // Create new inhereting context
              newContext._noAutoState = noAutoStateObj;
              newContext[countName] = count + i + 1;
              
              var child = childNodes[j].conceive(true, newContext);
              
              frag.appendChild(child);
              children.push(child);
            }
          }
          
          var lastNode = count !== 0 ? last : marker;
          
          if (lastNode.nextSibling) {
            marker.parentNode.insertBefore(frag, lastNode.nextSibling);
          } else {
            marker.parentNode.appendChild(frag);
          }
        } else {
          var parent     = marker.parentNode;
          var start      = (childNodes.length * result);
          var childCount = children.length;
          
          if (start >= 0 && childCount) {
            for (var i=start; i<childCount; i++) {
              parent.removeChild(children[i]);
            }
          }
          
          children = children.slice(0, start);
        }
        
        count = result;
      }
      
      rendering = false;
      initTimes = true;
    }
    
    function invisible(notvisible) {
      if (!notvisible) { // Visible
        if (!initTimes)  {
          trigger();
        } else {
          var parent = marker.parentNode;
          var frag   = jSh.docFrag();
          
          for (var i=0,l=children.length; i<l; i++) {
            var child = children[i];
            
            frag.appendChild(child);
            
            if (child.LCESInvisible) {
              child.LCESInvisible(false);
            }
          }
          
          if (marker.nextSibling) {
            parent.insertBefore(frag, marker.nextSibling);
          } else {
            parent.appendChild(frag);
          }
        }
      } else {
        var parent = marker.parentNode;
        
        for (var i=0,l=children.length; i<l; i++) {
          var child = children[i];
          
          if (child.LCESInvisible) {
            child.LCESInvisible(true);
          }
          
          parent.removeChild(child);
        }
      }
    }
    
    marker.LCESTrigger   = trigger;
    marker.LCESInvisible = invisible;
    
    for (var i=0,l=refs.length; i<l; i++) {
      var ref     = refs[i];
      var ctxStr  = ref.ctxStr;
      var pathStr = ref.nameStr;
      
      if (!refCache[pathStr]) {
        if (!ctxStr) {
            dynContext.addStateListener(pathStr, trigger);
            refCache[pathStr] = dynContext;
        } else {
          var varName = ref.varName;
          
          if (refCache[ctxStr]) {
            refCache[ctxStr].addStateListener(varName, trigger);
          } else {
            var ctxPath = ref.context;
            var curObj  = dynContext;
            
            for (var j=0,l2=ctxPath.length; j<l2; j++) {
              curObj = curObj[ctxPath[j]];
              refCache[ctxPath.slice(0, j + 1).join(".")] = curObj;
            }
            
            curObj.addStateListener(varName, trigger);
            refCache[pathStr] = curObj;
          }
        }
      }
    }
    
    setTimeout(function() {
      trigger(); // It's showtime baby!
    }, 0);
  }
  
  // jSh.m.times
  //
  // Renders the elements any number of times
  jSh.m.times = function(count, countIdentifier, child, onAdd, onRemove) {
    var element = jSh.cm("lces-template-times", null, null, child);
    
    element.__lclogic     = "times";
    element.__lccountName = jSh.strOp(countIdentifier, null) || "_c";
    element.__lccurCount  = 0;
    element.__lcinit      = lces.template.initTimes;
    element.__lcexpr      = lces.template.parseExpression(count, {
      noStrings: true,
      noCompare: true
    });
    element.__lcexprStr = count;
    
    return element;
  }
  
  // LCES Templating Placeholder element
  
  // Placeholder method for replacing it with a real node or MockupElement
  lces.template.__placeHolderReplace = function(e) {
    var that   = this;
    var parent = this.parent;
    var e      = this._determineType(e);
    
    if (!parent)
      return null;
    
    parent.insertBefore(e, this.element);
    
    // Check for multiple elements
    if (arguments.length > 1) {
      var elements = jSh.toArr(arguments).slice(1);
      
      elements.forEach(function(i) {
        parent.insertBefore(i, that.element);
      });
    }
    
    // Remove placeholder and update substituting property
    parent.removeChild(this.element);
    this.substituting = null;
  };
  
  lces.template.__placeHolderSubstitute = function(e) {
    var e = this._determineType(e);
    
    if (!e.parentNode)
      return null;
    
    e.parentNode.insertBefore(this.element, e);
    e.parentNode.removeChild(e);
    
    this.substituting = e;
  };

  // LCES Placeholder Constructor
  function lcPlaceholder(e) {
    var that = this;
    
    lcWidget.call(this, e);
    
    this.type = "LCES Placeholder Widget";
    
    this.element.replace = this.replace.bind(this);
    this.element.substitute = this.substitute.bind(this);
    
    this.addStateListener("phName", function(phName) {
      that.element.setAttribute("ph-name", phName);
    });
  }
  
  jSh.inherit(lcPlaceholder, lcWidget);
  
  jSh.extendObj(lcPlaceholder.prototype, {
    replace: lces.template.__placeHolderReplace,
    substitute: lces.template.__placeHolderSubstitute
  });
  
  // Create DOM placeholder element
  jSh.ph = function(phName) {
    var widget = new lcPlaceholder(jSh.c("lces-placeholder"));
    
    widget.phName = phName;
    
    return widget.element;
  };

  // Create MockupElement placeholder element
  jSh.phm = function(phName) {
    var widget = new lcPlaceholder(jSh.cm("lces-placeholder"));
    
    widget.phName = phName;
    widget.element.phName = phName;
    
    return widget.element;
  };

  // Scan for Placeholders on lces init
  lces.template.initLoadPH = function() {
    var placeholders = jSh("lces-placeholder");
    
    // Setup placeholders
    placeholders.forEach(function(i) {
      var attrVal = i.getAttribute("ph-name");
      var attrVis = i.getAttribute("ph-visible");
      
      var widget  = new lcPlaceholder(i);
      
      if (attrVal) {
        i.phName = attrVal;
        widget.phName = attrVal;
      }
      
      if (attrVis !== null) {
        i.style.display = "block";
      }
    });
  }

  // Initiation function that scans the DOM after it loads for <lces-template> elements
  lces.template.initLoadTemplates = function() {
    var templates = jSh("lces-template");
    
    templates.forEach(function(templ) {
      var templConstructor = lces.template.list[templ.getAttribute("template")];
      var contextName      = templ.getAttribute("context");
      
      if (templConstructor && templ.getAttribute("context")) {
        var context = (contextName ? lces(contextName) : null) || new lcComponent();
        
        if (contextName)
          context.LCESName = contextName;
        
        var templId = templ.id;
        var classes = templ.className.split(" ");
        
        // Create new element
        var newElm = new templConstructor(context, jSh.toArr(templ.childNodes));
        
        // Add classnames
        classes.forEach(function(c) {
          if (c)
            newElm.classList.add(c);
        });
        
        // Add id
        if (templId)
          newElm.id = templId;
        
        // Prevent conflicts
        templ.id = "";
        
        // End
        templ.parentNode.insertBefore(newElm, templ);
        templ.parentNode.removeChild(templ);
      }
    });
  }

  lces.addInit(lces.template.initLoadTemplates);
  lces.addInit(lces.template.initLoadPH);


  // Template list
  lces.template.list = {};
}
