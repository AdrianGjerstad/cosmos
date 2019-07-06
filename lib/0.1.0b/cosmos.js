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

  /////////////////////////////////////PRNG/////////////////////////////////////

  API.PRNG = {};

  // MurmurHash3's Mixing Function (For seed generation)
  API.PRNG.xmur3 = function(str) {
    let h = 1779033703 ^ str.length;
    for(let i = 0; i < str.length; i++)
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
      h = h << 13 | h >>> 19;
    return function() {
      h = Math.imul(h ^ h >>> 16, 2246822507);
      h = Math.imul(h ^ h >>> 13, 3266489909);
      return (h ^= h >>> 16) >>> 0;
    }
  };

  API.PRNG.defaultSeeder = API.PRNG.xmur3;

  // SFC 32-Bit Random Number Generation
  API.PRNG.sfc32 = function(a, b, c, d) {
    return function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
      let t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
  };

  // Full Period Cycle of 2^32 (Not cryptographically safe)
  API.PRNG.mulberry32 = function(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }

  // 128-Bit State - Xorshift Family
  API.PRNG.xoshiro128ss = function(a, b, c, d) {
    return function() {
      let t = b << 9, r = a * 5; r = (r << 7 | r >>> 25) * 9;
      c ^= a; d ^= b;
      b ^= c; a ^= d; c ^= t;
      d = d << 11 | d >>> 21;
      return (r >>> 0) / 4294967296;
    }
  }

  // JSF/smallprng by Bob Jenkins (2007) Undetermined Period Cycle - 2^126
  API.PRNG.JSF = function(a) {
    function jsf() {
      let e = s[0] - (s[1]<<27 | s[1]>>>5);
      s[0] = s[1] ^ (s[2]<<17 | s[2]>>>15),
      s[1] = s[2] + s[3],
      s[2] = s[3] + e, s[3] = s[0] + e;
      return (s[3] >>> 0) / 4294967296; // 2^32
    }
    a >>>= 0;
    let s = [0xf1ea5eed, a, a, a];
    for(let i=0;i<20;i++) jsf();
    return jsf;
  }

  // Linear Congruential Generator (Xn+1=(aXn+c)modm)
  API.PRNG.LCG_base =
      s=>((s=Math.imul(1597334677/*DO NOT ALTER*/,s))>>>0)/2**32;

  API.PRNG.LCG = function(a) {
    // a is seed
    function lcg() {
      //a >>>= 0;
      a=API.PRNG.LCG_base(a);
      let b = a;
      a*=2**32;a=Math.floor(a);
      return b;
    }

    return lcg;
  }

  API.PRNG.defaultPRNG = API.PRNG.sfc32;

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
