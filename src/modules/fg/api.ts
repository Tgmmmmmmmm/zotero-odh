async function sendtoBackend(request: any) {
  // return new Promise((resolve, reject) => {
  //   chrome.runtime.sendMessage(request, (result) => {
  //     resolve(result);
  //   });
  // });
}

export async function isConnected() {
  try {
    return await sendtoBackend({ action: "isConnected", params: {} });
  } catch (err) {
    return null;
  }
}

export async function getTranslation(expression: string): Promise<any> {
  const result = await Zotero.ZODH.data.bg.api_getTranslation(expression);
  // try {
  //   return await sendtoBackend({
  //     action: "getTranslation",
  //     params: { expression },
  //   });
  // } catch (err) {
  //   return null;
  // }
  return result;
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
