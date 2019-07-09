try {
  /*let index = 0;
  let ticking_engine = new Cm.TickingEngine(function() {
    index++;
  }, 60);
  ticking_engine.start();

  setTimeout(function() {
    alert("Called " + index + " times");
  }, 1000);*/
  setTimeout(function() {
    Cm.alert("foo", "bar");
  }, 1000);
} catch(e) {
  alert("Oops! An error occured!\n" + e.name + ": " + e.message);
}