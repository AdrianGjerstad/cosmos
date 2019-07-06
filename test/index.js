try {
  let seeder = Cosmos.PRNG.xmur3("this is a test of the xmur3 mixer");
  let prng = Cosmos.PRNG.sfc32(seeder(), seeder(), seeder(), seeder());
  alert(prng() + " " + prng() + " " + prng() + " " + prng());
} catch(e) {
  alert("Oops! An error occured!\n" + e.name + ": " + e.message);
}