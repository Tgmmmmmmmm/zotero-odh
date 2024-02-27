import { config } from "../../package.json";
import { getString } from "../utils/locale";

export class ZodhFactory {
  static registerPrefs() {
    const prefOptions = {
      pluginID: config.addonID,
      src: rootURI + "chrome/content/preferences.xhtml",
      label: getString("prefs-title"),
      image: `chrome://${config.addonRef}/content/icons/favicon.png`,
      defaultXUL: true,
    };
    ztoolkit.PreferencePane.register(prefOptions);
  }

  // static registerAPI() {
  //   Object.defineProperty(globalThis, "api", {
  //     value: new SandboxAPI(),
  //   });
  // }

  static registerNotifier() {
    const callback = {
      notify: async (
        event: string,
        type: string,
        ids: number[] | string[],
        extraData: { [key: string]: any },
      ) => {
        if (!addon?.data.alive) {
          this.unregisterNotifier(notifierID);
          return;
        }
        addon.hooks.onNotify(event, type, ids, extraData);
      },
    };

    // Register the callback in Zotero as an item observer
    const notifierID = Zotero.Notifier.registerObserver(callback, ["tab"]);

    // Unregister callback when the window closes (important to avoid a memory leak)
    window.addEventListener(
      "unload",
      (e: Event) => {
        this.unregisterNotifier(notifierID);
      },
      false,
    );
  }

  static registerKeydownEvent() {}

  private static unregisterNotifier(notifierID: string) {
    Zotero.Notifier.unregisterObserver(notifierID);
  }
}

export async function sendtoBackend(request: any) {}

export async function isConnected() {
  try {
    return await sendtoBackend({ action: "isConnected", params: {} });
  } catch (err) {
    return null;
  }
}

export async function getTranslation(expression: any) {
  try {
    return await sendtoBackend({
      action: "getTranslation",
      params: { expression },
    });
  } catch (err) {
    return null;
  }
}

export async function addNote(notedef: any) {
  try {
    return await sendtoBackend({ action: "addNote", params: { notedef } });
  } catch (err) {
    return null;
  }
}

export async function playAudio(url: any) {
  try {
    return await sendtoBackend({ action: "playAudio", params: { url } });
  } catch (err) {
    return null;
  }
}
