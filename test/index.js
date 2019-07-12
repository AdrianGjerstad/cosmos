try {
  let engine = new Cm.GameEngine(
  function(d) {

  },
  function(r, d) {
    r.background(200);
    r.rect(10, 10, 50, 50, 10);
  },
  60);
  engine.start();
} catch(e) {
  alert("Oops! An error occured!\n" + e.name + ": " + e.message);
}