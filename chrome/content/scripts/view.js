Zotero.zoteroodh.view = {
  popupTextBox: undefined,
  sideBarTextboxSource: undefined,
  sideBarTextboxTranslated: undefined,
  tab: undefined,
  tabPanel: undefined,

  /*
    UI Functions
  */
  updateTranslatePanel: async function () {
    Zotero.debug("zoteroodh: Update Translate Panels");

    await Zotero.uiReadyPromise;

    let currentReader = Zotero.zoteroodh.reader.getReader();
    if (!currentReader) {
      return false;
    }
    await currentReader._waitForReader();

    await Zotero.zoteroodh.view.buildSideBarPanel();

    Zotero.zoteroodh.view.updateSideBarPanelMenu();

    let disable = Zotero.zoteroodh.translate.getLanguageDisable(
      undefined,
      currentReader
    );

    currentReader._window.addEventListener(
      "pointerup",
      (function (currentReader, disable) {
        return function (event) {
          Zotero.zoteroodh.onSelect(event, currentReader, disable);
        };
      })(currentReader, disable)
    );
  },

  updateWindowTranslatePanel: async function (currentReader) {
    Zotero.debug("zoteroodh: Update Window Translate Panels");

    await Zotero.uiReadyPromise;

    await currentReader._waitForReader();

    let disable = Zotero.zoteroodh.translate.getLanguageDisable(
      undefined,
      currentReader
    );

    currentReader._window.addEventListener(
      "pointerup",
      (function (currentReader, disable) {
        return function (event) {
          Zotero.zoteroodh.onSelect(event, currentReader, disable);
        };
      })(currentReader, disable)
    );
  },

  getSideBarOpen: function () {
    let _contextPaneSplitterStacked = document.getElementById(
      "zotero-context-splitter-stacked"
    );

    let _contextPaneSplitter = document.getElementById(
      "zotero-context-splitter"
    );

    let splitter =
      Zotero.Prefs.get("layout") == "stacked"
        ? _contextPaneSplitterStacked
        : _contextPaneSplitter;

    return splitter.getAttribute("state") != "collapsed";
  },

  buildSideBarPanel: async function () {
    Zotero.debug("zoteroodh: buildSideBarPanel");
    let tab = Zotero.zoteroodh.view.tab;
    if (!tab) {
      tab = document.createElement("tab");
      tab.setAttribute("id", "pdf-translate-tab");
      tab.setAttribute("label", "Translate");
      Zotero.zoteroodh.view.tab = tab;
    }

    // The first tabbox is zotero main pane tabbox
    let n = 0;
    let tabbox = Zotero.zoteroodh.reader.getReaderTab();
    while (!tabbox) {
      if (n >= 500) {
        Zotero.debug("zoteroodh: Waiting for reader failed");
        // Zotero.zoteroodh.view.showProgressWindow(
        //   "PDF Translate",
        //   "Sidebar Load Failed",
        //   "fail"
        // );
        return;
      }
      await Zotero.Promise.delay(10);
      tabbox = Zotero.zoteroodh.reader.getReaderTab();
      n++;
    }
    tabbox.getElementsByTagName("tabs")[0].appendChild(tab);
    let itemCount = tabbox.getElementsByTagName("tabs")[0].itemCount;

    let panelInfo = Zotero.zoteroodh.view.tabPanel;
    if (!panelInfo) {
      panelInfo = document.createElement("tabpanel");
      panelInfo.setAttribute("id", "pdf-translate-tabpanel");
      panelInfo.setAttribute("flex", "1");

      let vbox = document.createElement("vbox");
      vbox.setAttribute("flex", "1");
      vbox.setAttribute("align", "stretch");
      vbox.style.padding = "0px 10px 10px 10px";

      let hboxTranslate = document.createElement("hbox");
      hboxTranslate.setAttribute("id", "pdf-translate-tabpanel-engine-hbox");
      hboxTranslate.setAttribute("flex", "1");
      hboxTranslate.setAttribute("align", "center");
      hboxTranslate.maxHeight = 50;
      hboxTranslate.minHeight = 50;
      hboxTranslate.style.height = "80px";

      let hboxLanguage = document.createElement("hbox");
      hboxLanguage.setAttribute("id", "pdf-translate-tabpanel-language-hbox");
      hboxLanguage.setAttribute("flex", "1");
      hboxLanguage.setAttribute("align", "center");
      hboxLanguage.maxHeight = 50;
      hboxLanguage.minHeight = 50;
      hboxLanguage.style.height = "80px";

      let hboxCopy = document.createElement("hbox");
      hboxCopy.setAttribute("id", "pdf-translate-tabpanel-copy-hbox");
      hboxCopy.setAttribute("flex", "1");
      hboxCopy.setAttribute("align", "center");
      hboxCopy.maxHeight = 50;
      hboxCopy.minHeight = 50;
      hboxCopy.style.height = "80px";

      let SLMenuList = document.createElement("menulist");
      SLMenuList.setAttribute("id", "pdf-translate-sl");
      SLMenuList.style.width = "145px";
      SLMenuList.setAttribute(
        "value",
        Zotero.Prefs.get("zoteroodh.sourceLanguage")
      );
      let SLMenuPopup = document.createElement("menupopup");
      SLMenuList.appendChild(SLMenuPopup);
      for (let lang of Zotero.zoteroodh.translate.LangCultureNames) {
        let menuitem = document.createElement("menuitem");
        menuitem.setAttribute("label", lang.DisplayName);
        menuitem.setAttribute("value", lang.LangCultureName);
        menuitem.addEventListener("command", (e) => {
          let newSL = e.target.value;
          Zotero.Prefs.set("zoteroodh.sourceLanguage", newSL);
        });
        SLMenuPopup.appendChild(menuitem);
      }

      let languageLabel = document.createElement("label");
      languageLabel.setAttribute("id", "pdf-translate-switch");
      languageLabel.setAttribute("flex", "1");
      languageLabel.style["text-align"] = "center";
      languageLabel.style["font-size"] = "14px";
      languageLabel.setAttribute("value", "➡️");
      languageLabel.addEventListener("mouseover", (e) => {
        e.target.setAttribute("value", "🔃");
      });
      languageLabel.addEventListener("mouseleave", (e) => {
        e.target.setAttribute("value", "➡️");
      });
      languageLabel.addEventListener("click", (e) => {
        let SLMenu = document.getElementById("pdf-translate-sl");
        let TLMenu = document.getElementById("pdf-translate-tl");
        let sl = SLMenu.value;
        let tl = TLMenu.value;
        Zotero.Prefs.set("zoteroodh.sourceLanguage", tl);
        Zotero.Prefs.set("zoteroodh.targetLanguage", sl);
        SLMenu.value = tl;
        TLMenu.value = sl;
      });

      let TLMenuList = document.createElement("menulist");
      TLMenuList.setAttribute("id", "pdf-translate-tl");
      TLMenuList.style.width = "145px";
      TLMenuList.setAttribute(
        "value",
        Zotero.Prefs.get("zoteroodh.targetLanguage")
      );
      let TLMenuPopup = document.createElement("menupopup");
      TLMenuList.appendChild(TLMenuPopup);
      for (let lang of Zotero.zoteroodh.translate.LangCultureNames) {
        let menuitem = document.createElement("menuitem");
        menuitem.setAttribute("label", lang.DisplayName);
        menuitem.setAttribute("value", lang.LangCultureName);
        menuitem.addEventListener("command", (e) => {
          let newTL = e.target.value;
          Zotero.Prefs.set("zoteroodh.targetLanguage", newTL);
        });
        TLMenuPopup.appendChild(menuitem);
      }
      hboxLanguage.append(SLMenuList, languageLabel, TLMenuList);

      let menuLabel = document.createElement("label");
      menuLabel.setAttribute("value", "Engine");
      let menulist = document.createElement("menulist");
      menulist.setAttribute("id", "pdf-translate-engine");
      menulist.setAttribute("flex", "1");
      menulist.setAttribute(
        "value",
        Zotero.Prefs.get("zoteroodh.translateSource")
      );
      let menupopup = document.createElement("menupopup");
      menulist.appendChild(menupopup);
      for (let source of Zotero.zoteroodh.translate.sources) {
        let menuitem = document.createElement("menuitem");
        menuitem.setAttribute(
          "label",
          Zotero.zoteroodh.translate.sourcesName[source]
        );
        menuitem.setAttribute("value", source);
        menuitem.addEventListener("command", (e) => {
          let newSource = e.target.value;
          Zotero.Prefs.set("zoteroodh.translateSource", newSource);
          let userSecrets = JSON.parse(
            Zotero.Prefs.get("zoteroodh.secretObj")
          );
          Zotero.Prefs.set("zoteroodh.secret", userSecrets[newSource]);
          Zotero.zoteroodh.onTranslateButtonClick(e);
        });
        menupopup.appendChild(menuitem);
      }

      let buttonTranslate = document.createElement("button");
      buttonTranslate.setAttribute("label", "Translate");
      buttonTranslate.setAttribute("flex", "1");
      buttonTranslate.setAttribute(
        "oncommand",
        "Zotero.zoteroodh.onTranslateButtonClick()"
      );

      hboxTranslate.append(menuLabel, menulist, buttonTranslate);

      let buttonCopySource = document.createElement("button");
      buttonCopySource.setAttribute("label", "Copy Raw");
      buttonCopySource.setAttribute("flex", "1");
      buttonCopySource.setAttribute(
        "oncommand",
        "Zotero.Utilities.Internal.copyTextToClipboard(Zotero.zoteroodh._sourceText)"
      );

      let buttonCopyTranslated = document.createElement("button");
      buttonCopyTranslated.setAttribute("label", "Copy Result");
      buttonCopyTranslated.setAttribute("flex", "1");
      buttonCopyTranslated.setAttribute(
        "oncommand",
        "Zotero.Utilities.Internal.copyTextToClipboard(Zotero.zoteroodh._translatedText)"
      );

      let buttonCopyBoth = document.createElement("button");
      buttonCopyBoth.setAttribute("label", "Copy Both");
      buttonCopyBoth.setAttribute("flex", "1");
      buttonCopyBoth.setAttribute(
        "oncommand",
        "Zotero.Utilities.Internal.copyTextToClipboard(`${Zotero.zoteroodh._sourceText}\n----\n${Zotero.zoteroodh._translatedText}`)"
      );

      hboxCopy.append(buttonCopySource, buttonCopyTranslated, buttonCopyBoth);

      let textboxSource = document.createElement("textbox");
      textboxSource.setAttribute("id", "pdf-translate-tabpanel-source");
      textboxSource.setAttribute("flex", "1");
      textboxSource.setAttribute("multiline", true);
      textboxSource.style["font-size"] = `${Zotero.Prefs.get(
        "zoteroodh.fontSize"
      )}px`;

      let rawResultOrder = Zotero.Prefs.get(
        "zoteroodh.rawResultOrder"
      );
      let splitter = document.createElement("splitter");
      splitter.setAttribute("id", "pdf-translate-tabpanel-splitter");
      splitter.setAttribute("collapse", rawResultOrder ? "after" : "before");
      let grippy = document.createElement("grippy");
      splitter.append(grippy);

      let textboxTranslated = document.createElement("textbox");
      textboxTranslated.setAttribute("multiline", true);
      textboxTranslated.setAttribute("flex", "1");
      textboxTranslated.setAttribute("id", "pdf-translate-tabpanel-translated");
      textboxTranslated.style["font-size"] = `${Zotero.Prefs.get(
        "zoteroodh.fontSize"
      )}px`;

      vbox.append(
        hboxTranslate,
        hboxLanguage,
        rawResultOrder ? textboxTranslated : textboxSource,
        splitter,
        rawResultOrder ? textboxSource : textboxTranslated,
        hboxCopy
      );
      panelInfo.append(vbox);
      Zotero.zoteroodh.view.tabPanel = panelInfo;

      Zotero.zoteroodh.view.sideBarTextboxSource = textboxSource;
      Zotero.zoteroodh.view.sideBarTextboxTranslated =
        textboxTranslated;
    }
    tabbox.getElementsByTagName("tabpanels")[0].appendChild(panelInfo);
    tabbox.selectedIndex = itemCount - 1;
  },

  updateSideBarPanelMenu: function () {
    Zotero.zoteroodh.view.checkSideBarPanel();
    let SLMenuList = document.getElementById("pdf-translate-sl");
    let TLMenuList = document.getElementById("pdf-translate-tl");
    let engineMenuList = document.getElementById("pdf-translate-engine");
    let sourceLanguage = Zotero.Prefs.get("zoteroodh.sourceLanguage");
    if (SLMenuList && SLMenuList.value != sourceLanguage) {
      for (let i = 0; i < SLMenuList.itemCount; i++) {
        if (SLMenuList.getItemAtIndex(i).value == sourceLanguage) {
          SLMenuList.selectedIndex = i;
          break;
        }
      }
    }
    let targetLanguage = Zotero.Prefs.get("zoteroodh.targetLanguage");
    if (TLMenuList && TLMenuList.value != targetLanguage) {
      for (let i = 0; i < TLMenuList.itemCount; i++) {
        if (TLMenuList.getItemAtIndex(i).value == targetLanguage) {
          TLMenuList.selectedIndex = i;
          break;
        }
      }
    }
    let engine = Zotero.Prefs.get("zoteroodh.translateSource");
    if (engineMenuList && engineMenuList.value != engine) {
      for (let i = 0; i < engineMenuList.itemCount; i++) {
        if (engineMenuList.getItemAtIndex(i).value == engine) {
          engineMenuList.selectedIndex = i;
          break;
        }
      }
    }

    let showSidebarEngine = Zotero.Prefs.get(
      "zoteroodh.showSidebarEngine"
    );
    document.getElementById("pdf-translate-tabpanel-engine-hbox").hidden =
      !showSidebarEngine;

    let showSidebarLanguage = Zotero.Prefs.get(
      "zoteroodh.showSidebarLanguage"
    );
    document.getElementById("pdf-translate-tabpanel-language-hbox").hidden =
      !showSidebarLanguage;

    let showSidebarRaw = Zotero.Prefs.get("zoteroodh.showSidebarRaw");
    document.getElementById("pdf-translate-tabpanel-source").hidden =
      !showSidebarRaw;
    document.getElementById("pdf-translate-tabpanel-splitter").hidden =
      !showSidebarRaw;

    let showSidebarCopy = Zotero.Prefs.get(
      "zoteroodh.showSidebarCopy"
    );
    document.getElementById("pdf-translate-tabpanel-copy-hbox").hidden =
      !showSidebarCopy;
  },

  checkSideBarPanel: function () {
    let panel = document.getElementById("pdf-translate-tabpanel");
    if (!panel) {
      Zotero.zoteroodh.view.buildSideBarPanel();
    }
  },

  buildPopupPanel: function (currentReader = undefined) {
    Zotero.debug("zoteroodh: buildPopupPanel");
    if (!currentReader) {
      currentReader = Zotero.zoteroodh.reader.getReader();
    }
    let selectionMenu =
      currentReader._iframeWindow.document.getElementById("selection-menu");
    if (!currentReader || !selectionMenu) {
      return false;
    }
    Zotero.zoteroodh.view.onPopopItemChange(selectionMenu);

    // Create text
    let textbox = currentReader._window.document.createElement("textbox");
    textbox.setAttribute("id", "pdf-translate-popup");
    textbox.setAttribute("multiline", true);
    textbox.style["font-size"] = `${Zotero.Prefs.get(
      "zoteroodh.fontSize"
    )}px`;

    textbox.setAttribute("width", 105);
    textbox.setAttribute("height", 30);
    selectionMenu.style.width = `105px`;
    selectionMenu.style.height = `50px`;

    textbox.onmousedown = (e) => {
      e.preventDefault();
    };
    textbox.onclick = (e) => {
      let text = Zotero.zoteroodh._translatedText
        ? Zotero.zoteroodh._translatedText
        : Zotero.zoteroodh._sourceText;
      Zotero.Utilities.Internal.copyTextToClipboard(text);
      Zotero.zoteroodh.view.showProgressWindow(
        "Copy To Clipboard",
        text.length < 20 ? text : text.slice(0, 15) + "..."
      );
    };

    selectionMenu.appendChild(textbox);
    Zotero.zoteroodh.view.popupTextBox = textbox;
  },

  buildPopupButton: function (currentReader = undefined) {
    Zotero.debug("zoteroodh: buildPopupButton");
    if (!currentReader) {
      currentReader = Zotero.zoteroodh.reader.getReader();
    }
    let selectionMenu =
      currentReader._iframeWindow.document.getElementById("selection-menu");
    if (!currentReader || !selectionMenu) {
      return false;
    }
    Zotero.zoteroodh.view.onPopopItemChange(selectionMenu);

    // Create button
    let button = currentReader._window.document.createElement("button");
    button.setAttribute("id", "pdf-translate-popup-button");
    button.setAttribute("label", "Translate");
    button.setAttribute(
      "image",
      "chrome://zoteroodh/skin/favicon@0.5x.png"
    );
    button.onclick = function (e) {
      Zotero.zoteroodh.onTranslateButtonClick(e, currentReader);
    };
    button.style["width"] = "102px";
    button.style["height"] = "26px";

    selectionMenu.appendChild(button);
  },

  removePopupPanel: function (currentReader) {
    let currentButton = currentReader._iframeWindow.document.getElementById(
      "pdf-translate-popup-button"
    );
    currentButton && currentButton.remove();

    let currentPanel = currentReader._iframeWindow.document.getElementById(
      "pdf-translate-popup"
    );
    currentPanel && currentPanel.remove();
  },

  updatePopupStyle: function (currentReader) {
    Zotero.debug("zoteroodh: updatePopupStyle");
    let selectionMenu =
      currentReader._iframeWindow.document.getElementById("selection-menu");
    if (!Zotero.zoteroodh.view.popupTextBox || !selectionMenu) {
      return;
    }

    // Get current H & W
    let textHeight = document.getAnonymousNodes(
      Zotero.zoteroodh.view.popupTextBox
    )[0].childNodes[0].scrollHeight;
    let textWidth = Number(Zotero.zoteroodh.view.popupTextBox.width);
    if (textHeight / textWidth > 0.75) {
      // Update width
      let newWidth = parseInt(textWidth + 20);
      Zotero.zoteroodh.view.popupTextBox.setAttribute(
        "width",
        newWidth
      );
      selectionMenu.style.width = `${newWidth}px`;
      // Check until H/W<0.75
      Zotero.zoteroodh.view.updatePopupStyle(currentReader);
      return;
    }
    Zotero.zoteroodh.view.popupTextBox.style.height = `${textHeight}px`;
    selectionMenu.style.height = `${textHeight + 20}px`;
  },

  onPopopItemChange: function (selectionMenu) {
    selectionMenu.addEventListener(
      "DOMSubtreeModified",
      function () {
        let addToNoteButton =
          selectionMenu.getElementsByClassName("wide-button")[0];
        let currentReader = Zotero.zoteroodh.reader.getReader();
        let translationToNote =
          currentReader._iframeWindow.document.getElementById(
            "pdf-translate-popup-add-to-note-button"
          );
        if (addToNoteButton) {
          if (
            Zotero.Prefs.get("zoteroodh.enableNote") &&
            !translationToNote
          ) {
            let button = currentReader._window.document.createElement("button");
            button.setAttribute("id", "pdf-translate-popup-add-to-note-button");
            button.setAttribute(
              "label",
              Zotero.getString("pdfReader.addToNote")
            );
            button.setAttribute(
              "image",
              "chrome://zoteroodh/skin/favicon@0.5x.png"
            );
            button.onclick = function (e) {
              Zotero.zoteroodh.onTranslateNoteButtonClick(
                e,
                currentReader,
                addToNoteButton
              );
            };
            button.style["width"] = "102px";
            button.style["height"] = "26px";
            addToNoteButton.after(button);
          }
        }

        if (parseInt(selectionMenu.style.height) < selectionMenu.scrollHeight)
          selectionMenu.style.height = `${selectionMenu.scrollHeight}px`;
      },
      false
    );
  },

  updateResults: function () {
    // Update error info if not success
    if (Zotero.zoteroodh._debug) {
      Zotero.zoteroodh._translatedText =
        Zotero.zoteroodh._debug;
    }
    if (Zotero.zoteroodh.view.sideBarTextboxSource) {
      Zotero.zoteroodh.view.sideBarTextboxSource.setAttribute(
        "value",
        Zotero.zoteroodh._sourceText
      );
    }
    if (Zotero.zoteroodh.view.sideBarTextboxTranslated) {
      Zotero.zoteroodh.view.sideBarTextboxTranslated.setAttribute(
        "value",
        Zotero.zoteroodh._translatedText
      );
    }
    if (Zotero.zoteroodh.view.popupTextBox) {
      Zotero.zoteroodh.view.popupTextBox.setAttribute(
        "value",
        Zotero.zoteroodh._translatedText
          ? Zotero.zoteroodh._translatedText
          : Zotero.zoteroodh._sourceText
      );
    }
  },

  progressWindowIcon: {
    success: "chrome://zotero/skin/tick.png",
    fail: "chrome://zotero/skin/cross.png",
  },

  showProgressWindow: function (header, context, type = "success", t = 5000) {
    // Zotero.ZoteroTag.progressWindow.close();
    let progressWindow = new Zotero.ProgressWindow({ closeOnClick: true });
    progressWindow.changeHeadline(header);
    progressWindow.progress = new progressWindow.ItemProgress(
      Zotero.zoteroodh.view.progressWindowIcon[type],
      context
    );
    progressWindow.show();
    if (t > 0) {
      progressWindow.startCloseTimer(t);
    }
  },
};
