let testFont;
Cosmos.mediaLoader = function() {
  testFont = Cosmos.Font("serif", 16);
};
Cosmos.ready = function() {
  let engine = new Cosmos.GameEngine(
  function(d) {

  },
  function(r, d) {
    r.background(200);
    r.font(testFont, true);
    r.text(255, 0, 0);
    Cosmos.alertOfError(()=>{r.drawText("Hello, World!", 50, 50)});
  },
  60, 512, 512);
  engine.r.border();
  engine.start();
};