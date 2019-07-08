try {
  let dict = Cm.Dictionary.loadJSON(
    {length_:2,en_US:{length_:2,lang_:0,hello:"Hello",bye:"Bye"},es_MX:{length_:2,lang_:1,hello:"Hola",bye:"Adios"}}
  );

  dict.setLanguage("en_US");

  alert(dict.read("hello") + " " + dict.read("bye"));
  dict.setLanguage("es_MX");
  alert(dict.read("hello") + " " + dict.read("bye"));
  alert(dict.languageCount() + " " + dict.keyCount());
} catch(e) {
  alert("Oops! An error occured!\n" + e.name + ": " + e.message);
}