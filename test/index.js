let testImageSrc = "../cosmos.png";
let testImage;
Cosmos.mediaLoader = function() {
  testImage = Cosmos.loadImage(testImageSrc);
  Cm.alertOfError(()=>{throw new Error("foo");});
};
Cosmos.ready = function() {
  let engine = new Cosmos.GameEngine(
  function(d) {

  },
  function(r, d) {
    r.background(200);
    r.translate(r.w, r.h);
    r.rotate(Math.PI);
    r.image(testImage, 0, 0);
  },
  60, 512, 512);
  engine.r.border();
  engine.start();
};