try {
  let engine = new Cm.GameEngine(
  function(d) {

  },
  function(r, d) {
    r.background(200);
    r.fillColor(255);
    r.strokeColor(0);
    r.strokeWeight(1);
    r.rect(10, 10, 50, 50, 10);
    r.fillColor(0, 255, 0);
    r.ellipse(50, 50, 20, 20);
    r.fillColor(255, 255, 0);
    r.triangle(0, 0, r.w, 0, r.w/2, r.h);
    r.strokeColor(255, 0, 0);
    r.point(50, 50);
    r.strokeColor(0, 0, 255);
    r.line(0, 0, r.w, r.h);
    r.polygon([
      r.w/2,
      r.w,
      r.w/5*4,
      r.w/5,
      0
    ],[
      0,
      r.h/2.4,
      r.h,
      r.h,
      r.h/2.4,
    ], 5);
  },
  60, 100, 100);
  engine.r.border();
  engine.start();
} catch(e) {
  alert("Oops! An error occured!\n" + e.name + ": " + e.message);
}