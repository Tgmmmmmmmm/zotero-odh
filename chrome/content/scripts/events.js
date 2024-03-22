Zotero.zoteroodh = {
  _sourceText: "",
  _translatedText: "",
  _debug: "",
  _readerSelect: 0,

  init: async function () {
    Zotero.debug("zoteroodh: init called");

    Zotero.zoteroodh.resetState();

    Zotero.zoteroodh.onWindowReaderCheck();

    // Register the callback in Zotero as an item observer
    var notifierID = Zotero.Notifier.registerObserver(
      Zotero.zoteroodh.notifierCallback,
      ["tab", "item", "file"]
    );

    // Unregister callback when the window closes (important to avoid a memory leak)
    window.addEventListener(
      "unload",
      function (e) {
        Zotero.Notifier.unregisterObserver(notifierID);
      },
      false
    );

    Zotero.zoteroodh.initKeys();

    Zotero.zoteroodh.view.updateTranslatePanel();
  },

  notifierCallback: {
    // Call view.updateTranslatePanels when a tab is added or selected
    notify: async function (event, type, ids, extraData) {
      if (
        event == "select" &&
        type == "tab" &&
        extraData[ids[0]].type == "reader"
      ) {
        Zotero.debug("zoteroodh: open attachment event detected.");
        Zotero.zoteroodh.onReaderSelect();
      }
      if (
        (event == "close" && type == "tab") ||
        (event == "open" && type == "file")
      ) {
        Zotero.debug("zoteroodh: open window event detected.");
        Zotero.zoteroodh.onWindowReaderCheck();
        setTimeout(Zotero.zoteroodh.onWindowReaderCheck, 1000);
      }
      if (event == "add" && type == "item") {
        Zotero.debug("zoteroodh: add annotation event detected.");
        // Disable the reader loading annotation update
        if (
          new Date().getTime() - Zotero.zoteroodh._readerSelect <
          3000
        ) {
          return;
        }
        Zotero.zoteroodh.onAnnotationAdd(ids);
      }
    },
  },

  initKeys: function (_document = undefined) {
    if (!_document) {
      _document = document;
    }
    let shortcuts = [
      {
        id: 0,
        func: Zotero.zoteroodh.onTranslateButtonClick,
        modifiers: null,
        key: "t",
      },
    ];
    let keyset = _document.createElement("keyset");
    keyset.setAttribute("id", "pdf-translate-keyset");

    for (let i in shortcuts) {
      keyset.appendChild(
        Zotero.zoteroodh.createKey(shortcuts[i], _document)
      );
    }
    _document.getElementById("mainKeyset").parentNode.appendChild(keyset);
  },

  createKey: function (keyObj, _document) {
    let key = _document.createElement("key");
    key.setAttribute("id", "pdf-translate-key-" + keyObj.id);
    key.setAttribute("oncommand", "//");
    key.addEventListener("command", keyObj.func);
    if (keyObj.modifiers) {
      key.setAttribute("modifiers", keyObj.modifiers);
    }
    if (keyObj.key) {
      key.setAttribute("key", keyObj.key);
    } else if (keyObj.keycode) {
      key.setAttribute("keycode", keyObj.keycode);
    } else {
      // No key or keycode.  Set to empty string to disable.
      key.setAttribute("key", "");
    }
    return key;
  },

  onReaderSelect: function () {
    Zotero.zoteroodh._readerSelect = new Date().getTime();
    Zotero.zoteroodh.view.updateTranslatePanel();
    Zotero.zoteroodh.bindAddToNote();
  },

  // Check readers in seperate window
  onWindowReaderCheck: function () {
    readers = Zotero.zoteroodh.reader.getWindowReader();
    for (let i = 0; i < readers.length; i++) {
      if (!readers[i].PDFTranslateLoad) {
        Zotero.zoteroodh.view.updateWindowTranslatePanel(readers[i]);
        readers[i].PDFTranslateLoad = true;
      }
    }
  },

  onAnnotationAdd: function (ids) {
    let items = Zotero.Items.get(ids);

    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      Zotero.zoteroodh.translate.callTranslateAnnotation(item);
    }
  },

  onSelect: async function (event, currentReader, disableAuto) {
    // Zotero.debug(e)

    // Work around to only allow event from ifrme
    if (
      event.target &&
      event.target.closest &&
      !event.target.closest("#outerContainer")
    ) {
      return false;
    }

    let enable = Zotero.Prefs.get("zoteroodh.enable");
    let text = Zotero.zoteroodh.reader.getSelectedText(currentReader);
    let currentButton = currentReader._iframeWindow.document.getElementById(
      "pdf-translate-popup-button"
    );
    let currentNode = currentReader._iframeWindow.document.getElementById(
      "pdf-translate-popup"
    );
    if (!enable || !text || currentButton || currentNode) {
      return false;
    }

    Zotero.debug(
      `zoteroodh: onTranslate. language disable=${disableAuto}`
    );

    let enableAuto =
      Zotero.Prefs.get("zoteroodh.enableAuto") && !disableAuto;
    let enablePopup = Zotero.Prefs.get("zoteroodh.enablePopup");
    if (enablePopup) {
      if (enableAuto) {
        Zotero.zoteroodh.view.buildPopupPanel(currentReader);
      } else {
        Zotero.zoteroodh.view.buildPopupButton(currentReader);
      }
    }

    if (enableAuto) {
      await Zotero.zoteroodh.translate.callTranslate(currentReader);
    }
  },

  onTranslateButtonClick: function (event, currentReader = undefined) {
    if (!currentReader) {
      currentReader = Zotero.zoteroodh.reader.getReader();
    }
    let enablePopup = Zotero.Prefs.get("zoteroodh.enablePopup");
    if (enablePopup) {
      Zotero.zoteroodh.view.removePopupPanel(currentReader);
      Zotero.zoteroodh.view.buildPopupPanel(currentReader);
    }

    Zotero.zoteroodh.translate.callTranslate(
      currentReader,
      (force = true)
    );
  },

  onTranslateNoteButtonClick: async function (
    event,
    currentReader,
    addToNoteButton
  ) {
    if (!currentReader) {
      currentReader = Zotero.zoteroodh.reader.getReader();
    }
    Zotero.zoteroodh.translate._enableNote = true;
    await addToNoteButton.click();
  },

  bindAddToNote: async function () {
    Zotero.debug("zoteroodh.bindAddToNote");
    let currentReader = Zotero.zoteroodh.reader.getReader();
    if (!currentReader) {
      return false;
    }
    await currentReader._waitForReader();

    currentReader._addToNoteOrigin = currentReader._addToNote;
    currentReader._addToNoteTranslate = async function (annotations) {
      Zotero.debug("zoteroodh.addToNoteTranslate Start");
      if (
        Zotero.zoteroodh.translate._enableNote &&
        Zotero.Prefs.get("zoteroodh.enableNote")
      ) {
        Zotero.debug("zoteroodh.addToNoteTranslate Allowed");
        annotations =
          await Zotero.zoteroodh.translate.callTranslateNote(
            annotations
          );
      }
      currentReader._addToNoteOrigin.call(currentReader, annotations);
    };
    currentReader._addToNote = currentReader._addToNoteTranslate;
  },

  resetState: function () {
    // Reset preferrence state.
    let enable = Zotero.Prefs.get("zoteroodh.enable");
    if (typeof enable === "undefined") {
      Zotero.Prefs.set("zoteroodh.enable", true);
    }

    let enableAuto = Zotero.Prefs.get("zoteroodh.enableAuto");
    if (typeof enableAuto === "undefined") {
      Zotero.Prefs.set("zoteroodh.enableAuto", true);
    }

    let enablePopup = Zotero.Prefs.get("zoteroodh.enablePopup");
    if (typeof enablePopup === "undefined") {
      Zotero.Prefs.set("zoteroodh.enablePopup", true);
    }

    let enableComment = Zotero.Prefs.get("zoteroodh.enableComment");
    if (typeof enableComment === "undefined") {
      Zotero.Prefs.set("zoteroodh.enableComment", true);
    }

    let enableNote = Zotero.Prefs.get("zoteroodh.enableNote");
    if (typeof enableNote === "undefined") {
      Zotero.Prefs.set("zoteroodh.enableNote", true);
    }

    let fontSize = Zotero.Prefs.get("zoteroodh.fontSize");
    if (!fontSize) {
      Zotero.Prefs.set("zoteroodh.fontSize", "12");
    }

    let rawResultOrder = Zotero.Prefs.get("zoteroodh.rawResultOrder");
    if (typeof rawResultOrder === "undefined") {
      Zotero.Prefs.set("zoteroodh.rawResultOrder", false);
    }

    let showSidebarEngine = Zotero.Prefs.get(
      "zoteroodh.showSidebarEngine"
    );
    if (typeof showSidebarEngine === "undefined") {
      Zotero.Prefs.set("zoteroodh.showSidebarEngine", true);
    }

    let showSidebarLanguage = Zotero.Prefs.get(
      "zoteroodh.showSidebarLanguage"
    );
    if (typeof showSidebarLanguage === "undefined") {
      Zotero.Prefs.set("zoteroodh.showSidebarLanguage", true);
    }

    let showSidebarRaw = Zotero.Prefs.get("zoteroodh.showSidebarRaw");
    if (typeof showSidebarRaw === "undefined") {
      Zotero.Prefs.set("zoteroodh.showSidebarRaw", true);
    }

    let showSidebarCopy = Zotero.Prefs.get(
      "zoteroodh.showSidebarCopy"
    );
    if (typeof showSidebarCopy === "undefined") {
      Zotero.Prefs.set("zoteroodh.showSidebarCopy", true);
    }

    let translateSource = Zotero.Prefs.get(
      "zoteroodh.translateSource"
    );
    let validSource = false;
    for (let e of Zotero.zoteroodh.translate.sources) {
      if (translateSource == e) {
        validSource = true;
      }
    }

    if (!translateSource || !validSource) {
      // Change default translate engine for zh-CN users
      if (Services.locale.getRequestedLocale() === "zh-CN") {
        translateSource = "googleapi";
      } else {
        translateSource = Zotero.zoteroodh.translate.sources[0];
      }
      Zotero.Prefs.set("zoteroodh.translateSource", translateSource);
    }

    let langs = Zotero.zoteroodh.translate.LangCultureNames.map(
      (e) => e.LangCultureName
    );

    let sourceLanguage = Zotero.Prefs.get("zoteroodh.sourceLanguage");
    let targetLanguage = Zotero.Prefs.get("zoteroodh.targetLanguage");
    let validSL = false;
    let validTL = false;
    for (let e of langs) {
      if (sourceLanguage == e) {
        validSL = true;
      }
      if (targetLanguage == e) {
        validTL = true;
      }
    }
    if (!sourceLanguage || !validSL) {
      Zotero.Prefs.set(
        "zoteroodh.sourceLanguage",
        Zotero.zoteroodh.translate.defaultSourceLanguage
      );
    }

    if (!targetLanguage || !validTL) {
      targetLanguage = Services.locale.getRequestedLocale();
      Zotero.Prefs.set("zoteroodh.targetLanguage", targetLanguage);
    }

    let secret = Zotero.Prefs.get("zoteroodh.secret");
    if (typeof secret === "undefined") {
      Zotero.Prefs.set(
        "zoteroodh.secret",
        Zotero.zoteroodh.translate.defaultSecret[translateSource]
      );
    }

    let secretObj = Zotero.Prefs.get("zoteroodh.secretObj");
    if (typeof secretObj === "undefined") {
      secretObj = Zotero.zoteroodh.translate.defaultSecret;
      secretObj[translateSource] = secret;
      Zotero.Prefs.set(
        "zoteroodh.secretObj",
        JSON.stringify(secretObj)
      );
    }

    let disabledLanguages = Zotero.Prefs.get(
      "zoteroodh.disabledLanguages"
    );
    if (typeof disabledLanguages === "undefined") {
      if (Services.locale.getRequestedLocale() === "zh-CN") {
        Zotero.Prefs.set(
          "zoteroodh.disabledLanguages",
          "zh,中文,中文;"
        );
      } else {
        Zotero.Prefs.set("zoteroodh.disabledLanguages", "");
      }
    }
  },
};
