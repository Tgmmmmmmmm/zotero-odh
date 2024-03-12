import { config } from "../../package.json";
import { renderPopup } from "./fg/popup";
// import { SVGIcon } from "../utils/config";
// import { addTranslateAnnotationTask } from "../utils/task";

export function registerReaderInitializer() {
  Zotero.Reader.registerEventListener(
    "renderTextSelectionPopup",
    (event) => {
      const { reader, doc, params, append } = event;
      let link = doc.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = "chrome://zodh/content/client.css";
      doc.head.appendChild(link);

      link = doc.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = "chrome://zodh/content/frame.css";
      doc.head.appendChild(link);

      const popup = doc.createElement("div");
      popup.id = "odh-popup";
      popup.addEventListener("mousedown", (e: Event) => e.stopPropagation());
      popup.addEventListener("scroll", (e: Event) => e.stopPropagation());

      // popup.append("Loading…");
      append(popup);

      Zotero.ZODH.data.bg
        .api_getTranslation(params.annotation.text.trim())
        .then((result: any) => {
          return Zotero.ZODH.data.fg.renderPopup(result);
          // return renderPopup(result);
        })
        .then((content: any) => {
          popup.style.visibility = "visible";
          // popup.contentWindow!.scrollTo(0, 0);
          // popup.srcdoc = content;
          // popup.src = "chrome://zodh/content/popup.html";
          popup.innerHTML = content;
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
