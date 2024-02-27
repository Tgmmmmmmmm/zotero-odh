import { config } from "../../package.json";
import { renderPopup } from "./fg/popup";
// import { SVGIcon } from "../utils/config";
// import { addTranslateAnnotationTask } from "../utils/task";

export function registerReaderInitializer() {
  Zotero.Reader.registerEventListener(
    "renderTextSelectionPopup",
    (event) => {
      const { reader, doc, params, append } = event;
      const container = doc.createElement("div");
      container.append("Loading…");
      append(container);
      Zotero.ZODH.data.bg
        .api_getTranslation(params.annotation.text.trim())
        .then((result: any) => {
          return renderPopup(result);
        })
        .then((content: any) => {
          container.innerHTML = content;
        });

      // setTimeout(
      //   () =>
      //     container.replaceChildren(
      //       "Translated text: " + params.annotation.text,
      //     ),
      //   1000,
      // );
    },
    config.addonID,
  );

  // Zotero.Reader.registerEventListener(
  //   "renderTextSelectionPopup",
  //   (event) => {
  //     const { reader, doc, params, append } = event;
  //     // addon.data.translate.selectedText = params.annotation.text.trim();
  //     addon.hooks.onReaderPopupShow(event);
  //   },
  //   config.addonID,
  // );
}
