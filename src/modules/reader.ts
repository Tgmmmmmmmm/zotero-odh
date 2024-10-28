import { config } from "../../package.json";
import { optionsLoad } from "../utils/prefs";
import { onDomContentLoaded } from "./frame";
import { Translation } from "./frontend";

// import { SVGIcon } from "../utils/config";
// import { addTranslateAnnotationTask } from "../utils/task";

export function registerReaderInitializer() {
  Zotero.Reader.registerEventListener(
    "renderTextSelectionPopup",
    (event) => {
      const { reader, doc, params, append } = event;
      const popup = doc.createElement("div");
      popup.id = "odh-popup";
      popup.addEventListener("mousedown", (e: Event) => e.stopPropagation());
      popup.addEventListener("scroll", (e: Event) => e.stopPropagation());

      popup.setAttribute("style", getOdhPopupStyle());

      // popup.append("Loading…");
      append(popup);

      const ele = doc.querySelector(".selection-popup") as HTMLDivElement;
      ele.style.maxWidth = "none";

      addon
        .api_getTranslation(params.annotation.text.trim())
        .then((result: any) => {
          const translation = new Translation(optionsLoad());
          translation._document = reader._iframe!.contentDocument;
          // translation._window = reader._iframe;
          addon.data.fg = translation;
          addon.data.fg.notes = result;
          const expression = params.annotation.text.trim();
          const notes = addon.data.fg.buildNote(
            reader._iframeWindow![0],
            expression,
            result,
          );
          return addon.data.fg.renderPopup(notes);
        })
        .then((content: any) => {
          popup.innerHTML = content;
          // apply styles and show
          updateStyle(popup, ".odh-notes", getOdhNotesClassStyle);
          updateStyle(popup, ".odh-note", getOdhNoteClassStyle);
          updateStyle(popup, ".odh-headsection", getOdhHeadSectionClassStyle);
          updateStyle(popup, ".odh-expression", getOdhExpressionClassStyle);
          updateStyle(popup, ".odh-reading", getOdhReadingClassStyle);
          updateStyle(popup, ".odh-extra", getOdhExtraClassStyle);
          updateStyle(popup, ".odh-definition", getOdhDefinitionClassStyle);
          updateStyle(popup, ".odh-sentence", getOdhSentenceClassStyle);
          updateStyle(popup, ".odh-context", getOdhContextClassStyle);
          updateStyle(popup, ".odh-addnote", getOdhAddnoteClassStyle);
          updateStyle(
            popup,
            ".odh-addnote-disabled",
            getOdhAddnoteDisabledClassStyle,
          );
          updateStyle(popup, ".odh-addnote-plus", getOdhAddnotePlusClassStyle);
          updateStyle(
            popup,
            ".odh-addnote-cloud",
            getOdhAddnoteCloudClassStyle,
          );
          updateStyle(popup, ".odh-addnote-load", getOdhAddnoteLoadClassStyle);
          updateStyle(popup, ".odh-addnote-good", getOdhAddnoteGoodClassStyle);
          updateStyle(popup, ".odh-addnote-fail", getOdhAddnoteFailClassStyle);
          updateStyle(popup, ".odh-audios", getOdhAudiosClassStyle);
          updateStyle(popup, ".odh-playaudio", getOdhPlayaudioClassStyle);
          updateStyle(popup, "hr", getHrElementStyle);
          updateStyle(popup, ".hidden", getHiddenClassStyle);
          updateStyle(popup, ".hightlight", getHightlightClassStyle);
          popup.style.visibility = "visible";
          // popup.contentWindow!.scrollTo(0, 0);
          // popup.srcdoc = content;
          // popup.src = "chrome://zodh/content/popup.html";
          onDomContentLoaded(doc);
          // updateStyle(popup, ".spell", getSpellClassStyle);
          // updateStyle(popup, ".spell-content", getSpellContentClassStyle);
          // updateStyle(popup, ".spell-bar", getSpellBarClassStyle);
          // updateStyle(popup, ".spell-zone", getSpellZoneClassStyle);
          // updateStyle(popup, ".spell-icon", getSpellIconClassStyle);
        });
    },
    config.addonID,
  );
}

function getOdhPopupStyle() {
  return `
  all: initial;
  background-color: #fff;
  border: 1px solid #666;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  /*border-radius: 3px;*/
  height: 300px;
  /* position: fixed; */
  resize: both;
  visibility: hidden;
  width: 400px;
  z-index: 2147483647;
  overflow-y: scroll;
  display: block;
  `;
}

function getOdhNotesClassStyle() {
  return `
  font-family: "Open Sans", Helvetica, Arial, "Microsoft Yahei", Sans-serif;
  /*font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, 'Microsoft Yahei', sans-serif;*/
  font-size: 14px;
  text-align: left;
  color: #1d2129;
  line-height: 1.5em;
  min-height: 1.5em;
  overflow-y: auto;
  margin: 8px;
  border-radius: 3px;
  box-sizing: border-box;
  `;
}

function getOdhNoteClassStyle() {
  return `
  margin: 5px 0;
  padding: 0px;
  /*border: 1px dashed red;*/
  `;
}

function getOdhHeadSectionClassStyle() {
  return `
  margin: 3px 0;
  padding: 0 3px 3px;
  border-bottom: 2px #666 solid;
  `;
}

function getOdhExpressionClassStyle() {
  return `
  font-size: 1.2em;
  font-weight: bold;
  margin-right: 4px;
  `;
}

function getOdhReadingClassStyle() {
  return `
  font-family: Arial, Helvetica, sans-serif;
  margin-right: 4px;
  font-size: 0.9em;
  display: inline-block;
  `;
}

function getOdhExtraClassStyle() {
  return `
  margin-right: 4px;
  display: inline-block;
  `;
}

function getOdhDefinitionClassStyle() {
  return `
  display: block;
  background-color: #fefefe;
  border: 1px solid;
  border-color: #e5e6e9 #dfe0e4 #d0d1d5;
  border-radius: 3px;
  padding: 5px;
  margin-top: 5px;
  word-wrap: break-word;
  overflow: auto;
  `;
}

function getOdhSentenceClassStyle() {
  return (
    getOdhDefinitionClassStyle() +
    `
  border: 2px dashed #d0d1d5;
  padding: 0;
  `
  );
}

function getOdhContextClassStyle() {
  return `
  font-family: "Open Sans", Helvetica, Arial, "Microsoft Yahei", Sans-serif;
  background: #fffff4;
  margin: 0;
  width: 96%;
  height: 100px;
  `;
}

function getOdhAddnoteDisabledClassStyle() {
  return `
  margin: 3px;
  cursor: pointer;
  position: relative;
  float: right;
  width: 16px;
  height: 16px;
  cursor: not-allowed;
  opacity: 0.5;
  `;
}

function getOdhAddnoteClassStyle() {
  return `
  margin: 3px;
  cursor: pointer;
  position: relative;
  float: right;
  width: 16px;
  height: 16px;
  `;
}

function getOdhAddnotePlusClassStyle() {
  return `
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAJvSURBVDjLpZPrS5NhGIf9W7YvBYOkhlkoqCklWChv2WyKik7blnNris72bi6dus0DLZ0TDxW1odtopDs4D8MDZuLU0kXq61CijSIIasOvv94VTUfLiB74fXngup7nvrnvJABJ/5PfLnTTdcwOj4RsdYmo5glBWP6iOtzwvIKSWstI0Wgx80SBblpKtE9KQs/We7EaWoT/8wbWP61gMmCH0lMDvokT4j25TiQU/ITFkek9Ow6+7WH2gwsmahCPdwyw75uw9HEO2gUZSkfyI9zBPCJOoJ2SMmg46N61YO/rNoa39Xi41oFuXysMfh36/Fp0b7bAfWAH6RGi0HglWNCbzYgJaFjRv6zGuy+b9It96N3SQvNKiV9HvSaDfFEIxXItnPs23BzJQd6DDEVM0OKsoVwBG/1VMzpXVWhbkUM2K4oJBDYuGmbKIJ0qxsAbHfRLzbjcnUbFBIpx/qH3vQv9b3U03IQ/HfFkERTzfFj8w8jSpR7GBE123uFEYAzaDRIqX/2JAtJbDat/COkd7CNBva2cMvq0MGxp0PRSCPF8BXjWG3FgNHc9XPT71Ojy3sMFdfJRCeKxEsVtKwFHwALZfCUk3tIfNR8XiJwc1LmL4dg141JPKtj3WUdNFJqLGFVPC4OkR4BxajTWsChY64wmCnMxsWPCHcutKBxMVp5mxA1S+aMComToaqTRUQknLTH62kHOVEE+VQnjahscNCy0cMBWsSI0TCQcZc5ALkEYckL5A5noWSBhfm2AecMAjbcRWV0pUTh0HE64TNf0mczcnnQyu/MilaFJCae1nw2fbz1DnVOxyGTlKeZft/Ff8x1BRssfACjTwQAAAABJRU5ErkJggg==) no-repeat;
  `;
}

function getOdhAddnoteCloudClassStyle() {
  return `
  background: url("chrome://zodh/content/fg/img/cloud.png") no-repeat;
  `;
}

function getOdhAddnoteLoadClassStyle() {
  return `
  background: url("chrome://zodh/content/fg/img/load.gif") no-repeat;
  `;
}

function getOdhAddnoteGoodClassStyle() {
  return `
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACcUlEQVQ4jZVR30tTcRw99/u9P5x36s1fA5d1lZWYpTdfCtRtiQmbmflWgTF78qnsL7D9BfPFBymSwEgjKE3QCKYPRmWml0TIDF1mc0NzVzc3NnW3hzBERul5/HDO+ZzP+TA4CrohE4Z08JSXBcr7eMrdY48glghDRq/JTtksFmB5y4+Pa1MyOayeMrT9krlGtpmrYUwzwH68Bpl8uv1QCbgHrCJyYodTrsf32AIAQGeSAAgOlYAlrOdW6XXwHIuoHkFZdjk+rargCNf5X4P0RwZXaXaJvdKk4GdiCeXZlQhEg5j5NeujhLr/nNAFBQQKGKhog7onzugxSoQhHlfZTYSTGnINeRA5I57NvQBL2NbJJlUj6ILHIhVNO07W9eSkHZtGNzz7ivM0WZxSrpiDLYRRnHEK71cmEN2Jdk42qWMAwIJB++2yFhg4AZflWvTO9bfPPvwiiZzhcX56nuuqpQGBnWVYMkrgj6xgKqj6KEPde0sIGMDIi1hLrGJzN4Q759tgL6xyUUJHW8+1YIckIPIiOMJj6NswKKHN7xontb8p0QgplNAu2s1WxPUY4noMtkIbiiUZFaaz2MA6ThiK4PWNYUHzud9emejbXzLFEF77awPy5vamYjNbEUcca7tBVORUIIwN5KeZ4A8HMPR1WB1v+HDj4JcoAOiv9IFQvSZHtiNKdUEVCGWwmgwik8+CgYjo/fwU28mEw/fkRyClAQDEXyYGYo6YPB+aV6zmGmQJmcgTTPAujmFBW3R7HeN9B8Upceb56R7nmzp9cL1f717q1OtGrNP/4jOphhcGK+8LVLgrUF6jhDaP1HvVVDwA+A0rr9F+/wY4EQAAAABJRU5ErkJggg==) no-repeat;
  `;
}

function getOdhAddnoteFailClassStyle() {
  return `
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACpElEQVR4nHWTTU8TQRzGn5n/rNtXuxVoWbSmJcYXwGQuFBNP+w0w8AEkPXHDT4LfoF7lAL6QXiDZIF4IlyXeCVEogqFu6Yvbmtnx4LIRo//jJL/fMzPPDEM0Xq22OvT9cvPjx6X5szMf/5gN27bsubm6Gg6PnjYaLwCAA8Cn5eV6YXZ2hTM2nxoddd+Mj1v/gV3r3r153WqtbD16VAcA5tVqq4XZ2ZXm1haGrRa0Uuien3v9dtt5dnrqA8D6xIRlV6tufnJSXuzuQisFAOj3ei/F0PfLze3tGIZSSOfzEmHorgMOGINdrbr5SkVe7OwASoFFuwqVKrO3xaKVHB110yMjEkpBhyGgFBCG6LbbXm5qCrcqFXnx4cPvda3BAFz2+16333cYALwZH7eSluWm83l5BbMwBMIQt548gb+3FyczreH3+143CJyFkxOf/XlJqWzWTd+8Ka9gpjX0YAAdBGBRclcI7zIInMWTEx9AfBwAwLptW6lMxs0kk1J9/w7VboMD4JyDiNAxDK8rhLN4fBzXLK51xRiylQpSponW4SEoAokIxDk4EfRf9fI/0wszM27asuTFzk6cSkQQRBBCoEgkRzh310ol65pgI4IzuZz81miAhyE4Y7FECAHDMGAIgdumKYuGEUvYhm1bY1HyeaMBrnWc2DNNj4hQIJJXAkMIEBE+B4F3HASOGJuerqdyOfl1cxNcazAiMMbQNQyvJ4SjARBj7p1IciMSPUgkJO906uJnp3N0urt7De6ZpvfDMOLbXiuVHKGUO0kkb0QSzjmSQXDEAOBdNls3BoPnRIRhOu0NTNNZiHq+mrVSybqTSrkP83mZTCTwpdd7dX9/fyl+B+9zuVUQlYeJxNJCs/nP7/z67l2rnMnUU4Zx9Pjg4AUA/ALA8B6CbeY2WQAAAABJRU5ErkJggg==) no-repeat;
  `;
}

function getOdhAudiosClassStyle() {
  return `margin: 3px;
  position: relative;
  float: right;`;
}

function getOdhPlayaudioClassStyle() {
  return `vertical-align: text-bottom;
  margin: 0 3px;
  height: 16px;
  width: 16px;
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAH0SURBVDjLxdPPS9tgGAfwgH/ATmPD0w5jMFa3IXOMFImsOKnbmCUTacW1WZM2Mf1ho6OBrohkIdJfWm9aLKhM6GF4Lz3No/+AMC/PYQXBXL1+95oxh1jGhsgOX/LywvN5n/fN+3IAuKuEuzagVFoO27b1/Z+BcrnUx4otx7FPLWsJvYpIM2SS9H4PqNWqfK1W8VKplHlW/G1zs4G9vS9YXPx4CaDkXOFES4Om4gceUK2WsbZWR72+gtXVFezsbKHVamF7ewtm/sMFgBJZhd6pvm4kDndaAo2KOmt5Gfv7X9HpdNBut9FsNmFZFgPrMHKZc4DkjHyi6KC3MZNehTOuGAH5Xx5ybK/Y3f0Mx3Fg2zaKxSIMw2DjT0inNQ84nogcUUQJHIfZquNT3hzx46DBALizg2o01qEoCqLRKERRRDAYhKYlWRK/AJdCMwH2BY28+Qk8fg667wdXKJjY2FiHaeaRzWYQCk1AEASGzSCZjP/ewtik5r6eBD0dM+nRSMb1j4LuPDnkFhZymJ/PsmLdazmV0jxEkqKsK+niIQ69mKUBwdd9OAx3SADdHtC53FyK12dVXlVlPpF4zytK7OgMyucNyHLs8m+8+2zJHRwG3fId9LxIbNU+OR6zWU57AR5y84FKN+71//EqM2iapfv/HtPf5gcdtKR8VW88PgAAAABJRU5ErkJggg==) no-repeat;
  display: inline-block;
  /* border: none; */`;
}

function getHrElementStyle() {
  return `  border: 1px;
  margin: 5px 0;
  border-top: 1px solid #d5d5d5;`;
}

function getHiddenClassStyle() {
  return `
  display: none;
  `;
}

function getHightlightClassStyle() {
  return `
  /*font-weight       : bold;*/
  font-size: 0.9em;
  border-radius: 4px;
  color: #fff;
  padding: 1px 2px;
  margin-right: 3px;
  text-decoration: none;
  text-align: center;`;
}

function getSpellClassStyle() {
  return `
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(10, 10, 10, 0.25);
  box-sizing: border-box;
  width: 100%;
  `;
}

function getSpellContentClassStyle() {
  return `
  box-sizing: border-box;
  min-height: 100px;
  resize: vertical;
  outline: 0;
  overflow-y: auto;
  padding: 0.5em;
  width: 100%;
  `;
}

function getSpellBarClassStyle() {
  return `
  display: table;
  width: 100%;
  height: 28px;
  background-color: #f6f6f6;
  box-shadow: inset 0 -1px 2px rgba(10, 10, 10, 0.1);
  border: none;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  `;
}

function getSpellZoneClassStyle() {
  return `
  display: table-cell;
  text-align: center;
  counter-reset: btn;
  `;
}

function getSpellIconClassStyle() {
  return `
  display: inline-block;
  position: relative;
  background-color: transparent;
  border: none;
  cursor: pointer;
  height: 22px;
  width: 22px;
  outline: 0;
  font-size: 10px;
  line-height: 0; 
  `;
}

function updateStyle(
  doc: HTMLElement,
  selector: string,
  styleFunction: CallableFunction,
) {
  const elements = doc.querySelectorAll(selector);
  elements.forEach((ele) => {
    const currentStyle = ele.getAttribute("style");
    ele.setAttribute("style", currentStyle + styleFunction());
  });
}
