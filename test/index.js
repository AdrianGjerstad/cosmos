try {
  let timer = new Cm.Timer();
  timer.step();

  setTimeout(function() {
    timer.step();
    alert("0s - " + timer.time + "s");
  }, 3140); // 1000ms, change as you want.
} catch(e) {
  alert("Oops! An error occured!\n" + e.name + ": " + e.message);
}