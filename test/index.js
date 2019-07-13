try {
  let testImageSrc = "../cosmos.png";
  let testImage;
  Cosmos.mediaLoader = function() {
    testImage = Cosmos.loadImage(testImageSrc);
  };
  Cosmos.ready = function() {
    let engine = new Cosmos.GameEngine(
    function(d) {

    },
    function(r, d) {
      r.background(200);
      r.translate(r.w/2, r.h/2);
      r.rotate(Math.PI/4);
      r.image(testImage, 0, 0);
    },
    60, 512, 512);
    engine.r.border();
    engine.start();
  };
} catch(e) {
  alert("Oops! An error occured!\n" + e.name + ": " + e.message);
}