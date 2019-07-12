try {
  let testImageSrc = "https://www.w3schools.com/jsref/img_the_scream.jpg";
  let testImage;
  Cm.mediaLoader = function() {
    testImage = Cm.loadImage(testImageSrc);
  };
  Cm.ready = function() {
    let engine = new Cm.GameEngine(
    function(d) {
      Cm.alert("Test", JSON.stringify(testImage));
    },
    function(r, d) {
      r.background(200);
      r.image(testImage, 0, 0);
    },
    60, 220, 277);
    engine.r.border();
    engine.start();
  };
} catch(e) {
  alert("Oops! An error occured!\n" + e.name + ": " + e.message);
}