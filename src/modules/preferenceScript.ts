import { config } from "../../package.json";
import { getString } from "../utils/locale";

export async function registerPrefsScripts(_window: Window) {
  // This function is called when the prefs window is opened
  // See addon/chrome/content/preferences.xul onpaneload
  if (!addon.data.prefs) {
    addon.data.prefs = {
      window: _window,
      columns: [
        {
          dataKey: "onoff",
          label: getString("prefs-table-onoff"),
          fixedWidth: true,
          width: 100,
        },
        {
          dataKey: "name",
          label: getString("prefs-table-name"),
        },
        {
          dataKey: "description",
          label: getString("prefs-table-description"),
        },
      ],
      rows: [
        {
          name: "Orange",
          description: "It's juicy",
        },
        {
          name: "Banana",
          description: "It's sweet",
        },
        {
          name: "Apple",
          description: "I mean the fruit APPLE",
        },
      ],
    };
  } else {
    addon.data.prefs.window = _window;
  }

  updatePrefsUI();
  bindPrefEvents();
}

async function updatePrefsUI() {
  // You can initialize some UI elements on prefs window
  // with addon.data.prefs.window.document
  // Or bind some events to the elements
  // const renderLock = ztoolkit.getGlobal("Zotero").Promise.defer();
  // if (addon.data.prefs?.window == undefined) return;

  populateSysScriptsList("");

  // const tableHelper = new ztoolkit.VirtualizedTable(addon.data.prefs?.window)
  //   .setContainerId(`${config.addonRef}-table-container`)
  //   .setProp({
  //     id: `${config.addonRef}-prefs-table`,
  //     // Do not use setLocale, as it modifies the Zotero.Intl.strings
  //     // Set locales directly to columns
  //     columns: addon.data.prefs?.columns,
  //     showHeader: true,
  //     multiSelect: true,
  //     staticColumns: true,
  //     disableFontSizeScaling: true,
  //   })
  //   .setProp("getRowCount", () => addon.data.prefs?.rows.length || 0)
  //   .setProp(
  //     "getRowData",
  //     (index) =>
  //       addon.data.prefs?.rows[index] || {
  //         title: "no data",
  //         detail: "no data",
  //       },
  //   )
  //   // Show a progress window when selection changes
  //   .setProp("onSelectionChange", (selection) => {
  //     new ztoolkit.ProgressWindow(config.addonName)
  //       .createLine({
  //         text: `Selected line: ${addon.data.prefs?.rows
  //           .filter((v, i) => selection.isSelected(i))
  //           .map((row) => row.title)
  //           .join(",")}`,
  //         progress: 100,
  //       })
  //       .show();
  //   })
  //   // When pressing delete, delete selected line and refresh table.
  //   // Returning false to prevent default event.
  //   .setProp("onKeyDown", (event: KeyboardEvent) => {
  //     if (event.key == "Delete" || (Zotero.isMac && event.key == "Backspace")) {
  //       addon.data.prefs!.rows =
  //         addon.data.prefs?.rows.filter(
  //           (v, i) => !tableHelper.treeInstance.selection.isSelected(i),
  //         ) || [];
  //       tableHelper.render();
  //       return false;
  //     }
  //     return true;
  //   })
  //   // For find-as-you-type
  //   .setProp(
  //     "getRowString",
  //     (index) => addon.data.prefs?.rows[index].title || "",
  //   )
  //   // Render the table.
  //   .render(-1, () => {
  //     renderLock.resolve();
  //   });
  // await renderLock.promise;
  ztoolkit.log("Preference table rendered!");
}

async function populateSysScriptsList(dictLibrary: any) {
  const optionscripts = Array.from(
    new Set(
      dictLibrary
        .split(",")
        .filter((x: string) => x)
        .map((x: string) => x.trim()),
    ),
  );
  const systemscripts = [
    "builtin_encn_Collins",
    "general_Makenotes", //default & builtin script
    "cncn_Zdic", //cn-cn dictionary
    "encn_Collins",
    "encn_Cambridge",
    "encn_Cambridge_tc",
    "encn_Oxford",
    "encn_Youdao",
    "encn_Baicizhan", //en-cn dictionaries
    "enen_Collins",
    "enen_LDOCE6MDX",
    "enen_UrbanDict", //en-en dictionaries
    "enfr_Cambridge",
    "enfr_Collins", //en-fr dictionaries
    "fren_Cambridge",
    "fren_Collins", //fr-cn dictionaries
    "esen_Spanishdict",
    "decn_Eudict",
    "escn_Eudict",
    "frcn_Eudict",
    "frcn_Youdao",
    "rucn_Qianyi", //msci dictionaries
  ];

  // const scriptlistbody = window.document.getElementById("scriptslistbody");
  // if (scriptlistbody?.children[0]) {
  //   for (const child of scriptlistbody.children) {
  //     scriptlistbody.removeChild(child);
  //   }
  // }
  const renderLock = ztoolkit.getGlobal("Zotero").Promise.defer();
  if (addon.data.prefs?.window == undefined) return;
  const tableHelper = new ztoolkit.VirtualizedTable(addon.data.prefs?.window)
    .setContainerId(`${config.addonRef}-table-container`)
    .setProp({
      id: `${config.addonRef}-prefs-scriptslist-table`,
      // Do not use setLocale, as it modifies the Zotero.Intl.strings
      // Set locales directly to columns
      columns: addon.data.prefs?.columns,
      showHeader: true,
      multiSelect: true,
      staticColumns: true,
      disableFontSizeScaling: true,
    })
    .setProp("getRowCount", () => systemscripts.length || 0)
    .setProp(
      "getRowData",
      (index) => ({
        onoff: "<checkbox label=$(systemscript[index])/>",
        name: systemscripts[index],
        description: systemscripts[index],
      }),
      // addon.data.prefs?.rows[index] || {
      //   onoff: "no data",
      //   name: "no data",
      //   description: "no data",
      // },
    )
    // For find-as-you-type
    .setProp(
      "getRowString",
      (index) => addon.data.prefs?.rows[index].title || "",
    )
    // Render the table.
    .render(-1, () => {
      renderLock.resolve();
    });
  await renderLock.promise;

  // systemscripts.forEach((script) => {
  //   let row = "";
  //   row += `<input class="sl-col sl-col-onoff" type="checkbox" ${
  //     optionscripts.includes(script) ||
  //     optionscripts.includes("lib://" + script)
  //       ? "checked"
  //       : ""
  //   }>`;
  //   row += `<input class="sl-col sl-col-cloud" type="checkbox" ${
  //     optionscripts.includes("lib://" + script) ? "checked" : ""
  //   }>`;
  //   row += `<span class="sl-col sl-col-name">${script}</span>`;
  //   row += `<span class="sl-col sl-col-description">${chrome.i18n.getMessage(
  //     script,
  //   )}</span>`;
  //   $("#scriptslistbody").append($(`<div class="sl-row">${row}</div>`));
  // });

  // $(".sl-col-onoff", ".sl-row:nth-child(1)").prop("checked", true); // make default script(first row) always active.
  // $(".sl-col-cloud", ".sl-row:nth-child(1)").prop("checked", false); // make default script(first row) as local script.
  // $(".sl-col-cloud, .sl-col-onoff", ".sl-row:nth-child(1)").css({
  //   visibility: "hidden",
  // }); //make default sys script untouch
}

function bindPrefEvents() {
  // addon.data
  //   .prefs!.window.document.querySelector(
  //     `#zotero-prefpane-${config.addonRef}-enable`,
  //   )
  //   ?.addEventListener("command", (e) => {
  //     ztoolkit.log(e);
  //     addon.data.prefs!.window.alert(
  //       `Successfully changed to ${(e.target as XUL.Checkbox).checked}!`,
  //     );
  //   });
  // addon.data
  //   .prefs!.window.document.querySelector(
  //     `#zotero-prefpane-${config.addonRef}-input`,
  //   )
  //   ?.addEventListener("change", (e) => {
  //     ztoolkit.log(e);
  //     addon.data.prefs!.window.alert(
  //       `Successfully changed to ${(e.target as HTMLInputElement).value}!`,
  //     );
  //   });
}
