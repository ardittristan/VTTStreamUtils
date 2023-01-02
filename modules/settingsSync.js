import { libraryLog } from "../streamUtils.js";

export default async function settingsSync() {
  game.socket.on("module.0streamutils", (data) => {
    // set settings
    if (data.sendSettings && data.sendTo.includes(game.user.id)) {
      libraryLog("Beginning settings synchronization");

      Hooks.callAll("streamutilsReceivedSettings", data.settings);
      data.settings.forEach((setting) => {
        localStorage.setItem(setting.key, setting.data);
      });

      libraryLog("Finished settings synchronization");
    }
  });
}

Hooks.once("ready", setupGlobal);
Hooks.on("closeSettingsConfig", setupGlobal);

function setupGlobal() {
  // setup global
  window.Ardittristan = window.Ardittristan || {};
  window.Ardittristan.StreamUtils = window.Ardittristan.StreamUtils || {};
  const clientSettings = game.settings.storage.get("client");
  let store = Object.keys(clientSettings)
    .filter((key) => key.includes("0streamutils"))
    .map((key) => {
      return { key, data: clientSettings[key] };
    });
  window.Ardittristan.StreamUtils.clientSettings = store;
  Hooks.callAll("streamutilsSetupGlobal", store);
}

export class SendSettings extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "streamutils-sender",
      title: game.i18n.localize("streamUtils.windows.SettingsSender.title"),
      template: "modules/0streamutils/templates/sendSettings.html",
      classes: ["sheet"],
      closeOnSubmit: true,
      resizable: true,
    });
  }
  getData(options) {
    const data = super.getData(options);

    data.players = game.users["contents"]
      .filter((user) => user.active)
      .map((user) => {
        return { name: user.name, id: user.id };
      });

    return data;
  }

  /**
   * @param  {JQuery} html
   */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".cancelButton").on("click", () => this.close());
  }

  /**
   * @param {Event} _e
   * @param {FormData} data
   */
  _updateObject(_e, data) {
    let sendTo = [];
    Object.keys(data).forEach((key) => {
      if (data[key]) sendTo.push(key);
    });
    if (sendTo.length === 0) return;
    game.socket.emit("module.0streamutils", { settings: Ardittristan.StreamUtils.clientSettings, sendTo, sendSettings: true });
  }
}
