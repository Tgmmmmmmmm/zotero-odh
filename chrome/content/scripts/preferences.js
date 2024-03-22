initZPDFTranslatePreferences = function () {
  Zotero.debug("zoteroodh: Initialize preferences.");
  Zotero.zoteroodh.resetState();
  // Store current secret
  let userSecrets = JSON.parse(
    Zotero.Prefs.get("zoteroodh.secretObj")
  );
  userSecrets[Zotero.Prefs.get("zoteroodh.translateSource")] =
    Zotero.Prefs.get("zoteroodh.secret");
  Zotero.Prefs.set("zoteroodh.secretObj", JSON.stringify(userSecrets));
  buildLanguageSettings();
  updatePreviewPannel();
};

buildLanguageSettings = function () {
  let SLMenuList = document.getElementById(
    "zotero-prefpane-zoteroodh-settings-translate-sl"
  );
  let SLMenuPopup = document.createElement("menupopup");
  let sl = Zotero.Prefs.get("zoteroodh.sourceLanguage");
  let slIndex = 0;

  let TLMenuList = document.getElementById(
    "zotero-prefpane-zoteroodh-settings-translate-tl"
  );
  let TLMenuPopup = document.createElement("menupopup");
  let tl = Zotero.Prefs.get("zoteroodh.targetLanguage");
  let tlIndex = 0;

  let i = 0;
  for (let lang of Zotero.zoteroodh.translate.LangCultureNames) {
    let SLMenuItem = document.createElement("menuitem");
    SLMenuItem.setAttribute("label", lang.DisplayName);
    SLMenuItem.setAttribute("value", lang.LangCultureName);
    SLMenuItem.addEventListener("command", (e) => {
      let newSL = e.target.value;
      Zotero.Prefs.set("zoteroodh.sourceLanguage", newSL);
    });
    if (lang.LangCultureName == sl) {
      slIndex = i;
    }

    let TLMenuItem = document.createElement("menuitem");
    TLMenuItem.setAttribute("label", lang.DisplayName);
    TLMenuItem.setAttribute("value", lang.LangCultureName);
    TLMenuItem.addEventListener("command", (e) => {
      let newTL = e.target.value;
      Zotero.Prefs.set("zoteroodh.targetLanguage", newTL);
    });
    if (lang.LangCultureName == tl) {
      tlIndex = i;
    }

    SLMenuPopup.appendChild(SLMenuItem);
    TLMenuPopup.appendChild(TLMenuItem);
    i += 1;
  }
  SLMenuList.appendChild(SLMenuPopup);
  TLMenuList.appendChild(TLMenuPopup);

  SLMenuList.selectedIndex = slIndex;
  TLMenuList.selectedIndex = tlIndex;
};

updateSourceParam = function () {
  Zotero.debug("zoteroodh: updateSourceParam.");
  let menu = document.getElementById(
    "zotero-prefpane-zoteroodh-settings-translate-source"
  );
  let param = document.getElementById(
    "zotero-prefpane-zoteroodh-settings-translate-param"
  );

  let userSecrets = JSON.parse(
    Zotero.Prefs.get("zoteroodh.secretObj")
  );
  let secret = "";
  if (userSecrets.hasOwnProperty(menu.value)) {
    secret = userSecrets[menu.value];
  } else {
    secret = Zotero.zoteroodh.translate.defaultSecret[menu.value];
    userSecrets[menu.value] = secret;
    Zotero.Prefs.set(
      "zoteroodh.secretObj",
      JSON.stringify(userSecrets)
    );
  }
  param.value = secret;
  Zotero.Prefs.set("zoteroodh.secret", secret);
};

updatePreviewPannel = function () {
  Zotero.debug("zoteroodh: updatePreviewPannel.");
  let pannel = document.getElementById(
    "zotero-prefpane-zoteroodh-settings-preview"
  );
  let text = document.getElementById(
    "zotero-prefpane-zoteroodh-settings-font-size"
  );
  pannel.style["font-size"] = `${parseInt(text.value)}px`;
};
