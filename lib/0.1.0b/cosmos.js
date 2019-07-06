// Cosmos - Make something big with something small
// By Adrian Gjerstad.

// MIT License

// Copyright (c) 2019 Adrian Gjerstad

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.


let Cosmos = Cm = (function() {
  let API = {};
  API.internals = {};

  //////////////////////////////////Internals///////////////////////////////////

  API.internals.Enumerator = function(v) {
    this.uid = Math.floor(Math.random()*2147483647);
    this.value = v;
  };

  //////////////////////////////////Lifecycle///////////////////////////////////

  API.Exception = function(m) {
    this.name = "Cosmos.Exception";
    this.message = (m||"");
  }

  API.Exception.prototype = Error.prototype;

  API.EnumeratorException = function(m) {
    this.name = "Cosmos.EnumeratorException";
    this.message = (m||"");
  }

  API.EnumeratorException.prototype = Error.prototype;

  API.MathException = function(m) {
    this.name = "Cosmos.MathException";
    this.message = (m||"");
  }

  API.MathException.prototype = Error.prototype;

  //////////////////////////////////Utilities///////////////////////////////////

  API.Enum = function(...v) {
    for(let i = 0; i < v.length; ++i) {
      let key = v[i];
      let value = new API.internals.Enumerator(v[i]);
      if(typeof v[i] === "object" || v[i] instanceof Object) {
        if(v[i].key === undefined||v[i].value === undefined) {
          throw new API.EnumeratorException("Error in argument " + i +
              ": Object passed, couldn't find `key` or `value` values.");
        } else if(typeof v[i].key !== "string" &&
            !(v[i].key instanceof String)) {
          throw new API.EnumeratorException("Error in argument " + i +
              ": Object passed, key is not of type string.");
        }

        value = v[i].value;
        key = v[i].key;
      }

      if(key.match(/./g)===null) {
        this[key.toUpperCase()] = value;
      } else {
        let obj = this;
        let nsp = key.split('.'); nsp.pop();
        for(let j = 0; j < nsp.length; ++j) {
          if(obj[nsp[j].toUpperCase()] !== undefined) {
            obj = obj[nsp[j].toUpperCase()];
          } else {
            obj[nsp[j].toUpperCase()] = {};
            obj = obj[nsp[j].toUpperCase()];
          }
        }
        obj[key.split('.')[key.split('.').length-1].toUpperCase()] = value;
      }
    }
  };

  /////////////////////////////////////Math/////////////////////////////////////

  API.MathFunction = function(func) {
    this.f = func;
    if(this.f.length !== 1) {
      throw new API.MathException(
          "Cosmos.MathFunction<class>: Function doesn't have one argument"
      );
    }
  }

  API.MathFunction.prototype.range = function(x0, xf, st) {
    x0 = (x0||0);
    xf = (xf||10);
    st = (st||1);

    let dx = xf-x0;
    let ln = dx/st;
    let ar = [];

    for(let i = 0; i <= ln; ++i) {
      ar.push(this.f((i*st)+x0));
    }

    return ar;
  }

  API.integral = function(mf, x0, xf, st) {
    x0 = (x0||0);
    xf = (xf||1);
    st = (st||0.0000003);
    if(!(mf instanceof API.MathFunction)) {
      throw new API.MathException(
          "Cosmos.integral<function>: First parameter was not a"+
          "Cosmos.MathFunction<class>."
      );
    }

    let ys = mf.range(x0, xf, st);
    ys.pop();
    let area_sum = 0;

    for(let i = 0; i < ys.length; ++i) {
      let y = ys[i];

      let area = st*y;
      area_sum += area;
    }

    return {step: st, func: mf, x0: x0, xf: xf, integral: area_sum};
  }

  return API;
})();
