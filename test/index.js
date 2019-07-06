try {
  let mf = new Cosmos.MathFunction(function(x) {
    return x*x;
  });

  alert(Cm.integral(mf, 0, 1, 0.0000001).integral);
} catch(e) {
  alert("Oops! An error occured!\n" + e.name + ": " + e.message);
}