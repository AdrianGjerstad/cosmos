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
  // Setup for game loop systems
  window.requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(f){return setTimeout(f, 1000/60)} // simulate calling code 60

  window.cancelAnimationFrame = window.cancelAnimationFrame
      || window.mozCancelAnimationFrame
      || function(requestID){clearTimeout(requestID)} //fall back

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

  API.DictionaryException = function(m) {
    this.name = "Cosmos.DictionaryException";
    this.message = (m||"");
  }

  API.DictionaryException.prototype = Error.prototype;

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
    this.length = v.length;
  };

  API.Dictionary = function() {
    this.languages_ = {length_: 0};
    this.language_ = {length_: 0};
  }

  API.Dictionary.prototype.appendLanguage = function(code) {
    if(typeof code !== "string" && !(code instanceof String)) {
      throw new API.DictionaryException("Cosmos.Dictionary: Language code" +
          "was not of type `string`.");
    }

    let split = code.split('_');
    for(let i = 0; i < split.length; ++i) {
      if(split[i].length !== 2) {
        throw new API.DictionaryException("Cosmos.Dictionary: Language code "+
            "did not have 2 Characters in a row separated by underscores (`_`)"
        );
      } else if(split[i].match(/[^a-z]/gi) !== null) {
        throw new API.DictionaryException("Cosmos.Dictionary: Found " +
            "non-alphanumeric character in language code.");
      }
    }

    this.languages_[code] = {length_:0,lang_:this.languages_.length_};
    this.languages_.length_++;
  }

  API.Dictionary.prototype.setLanguage = function(code) {
    if(typeof code !== "string" && !(code instanceof String)) {
      throw new API.DictionaryException("Cosmos.Dictionary: Language code" +
          "was not of type `string`.");
    }

    let split = code.split('_');
    for(let i = 0; i < split.length; ++i) {
      if(split[i].length !== 2) {
        throw new API.DictionaryException("Cosmos.Dictionary: Language code "+
            "did not have 2 Characters in a row separated by underscores (`_`)"
        );
      } else if(split[i].match(/[^a-z]/gi) !== null) {
        throw new API.DictionaryException("Cosmos.Dictionary: Found " +
            "non-alphanumeric character in language code.");
      }
    }

    this.language_ = (this.languages_[code]||
        {length_:0,lang_:this.languages_.length});
  }

  API.Dictionary.prototype.registerEntry = function(code, ...strs) {
    if(typeof code !== "string" && !(code instanceof String)) {
      throw new API.DictionaryException("Cosmos.Dictionary: String code was" +
          "not of type `string`.");
    }

    if(code.match(/[^a-z]{1}[^a-z0-9.$_]+/gi) !== null) {
      throw new API.DictionaryException("Cosmos.Dictionary: String code for " +
          "entry fit the RegEx: /[^a-z]{1}[^a-z0-9.$_]+/gi. (It shouldn't)");
    }

    let languages = Object.keys(this.languages_);
    for(let i = 0; i < languages.length; ++i) {
      if(languages[i] === "length_") {languages.splice(i, 1);--i;
          continue;}

      if(strs[i] === undefined) {
        throw new API.DictionaryException("Cosmos.Dictionary: Not enough "+
            "strings in <this>.registerEntry(code, ...strs); use nullptr for " +
            "placeholder if needed.");
      }

      if(this.language_ === this.languages_[languages[i]]) {
        this.languages_[languages[i]][code] = strs[i];
        this.languages_[languages[i]].length_++;
        this.language_ = this.languages_[languages[i]];
      } else {
        this.languages_[languages[i]][code] = strs[i];
        this.languages_[languages[i]].length_++;
      }
    }
  }

  API.DictionaryException.prototype.deleteLanguage = function(code) {
    if(typeof code !== "string" && !(code instanceof String)) {
      throw new API.DictionaryException("Cosmos.Dictionary: Language code" +
          "was not of type `string`.");
    }

    let split = code.split('_');
    for(let i = 0; i < split.length; ++i) {
      if(split[i].length !== 2) {
        throw new API.DictionaryException("Cosmos.Dictionary: Language code "+
            "did not have 2 Characters in a row separated by underscores (`_`)"
        );
      } else if(split[i].match(/[^a-z]/gi) !== null) {
        throw new API.DictionaryException("Cosmos.Dictionary: Found " +
            "non-alphanumeric character in language code.");
      }
    }

    if(this.languages_[code] === undefined) {
      console.warn(
          "Cosmos.Dictionary: Language does not exist, cannot delete."
      );
    } else {
      this.languages_.length_--;
      if(this.language_ === this.languages_[code]) {
        this.language_ = {length_:0};
      }
      this.languages_[code] = undefined;
    }
  }

  API.Dictionary.prototype.read = function(code) {
    if(typeof code !== "string" && !(code instanceof String)) {
      throw new API.DictionaryException("Cosmos.Dictionary: String code was" +
          "not of type `string`.");
    }

    if(code.match(/[^a-z]{1}[^a-z0-9.$_]+/gi) !== null) {
      throw new API.DictionaryException("Cosmos.Dictionary: String code for " +
          "entry fit the RegEx: /[^a-z]{1}[^a-z0-9.$_]+/gi. (It shouldn't)");
    }

    if(this.language_.length_ === 0) {
      return null;
    } else {
      return this.language_[code];
    }
  }

  API.Dictionary.prototype.languageCount = function() {
    return this.languages_.length_;
  }

  API.Dictionary.prototype.keyCount = function() {
    let lang = Object.keys(this.languages_);
    if(lang.length === 1) return 0;
    else return this.languages_[lang[1]].length_;
  }

  API.Dictionary.loadJSON = function(obj) {
    if(typeof obj === "string" || obj instanceof String) {
      obj = JSON.parse(obj);
    }

    let dict = new API.Dictionary();

    let languages = Object.keys(obj);
    for(let i = 0; i < languages.length; ++i) {
      if(languages[i] === "length_") {
        languages.splice(i, 1);
        --i;
        continue;
      }

      dict.appendLanguage(languages[i]);
    }

    let keys = [];
    for(let i = 0; i < languages.length; ++i) {
      let key_temp = Object.keys(languages[i]);
      for(let j = 0; j < languages[i].length_; ++i) {
        if(languages[i][key_temp[i]] === "length_") {
          key_temp.splice(i, 1);
          --i;
          continue;
        }
        let exists_already = false;
        for(let k = 0; k < keys.length; ++k) {
          if(keys[k] === key_temp[i]) {
            exists_already = true;
            break;
          }
        }

        if(!exists_already) {
          keys.push(key_temp[i]);
        }
      }
    }

    //HACK: Load items properly

    dict.languages_ = obj;

    return dict;
  };

  API.Whitelist = function(list) {
    this.list = (list||[]);
    this.len = this.list.length;
  }

  API.Whitelist.prototype.append = function(item) {
    this.list.push(item||0);
    this.len++;
  }

  API.Whitelist.prototype.remove = function(item) {
    for(let i = 0; i < this.list.length; ++i) {
      if(this.list[i] === item) {
        this.list.splice(i, 1);
        --i;
        continue;
      }
    }
  }

  API.Whitelist.prototype.test = function(id) {
    let allowed = false; // Whitelist; Not allowed until found allowed

    for(let i = 0; i < this.list.length; ++i) {
      if(this.list[i] === id) {allowed = true; break;}
    }

    return allowed;
  }

  API.Blacklist = function(list) {
    this.list = (list||[]);
    this.len = this.list.length;
  }

  API.Blacklist.prototype.append = function(item) {
    this.list.push(item||0);
    this.len++;
  }

  API.Blacklist.prototype.remove = function(item) {
    for(let i = 0; i < this.list.length; ++i) {
      if(this.list[i] === item) {
        this.list.splice(i, 1);
        --i;
        continue;
      }
    }
  }

  API.Blacklist.prototype.test = function(id) {
    let allowed = true; // Blacklist; Allowed until found not allowed

    for(let i = 0; i < this.list.length; ++i) {
      if(this.list[i] === id) {allowed = false; break;}
    }

    return allowed;
  }

  API.Timer = function(start_time, end_time, end_callback) {
    this.time = (start_time||0); // Stored as seconds
    this.etime = Infinity;
    this.end_callback = (end_callback||function(){});
    if(end_time !== undefined) {
      this.etime = end_time;
    }

    // Internals
    this.last = -1;
    this.now = 0;
    this.delta = 0;
  }

  API.Timer.prototype.step = function() {
    if(this.last === -1) {
      this.last = +new Date;
    }

    this.now = +new Date;
    this.delta = this.now-this.last;

    this.time += this.delta/1000;
    if(this.etime <= this.time) {
      this.step = function() {};
      this.end_callback();
    }
  }

  API.alert = function(title, message, ok_callback, cancel_callback) {
    if(!API.internals.alertBoxUtils) {
      console.warn(
          "Cosmos: It looks like you tried to alert before things were ready."
      );

      return -1;
    }

    API.internals.alertBoxUtils.back.style.display = "block";
    API.internals.alertBoxUtils.box.style.display = "block";
    if(!cancel_callback) {
      document.querySelector("#cosmos_alertCancel").style.display = "none";
    }

    document.querySelector("#cosmos_alertTitle").innerText = title;
    document.querySelector("#cosmos_alertMessage").innerText = message;

    API.internals.alertBoxUtils.ok_callback = ok_callback;
    API.internals.alertBoxUtils.cancel_callback = cancel_callback;
  }

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

  ////////////////////////////////////Engine////////////////////////////////////

  API.TickingEngine = function(tick_func, fps) {
    this.tick = (tick_func||function(){});

    // Internals
    this.lastTime = 0;
    this.currentTime = 0;
    this.delta = 0;
    this.fps = fps;
    this.tickTime = 1000/fps;
  }

  API.TickingEngine.prototype.run = function(timestamp) {
    this.currentTime = +new Date;
    this.delta += this.currentTime-this.lastTime;

    if(this.delta >= this.tickTime) {
      this.tick.call(this, 1000/this.delta);

      this.delta -= this.tickTime;
    }

    this.lastTime = this.currentTime;

    requestAnimationFrame((timestamp) => {
      this.run.call(this, timestamp);
    });
  }

  API.TickingEngine.prototype.start = function() {
    this.lastTime = +new Date;
    requestAnimationFrame((timestamp) => {
      this.run.call(this, timestamp);
    });
  }

  API.GameEngine = function(update_func, render_func, fps, width, height) {
    this.update = (update_func||function(){});
    this.render = (render_func||function(){});
    this.r = new API.Renderer(this, width, height);

    // Internals
    this.lastTime = 0;
    this.currentTime = 0;
    this.delta = 0;
    this.fps = fps;
    this.tickTime = 1000/fps;
  }

  API.GameEngine.prototype.run = function(timestamp) {
    this.currentTime = +new Date;
    this.delta += this.currentTime-this.lastTime;

    if(this.delta >= this.tickTime) {
      this.update.call(this, this.delta);
      this.render.call(this, this.r, this.delta);

      this.delta -= this.tickTime;
    }

    this.lastTime = this.currentTime;

    requestAnimationFrame((timestamp) => {
      this.run.call(this, timestamp);
    });
  }

  API.GameEngine.prototype.start = function() {
    this.lastTime = +new Date;
    requestAnimationFrame((timestamp) => {
      this.run.call(this, timestamp);
    });
  }

  ///////////////////////////////////Graphics///////////////////////////////////
  API.Color = function(...codes) {
    let c = Array.from(codes);
    if(codes.length === 1 && codes[0] instanceof Array) {
      c = Array.from(codes[0]);
    }
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 1;
    if(c.length === 0);
    else if(c.length === 1) {
      c[0] /= 255;
      r = c[0];
      g = c[0];
      b = c[0];
    } else if(c.length === 2) {
      c[0] /= 255;
      c[1] /= 255;
      r = c[0];
      g = c[0];
      b = c[0];
      a = c[1];
    } else if(c.length === 3) {
      c[0] /= 255;
      c[1] /= 255;
      c[2] /= 255;
      r = c[0];
      g = c[1];
      b = c[2];
    } else if(c.length >= 4) {
      c[0] /= 255;
      c[1] /= 255;
      c[2] /= 255;
      c[3] /= 255;
      r = c[0];
      g = c[1];
      b = c[2];
      a = c[3];
    }

    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;

    this.canvasColorCode_ = `rgba(${r*255}, ${g*255}, ${b*255}, ${a})`;
  }

  API.Color.prototype.newColor = function(...codes) {
    let c = Array.from(codes);
    if(codes.length === 1 && codes[0] instanceof Array) {
      c = Array.from(codes[0]);
    }
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 1;
    if(c.length === 0);
    else if(c.length === 1) {
      c[0] /= 255;
      r = c[0];
      g = c[0];
      b = c[0];
    } else if(c.length === 2) {
      c[0] /= 255;
      c[1] /= 255;
      r = c[0];
      g = c[0];
      b = c[0];
      a = c[1];
    } else if(c.length === 3) {
      c[0] /= 255;
      c[1] /= 255;
      c[2] /= 255;
      r = c[0];
      g = c[1];
      b = c[2];
    } else if(c.length >= 4) {
      c[0] /= 255;
      c[1] /= 255;
      c[2] /= 255;
      c[3] /= 255;
      r = c[0];
      g = c[1];
      b = c[2];
      a = c[3];
    }

    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;

    this.canvasColorCode_ = `rgba(${r*255}, ${g*255}, ${b*255}, ${a})`;
  }

  API.Color.prototype.cc = function() {
    return this.canvasColorCode_;
  }

  API.color = function(...codes) {
    return new API.Color(codes);
  }

  API.Renderer = function(engine, w, h) {
    this.engine = engine;
    w = (w||100);
    h = (h||100);
    this.w = w;
    this.h = h;

    this.canvas = document.createElement("canvas");
    this.canvasParent = document.body;

    this.canvas.setAttribute("width", w);
    this.canvas.setAttribute("height", h);

    document.body.appendChild(this.canvas);

    this.c = this.canvas.getContext("2d");

    this.fillColor_ = API.color(255);
    this.strokeColor_ = API.color(0);
    this.textColor_ = API.color(0);

    this.RectMode = new API.Enum("corner", "corners", "center");
    this.EllipseMode = this.RectMode;
    this.CapMode = new API.Enum("butt", "round", "square");
    this.JoinMode = new API.Enum("butt", "round", "square", "miter");

    this.rectMode_ = this.RectMode.CORNER;
    this.ellipseMode_ = this.EllipseMode.CENTER;

    this.strokeWeight_ = 1;
    this.lineCap_ = this.CapMode.BUTT;
    this.lineJoin_ = this.JoinMode.MITER;
    this.miterLimit_ = 10;
  }

  API.Renderer.prototype.placeCanvas = function(selector) {
    let elt = document.querySelector(selector);
    this.canvasParent.removeChild(this.canvas);
    elt.appendChild(this.canvas);
    this.canvasParent = elt;
    return elt;
  }

  API.Renderer.prototype.border = function() {
    this.canvas.style.border = "1px solid black";
  }

  API.Renderer.prototype.noBorder = function() {
    this.canvas.style.border = "none";
  }

  API.Renderer.prototype.fillColor = function(...colCodes) {
    this.fillColor_ = API.color.apply(undefined, colCodes);
  }

  API.Renderer.prototype.strokeColor = function(...colCodes) {
    this.strokeColor_ = API.color.apply(undefined, colCodes);
  }

  API.Renderer.prototype.textColor = function(...colCodes) {
    this.textColor_ = API.color.apply(undefined, colCodes);
  }

  API.Renderer.prototype.noFill = function() {
    this.fillColor_ = API.color(0, 0);
  }

  API.Renderer.prototype.noStroke = function() {
    this.strokeColor_ = API.color(0, 0);
  }

  API.Renderer.prototype.noText = function() {
    this.textColor_ = API.color(0, 0);
  }

  API.Renderer.prototype.rectMode = function(mode) {
    this.rectMode_ = mode;
  }

  API.Renderer.prototype.ellipseMode = function(mode) {
    this.ellipseMode_ = mode;
  }

  API.Renderer.prototype.strokeWeight = function(weight) {
    this.strokeWeight_ = weight;
  }

  API.Renderer.prototype.lineCap = function(cap) {
    this.lineCap_ = cap;
  }

  API.Renderer.prototype.lineJoin = function(join) {
    this.lineJoin_ = join;
  }

  API.Renderer.prototype.miterLimit = function(limit) {
    this.miterLimit_ = limit;
  }

  API.Renderer.prototype.background = function(...colCodes) {
    this.c.fillStyle = API.color(colCodes).cc();

    this.c.rect(0, 0, this.w, this.h);
    this.c.fill();
  }

  API.Renderer.prototype.rect = function(x, y, w, h, tl, tr, br, bl) {
    this.c.fillStyle = this.fillColor_.cc();
    this.c.strokeStyle = this.strokeColor_.cc();
    this.c.lineWidth = this.strokeWeight_;
    this.c.lineCap = this.lineCap_.value;
    this.c.lineJoin = this.lineJoin_.value;
    this.c.miterLimit = this.miterLimit_;

    switch(this.rectMode_) {
    case this.RectMode.CORNERS:
      w -= x;
      h -= y;
      break;
    case this.RectMode.CENTER:
      x += w/2;
      y += h/2;
      break;
    default:
      console.warn("Unknown RectMode type; resetting to RectMode.CORNER.");
      this.rectMode_ = this.RectMode.CORNER;
      break;
    }

    if(typeof tl === "undefined") {
      // Draw normal rect, no roundings
      this.c.rect(x, y, w, h);
      this.c.fill();
      this.c.stroke();

      return;
    }

    if(typeof tr === "undefined") {
      tr = tl;
      br = tl;
      bl = tl;
    } else if(typeof br === "undefined") {
      br = tl;
      bl = tr;
    } else if(typeof bl === "undefined") {
      bl = tl;
    }

    var hw = w / 2;
    var hh = h / 2;

    // Clip radii
    if (w < 2 * tl) {
      tl = hw;
    }
    if (h < 2 * tl) {
      tl = hh;
    }
    if (w < 2 * tr) {
      tr = hw;
    }
    if (h < 2 * tr) {
      tr = hh;
    }
    if (w < 2 * br) {
      br = hw;
    }
    if (h < 2 * br) {
      br = hh;
    }
    if (w < 2 * bl) {
      bl = hw;
    }
    if (h < 2 * bl) {
      bl = hh;
    }

    // Draw shape
    this.c.beginPath();
    this.c.moveTo(x + tl, y);
    this.c.arcTo(x + w, y, x + w, y + h, tr);
    this.c.arcTo(x + w, y + h, x, y + h, br);
    this.c.arcTo(x, y + h, x, y, bl);
    this.c.arcTo(x, y, x + w, y, tl);
    this.c.closePath();

    this.c.fill();
    this.c.stroke();
  }

  API.Renderer.prototype.ellipse = function(cx, cy, rx, ry) {
    this.c.fillStyle = this.fillColor_.cc();
    this.c.strokeStyle = this.strokeColor_.cc();
    this.c.lineWidth = this.strokeWeight_;
    this.c.lineCap = this.lineCap_.value;
    this.c.lineJoin = this.lineJoin_.value;
    this.c.miterLimit = this.miterLimit_;

    switch(this.ellipseMode_) {
    case this.EllipseMode.CORNER:
      cx += rx;
      cy += ry;
      break;
    case this.EllipseMode.CORNERS:
      rx -= cx;
      ry -= cy;
      cx += rx;
      cy += ry;
      break;
    default:
      console.warn(
          "Unknown EllipseMode type; resetting to EllipseMode.CENTER."
      );
      this.ellipseMode_ = this.EllipseMode.CENTER;
      break;
    }

    this.c.save(); // save state
    this.c.beginPath();

    this.c.translate(cx-rx, cy-ry);
    this.c.scale(rx, ry);
    this.c.arc(1, 1, 1, 0, 2 * Math.PI, false);

    this.c.restore(); // restore to original state
    this.c.fill();
    this.c.stroke();
  }

  API.Renderer.prototype.triangle = function(x1, y1, x2, y2, x3, y3) {
    this.c.fillStyle = this.fillColor_.cc();
    this.c.strokeStyle = this.strokeColor_.cc();
    this.c.lineWidth = this.strokeWeight_;
    this.c.lineCap = this.lineCap_.value;
    this.c.lineJoin = this.lineJoin_.value;
    this.c.miterLimit = this.miterLimit_;

    this.c.beginPath();
    this.c.moveTo(x1, y1);
    this.c.lineTo(x2, y2);
    this.c.lineTo(x3, y3);
    this.c.closePath();
    this.c.fill();
    this.c.stroke();
  }

  API.Renderer.prototype.point = function(x, y) {
    this.c.fillStyle = this.strokeColor_.cc();

    this.c.save(); // save state
    this.c.beginPath();

    this.c.translate(x-this.strokeWeight_,
        y-this.strokeWeight_);
    this.c.scale(this.strokeWeight_, this.strokeWeight_);
    this.c.arc(1, 1, 1, 0, 2 * Math.PI, false);

    this.c.restore(); // restore to original state
    this.c.fill();
  }

  API.Renderer.prototype.line = function(x1, y1, x2, y2) {
    this.c.strokeStyle = this.strokeColor_.cc();
    this.c.lineWidth = this.strokeWeight_;
    this.c.lineCap = this.lineCap_.value;

    this.c.beginPath();
    this.c.moveTo(x1, y1);
    this.c.lineTo(x2, y2);
    this.c.closePath();
    this.c.stroke();
  }

  API.Renderer.prototype.polygon = function(xs, ys, len) {
    this.c.fillStyle = this.fillColor_.cc();
    this.c.strokeStyle = this.strokeColor_.cc();
    this.c.lineWidth = this.strokeWeight_;
    this.c.lineCap = this.lineCap_.value;
    this.c.lineJoin = this.lineJoin_.value;
    this.c.miterLimit = this.miterLimit_;

    this.c.beginPath();

    if(len > 0) {
      this.c.moveTo(xs[0], ys[0]);
    } else {
      return;
    }

    for(let i = 1; i < len; ++i) {
      this.c.lineTo(xs[i], ys[i]);
    }

    this.c.lineTo(xs[0], ys[0]);

    this.c.closePath();
    this.c.fill();
    this.c.stroke();
  }

  return API;
})();

// LAW REQUIRES THAT YOU DO NOT MANIPULATE THIS CODE INTERNALLY OR EXTERNALLY
// FOR THE PURPOSES OF PERSONAL OR COMMERCIAL USE.
// COPYRIGHT NOTICE DISCLOSED BELOW:
// Copyright (c) 2019 Adrian Gjerstad. All terms are licensed by the
//                           MIT License.
function __cosmosWatermarkClick__(self) {
  // Send user to Cosmos official GitHub

  // You have been warned. Do not edit this code for any purpose. It is
  // required by law for any redistribution.
  // ---------------------------------------------------------------------------
  // Don't dig a deep hole for yourself.
  // ---------------------------------------------------------------------------

  self.style.background = "#C779D5";
  self.style.border = "1px solid 	#F25B19";
  self.onmouseenter = function() {};
  self.onmouseleave = function() {};

  window.location.href =
      "https://github.com/AdrianGjerstad/cosmos/blob/master/README.md";
}

window.onload = function() {
  // Cosmos Watermark Appearing for 5 Seconds in bottom right corner

  // You have been warned. Do not edit this code for any purpose. It is
  // required by law for any redistribution.
  // ---------------------------------------------------------------------------
  // Don't dig a deep hole for yourself.
  // ---------------------------------------------------------------------------

  let containing_div = document.createElement("div");
  containing_div.style.position = "fixed";
  containing_div.style.right = "0";
  containing_div.style.bottom = "0";
  containing_div.style.background = "#BBB";
  containing_div.style.color = "#333";
  containing_div.style.fontFamily =
      "Trebuchet, Verdana, Arial, Helvetica, sans-serif";
  containing_div.style.padding = "4px 8px 12px 28px";
  containing_div.style.borderRadius = "8px 0 0 0";
  document.body.style.overflowX = "hidden";
  containing_div.style.transition = "right 1s, background 1s, border 1s";
  containing_div.style.webkitTransition = "right 1s, background 1s, border 1s";
  containing_div.style.transitionTimingFunction = "ease";
  containing_div.style.webkitTransitionTimingFunction = "ease";
  containing_div.style.cursor = "pointer";
  containing_div.style.height = "32px"
  containing_div.style.zIndex = "9999";
  containing_div.innerHTML =
      "<span padding=\"4\" style=\"position:relative;top:-3px;\">" +
      "POWERED BY COSMOS&nbsp;</span>" +
      "<img src=" +
      "\"https://github.com/AdrianGjerstad/cosmos/blob/master/cosmos.png?" +
      "raw=true\" alt=\"Cosmos Logo\" width=\"28\" style=\""+
      "position:relative;bottom:-6px;"+
      "\"></img><br/><span style=\""+
      "position:relative;top:-13px;font-size:8px;text-align:right;"+
      "\">Click to learn more</span>";
  containing_div.onclick = ()=>{__cosmosWatermarkClick__(containing_div)};
  containing_div.style.userSelect = "none";
  containing_div.style.webkitUserSelect = "none";
  containing_div.style.msUserSelect = "none";
  containing_div.onmouseenter = function() {
    containing_div.style.background = "#DDD";
  };

  document.body.appendChild(containing_div);

  setTimeout(function() {
    containing_div.style.right = (-containing_div.offsetWidth+20) + "px";
    containing_div.onmouseenter = function() {
      containing_div.style.right = "0";
      containing_div.style.background = "#DDD";
    };
    containing_div.onmouseleave = function() {
      containing_div.style.right = (-containing_div.offsetWidth+20) + "px";
      containing_div.style.background = "#BBB";
    };
  }, 5000);

  // EDITING BELOW THIS SECTION IS PERMITTED, AS IT DOES NOT CONTRIBUTE TO THE
  // MARKING.

  Cosmos.internals.alertBoxUtils = Cm.internals.alertBoxUtils = (function() {
    let alertBox = document.createElement("div");
    let background = document.createElement("div");

    background.style.zIndex = "9998";
    background.style.background = "rgba(0, 0, 0, 0.5)";
    background.style.width = "100vw";
    background.style.height = "100vh";
    background.style.position = "fixed";
    background.style.top = "0";
    background.style.left = "0";

    alertBox.style.width = "50vw";
    alertBox.style.height = "50vh";
    alertBox.style.zIndex = "9999";
    alertBox.style.background = "#FFF";
    alertBox.style.position = "fixed";
    alertBox.style.top = "25vh";
    alertBox.style.left = "25vw";
    alertBox.style.borderRadius = "10px";

    alertBox.innerHTML =
        "<div style=\"height:40px;width:100%;background:#1AF;"+
        "border-radius:10px 10px 0 0;\""+
        "><span id=\"cosmos_alertTitle\" style=\""+
        "font-family:Trebuchet,Verdana,Arial,Helvetica,sans-serif;"+
        "font-size:20px;position:relative;top:6px;left:8px;color:white;"+
        "\">Cosmos Says:</span><span id=\"cosmos_alertClose\""+
        "style=\"float:right;position:relative;top:5px;right:5px;"+
        "font-size:30px;background:#DDD;transition:background 1s;"+
        "-webkit-transition:background 1s;border-radius:200px;width:30px;"+
        "height:30px;transition-timing-function:ease;cursor:pointer;"+
        "-webkit-transition-timing-function:ease;"+
        "\">"+
        "<span style=\"position:relative;top:-2px;right:-6px;"+
        "user-select:none;-webkit-user-select:none;-ms-user-select:none;"+
        "color\">&times;</span></div><span id=\"cosmos_alertMessage\" style=\""+
        "width:48vw;height:30vh;overflow:scroll;position:fixed;"+
        "top:35vh;left:26vw;text-align:center;"+
        "font-family:Trebuchet,Verdana,Arial,Helvetica,sans-serif;"+
        "\">If you see this, a glitch may have just occurred. "+
        "Please alert the developer of this. Don't worry! Just, press close."+
        "</span><div id=\"cosmos_alertCancel\" style=\""+
        "position:fixed;left:26vw;top:66vh;width:23.5vw;height:8vh;"+
        "background:#1AF;border-radius:10px;cursor:pointer;"+
        "transition:background 1s;"+
        "-webkit-transition:background 1s;"+
        "transition-timing-function:ease;"+
        "-webkit-transition-timing-function:ease;"+
        "\"><span style=\""+
        "position:relative;top:2.8vh;left:10vw;color:white;"+
        "font-family:Trebuchet,Verdana,Arial,Helvetica,sans-serif;"+
        "user-select:none;-webkit-user-select:none;-ms-user-select:none;"+
        "\">Cancel</span></div>"+
        "<div id=\"cosmos_alertOK\" style=\""+
        "position:fixed;left:50.5vw;top:66vh;width:23.5vw;height:8vh;"+
        "background:#1AF;border-radius:10px;cursor:pointer;"+
        "transition:background 1s;"+
        "-webkit-transition:background 1s;"+
        "transition-timing-function:ease;"+
        "-webkit-transition-timing-function:ease;"+
        "\"><span style=\""+
        "position:relative;top:2.8vh;left:10vw;color:white;"+
        "font-family:Trebuchet,Verdana,Arial,Helvetica,sans-serif;"+
        "user-select:none;-webkit-user-select:none;-ms-user-select:none;"+
        "\">Okay</span></div>"

    background.style.display = "none";
    alertBox.style.display = "none";

    document.body.appendChild(background);
    document.body.appendChild(alertBox);

    document.querySelector("#cosmos_alertClose").onmouseenter = function() {
      this.style.background = "#FFF";
    }

    document.querySelector("#cosmos_alertClose").onmouseleave = function() {
      this.style.background = "#DDD";
    }

    document.querySelector("#cosmos_alertCancel").onmouseenter = function() {
      this.style.background = "#3CF";
    }

    document.querySelector("#cosmos_alertCancel").onmouseleave = function() {
      this.style.background = "#1AF";
    }

    document.querySelector("#cosmos_alertOK").onmouseenter = function() {
      this.style.background = "#3CF";
    }

    document.querySelector("#cosmos_alertOK").onmouseleave = function() {
      this.style.background = "#1AF";
    }

    document.querySelector("#cosmos_alertClose").onpointerdown = function() {
      background.style.display = "none";
      alertBox.style.display = "none";
      alertBox.innerHTML =
        "<div style=\"height:40px;width:100%;background:#1AF;"+
        "border-radius:10px 10px 0 0;\""+
        "><span id=\"cosmos_alertTitle\" style=\""+
        "font-family:Trebuchet,Verdana,Arial,Helvetica,sans-serif;"+
        "font-size:20px;position:relative;top:6px;left:8px;color:white;"+
        "\">Cosmos Says:</span><span id=\"cosmos_alertClose\""+
        "style=\"float:right;position:relative;top:5px;right:5px;"+
        "font-size:30px;background:#DDD;transition:background 1s;"+
        "-webkit-transition:background 1s;border-radius:200px;width:30px;"+
        "height:30px;transition-timing-function:ease;cursor:pointer;"+
        "-webkit-transition-timing-function:ease;"+
        "\">"+
        "<span style=\"position:relative;top:-2px;right:-6px;"+
        "user-select:none;-webkit-user-select:none;-ms-user-select:none;"+
        "color\">&times;</span></div><span id=\"cosmos_alertMessage\" style=\""+
        "width:48vw;height:30vh;overflow:scroll;position:fixed;"+
        "top:35vh;left:26vw;text-align:center;"+
        "font-family:Trebuchet,Verdana,Arial,Helvetica,sans-serif;"+
        "\">If you see this, a glitch may have just occurred. "+
        "Please alert the developer of this. Don't worry! Just, press close."+
        "</span><div id=\"cosmos_alertCancel\" style=\""+
        "position:fixed;left:26vw;top:66vh;width:23.5vw;height:8vh;"+
        "background:#1AF;border-radius:10px;cursor:pointer;"+
        "transition:background 1s;"+
        "-webkit-transition:background 1s;"+
        "transition-timing-function:ease;"+
        "-webkit-transition-timing-function:ease;"+
        "\"><span style=\""+
        "position:relative;top:2.8vh;left:10vw;color:white;"+
        "font-family:Trebuchet,Verdana,Arial,Helvetica,sans-serif;"+
        "user-select:none;-webkit-user-select:none;-ms-user-select:none;"+
        "\">Cancel</span></div>"+
        "<div id=\"cosmos_alertOK\" style=\""+
        "position:fixed;left:50.5vw;top:66vh;width:23.5vw;height:8vh;"+
        "background:#1AF;border-radius:10px;cursor:pointer;"+
        "transition:background 1s;"+
        "-webkit-transition:background 1s;"+
        "transition-timing-function:ease;"+
        "-webkit-transition-timing-function:ease;"+
        "\"><span style=\""+
        "position:relative;top:2.8vh;left:10vw;color:white;"+
        "font-family:Trebuchet,Verdana,Arial,Helvetica,sans-serif;"+
        "user-select:none;-webkit-user-select:none;-ms-user-select:none;"+
        "\">Okay</span></div>";
    }

    document.querySelector("#cosmos_alertCancel").onpointerdown = function() {
      background.style.display = "none";
      alertBox.style.display = "none";
      Cm.internals.alertBoxUtils.cancel_callback();
      Cm.internals.alertBoxUtils.cancel_callback = function() {};
      Cm.internals.alertBoxUtils.ok_callback();
      Cm.internals.alertBoxUtils.ok_callback = function() {};
      alertBox.innerHTML =
        "<div style=\"height:40px;width:100%;background:#1AF;"+
        "border-radius:10px 10px 0 0;\""+
        "><span id=\"cosmos_alertTitle\" style=\""+
        "font-family:Trebuchet,Verdana,Arial,Helvetica,sans-serif;"+
        "font-size:20px;position:relative;top:6px;left:8px;color:white;"+
        "\">Cosmos Says:</span><span id=\"cosmos_alertClose\""+
        "style=\"float:right;position:relative;top:5px;right:5px;"+
        "font-size:30px;background:#DDD;transition:background 1s;"+
        "-webkit-transition:background 1s;border-radius:200px;width:30px;"+
        "height:30px;transition-timing-function:ease;cursor:pointer;"+
        "-webkit-transition-timing-function:ease;"+
        "\">"+
        "<span style=\"position:relative;top:-2px;right:-6px;"+
        "user-select:none;-webkit-user-select:none;-ms-user-select:none;"+
        "color\">&times;</span></div><span id=\"cosmos_alertMessage\" style=\""+
        "width:48vw;height:30vh;overflow:scroll;position:fixed;"+
        "top:35vh;left:26vw;text-align:center;"+
        "font-family:Trebuchet,Verdana,Arial,Helvetica,sans-serif;"+
        "\">If you see this, a glitch may have just occurred. "+
        "Please alert the developer of this. Don't worry! Just, press close."+
        "</span><div id=\"cosmos_alertCancel\" style=\""+
        "position:fixed;left:26vw;top:66vh;width:23.5vw;height:8vh;"+
        "background:#1AF;border-radius:10px;cursor:pointer;"+
        "transition:background 1s;"+
        "-webkit-transition:background 1s;"+
        "transition-timing-function:ease;"+
        "-webkit-transition-timing-function:ease;"+
        "\"><span style=\""+
        "position:relative;top:2.8vh;left:10vw;color:white;"+
        "font-family:Trebuchet,Verdana,Arial,Helvetica,sans-serif;"+
        "user-select:none;-webkit-user-select:none;-ms-user-select:none;"+
        "\">Cancel</span></div>"+
        "<div id=\"cosmos_alertOK\" style=\""+
        "position:fixed;left:50.5vw;top:66vh;width:23.5vw;height:8vh;"+
        "background:#1AF;border-radius:10px;cursor:pointer;"+
        "transition:background 1s;"+
        "-webkit-transition:background 1s;"+
        "transition-timing-function:ease;"+
        "-webkit-transition-timing-function:ease;"+
        "\"><span style=\""+
        "position:relative;top:2.8vh;left:10vw;color:white;"+
        "font-family:Trebuchet,Verdana,Arial,Helvetica,sans-serif;"+
        "user-select:none;-webkit-user-select:none;-ms-user-select:none;"+
        "\">Okay</span></div>";
    }

    document.querySelector("#cosmos_alertOK").onpointerdown = function() {
      background.style.display = "none";
      alertBox.style.display = "none";
      Cm.internals.alertBoxUtils.cancel_callback();
      Cm.internals.alertBoxUtils.cancel_callback = function() {};
      Cm.internals.alertBoxUtils.ok_callback();
      Cm.internals.alertBoxUtils.ok_callback = function() {};
      alertBox.innerHTML =
        "<div style=\"height:40px;width:100%;background:#1AF;"+
        "border-radius:10px 10px 0 0;\""+
        "><span id=\"cosmos_alertTitle\" style=\""+
        "font-family:Trebuchet,Verdana,Arial,Helvetica,sans-serif;"+
        "font-size:20px;position:relative;top:6px;left:8px;color:white;"+
        "\">Cosmos Says:</span><span id=\"cosmos_alertClose\""+
        "style=\"float:right;position:relative;top:5px;right:5px;"+
        "font-size:30px;background:#DDD;transition:background 1s;"+
        "-webkit-transition:background 1s;border-radius:200px;width:30px;"+
        "height:30px;transition-timing-function:ease;cursor:pointer;"+
        "-webkit-transition-timing-function:ease;"+
        "\">"+
        "<span style=\"position:relative;top:-2px;right:-6px;"+
        "user-select:none;-webkit-user-select:none;-ms-user-select:none;"+
        "color\">&times;</span></div><span id=\"cosmos_alertMessage\" style=\""+
        "width:48vw;height:30vh;overflow:scroll;position:fixed;"+
        "top:35vh;left:26vw;text-align:center;"+
        "font-family:Trebuchet,Verdana,Arial,Helvetica,sans-serif;"+
        "\">If you see this, a glitch may have just occurred. "+
        "Please alert the developer of this. Don't worry! Just, press close."+
        "</span><div id=\"cosmos_alertCancel\" style=\""+
        "position:fixed;left:26vw;top:66vh;width:23.5vw;height:8vh;"+
        "background:#1AF;border-radius:10px;cursor:pointer;"+
        "transition:background 1s;"+
        "-webkit-transition:background 1s;"+
        "transition-timing-function:ease;"+
        "-webkit-transition-timing-function:ease;"+
        "\"><span style=\""+
        "position:relative;top:2.8vh;left:10vw;color:white;"+
        "font-family:Trebuchet,Verdana,Arial,Helvetica,sans-serif;"+
        "user-select:none;-webkit-user-select:none;-ms-user-select:none;"+
        "\">Cancel</span></div>"+
        "<div id=\"cosmos_alertOK\" style=\""+
        "position:fixed;left:50.5vw;top:66vh;width:23.5vw;height:8vh;"+
        "background:#1AF;border-radius:10px;cursor:pointer;"+
        "transition:background 1s;"+
        "-webkit-transition:background 1s;"+
        "transition-timing-function:ease;"+
        "-webkit-transition-timing-function:ease;"+
        "\"><span style=\""+
        "position:relative;top:2.8vh;left:10vw;color:white;"+
        "font-family:Trebuchet,Verdana,Arial,Helvetica,sans-serif;"+
        "user-select:none;-webkit-user-select:none;-ms-user-select:none;"+
        "\">Okay</span></div>";
    }

    return {box: alertBox, back: background,
        ok_callback: function(){}, cancel_callback: function() {}};
  })();
}
