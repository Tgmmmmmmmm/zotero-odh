if (!Zotero.zoteroodh) {
  var fileLoader = Components.classes[
    "@mozilla.org/moz/jssubscript-loader;1"
  ].getService(Components.interfaces.mozIJSSubScriptLoader);
  // events.js is the main constructor script
  var scripts = ["events", "translate", "view", "reader"];
  scripts.forEach((s) =>
    fileLoader.loadSubScript(
      "chrome://zoteroodh/content/scripts/" + s + ".js",
      {},
      "UTF-8"
    )
  );
}

window.addEventListener(
  "load",
  async function (e) {
    Zotero.zoteroodh.init();
  },
  false
);
