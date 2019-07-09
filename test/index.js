try {
  let wl = new Cm.Whitelist(["foo", "baz"]);
  alert(wl.test("foo") + " " + wl.test("bar") + " " + wl.test("baz"));
  // true false true

  let bl = new Cm.Blacklist(["foo"]);
  alert(bl.test("foo") + " " + bl.test("bar") + " " + bl.test("baz"));
  // false true true
} catch(e) {
  alert("Oops! An error occured!\n" + e.name + ": " + e.message);
}