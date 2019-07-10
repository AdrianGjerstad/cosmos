try {
  let ui = 0;
  let ri = 0;
  let engine = new Cm.GameEngine(
  function(d) {
    ui++;
  },
  function(r, d) {
    ri++;
  },
  60);
  engine.start();

  setTimeout(function() {
    Cm.alert("Test:", ui + "/60 " + ri + "/60");
  }, 1000);
} catch(e) {
  alert("Oops! An error occured!\n" + e.name + ": " + e.message);
}