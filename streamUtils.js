import settingsSync, { SendSettings } from "./modules/settingsSync.js";
import registerHelpers from "./modules/registerHelpers.js";
import disableAudio from "./modules/disableAudio.js";
import applyCss from "./modules/applyCss.js";
import customInfo from "./modules/customInfo.js";
import combatTracker from "./modules/combatTracker.js";
import healthInfo from "./modules/healthInfo.js";
import diceSoNice from "./modules/diceSoNice.js";
import lastRoll from "./modules/lastRoll.js";
import journalShow from "./modules/journalShow.js";
import webrtc from "./modules/webrtc.js";
import changeableTemplates from "./templates/changeable.js";

if (window.location.pathname.includes("/stream")) {
  libraryLog("Initializing StreamUtils");

  // check for chat log to appear and then run main code
  observe("#chat-log", main);
  disableAudio();
} else {
  registerHelpers();
}

function main() {
  $("body").append($('<div class="streamUtils"></div>'));
  DocumentSheetConfig.initializeSheets();
  const origRenderTemplate = renderTemplate;
  renderTemplate = async function (path, data) {
    if (changeableTemplates.includes(path.replace(".", "_"))) {
      const setting = game.settings.get("0streamutils", "hbsChanger");
      if (setting[path.replace(".", "_")].trim().length > 0) return setting[path.replace(".", "_")];
    }
    return await origRenderTemplate(path, data);
  };
  Scene.prototype._onUpdate = function () {};
  Promise.all([
    registerHelpers(),
    settingsSync(),
    healthInfo(),
    applyCss(),
    customInfo(),
    combatTracker(),
    diceSoNice(),
    lastRoll(),
    journalShow(),
    webrtc(),
    //
  ]).then(() => {
    libraryLog("StreamUtils initialized");
  });
}

/*******************************************************/
// @section ingame part
/*******************************************************/

//#region
Hooks.once("init", () => {
  // hbs changer
  game.settings.registerMenu("0streamutils", "openHbsChanger", {
    name: "streamUtils.settings.openHbsChanger.name",
    label: "streamUtils.settings.openHbsChanger.label",
    hint: "streamUtils.windows.TemplateReplacer.text",
    type: TemplateReplacer,
    restricted: true,
  });

  game.settings.register("0streamutils", "hbsChanger", {
    scope: "world",
    type: Object,
    default: {},
  });

  // share settings
  game.settings.registerMenu("0streamutils", "sendSettings", {
    name: "streamUtils.settings.sendSettings.name",
    label: "streamUtils.settings.sendSettings.label",
    hint: "streamUtils.settings.sendSettings.hint",
    type: SendSettings,
    restricted: true,
  });

  // actor list settings
  game.settings.register("0streamutils", "checkedList", {
    scope: "client",
    type: Array,
    default: [],
  });
  game.settings.registerMenu("0streamutils", "actorSelector", {
    name: "streamUtils.settings.actorSelector.name",
    label: "streamUtils.settings.actorSelector.label",
    type: CharacterSelector,
    restricted: false,
  });
  game.settings.register("0streamutils", "globalCheckedList", {
    scope: "world",
    type: Array,
    default: [],
  });
  game.settings.registerMenu("0streamutils", "globalActorSelector", {
    name: "streamUtils.settings.globalActorSelector.name",
    label: "streamUtils.settings.globalActorSelector.label",
    hint: "streamUtils.settings.globalActorSelector.hint",
    type: GlobalCharacterSelector,
    restricted: true,
  });

  // user list settings
  game.settings.register("0streamutils", "checkedUserList", {
    scope: "client",
    type: Array,
    default: [],
  });
  game.settings.registerMenu("0streamutils", "userSelector", {
    name: "streamUtils.settings.userSelector.name",
    label: "streamUtils.settings.userSelector.label",
    type: UserSelector,
    restricted: false,
  });
  game.settings.register("0streamutils", "globalCheckedUserList", {
    scope: "world",
    type: Array,
    default: [],
  });
  game.settings.registerMenu("0streamutils", "globalUserSelector", {
    name: "streamUtils.settings.globalUserSelector.name",
    label: "streamUtils.settings.globalUserSelector.label",
    hint: "streamUtils.settings.globalUserSelector.hint",
    type: GlobalUserSelector,
    restricted: true,
  });

  // webrtc settings
  game.settings.register("0streamutils", "enableWebrtc", {
    name: "streamUtils.settings.enableWebrtc.name",
    scope: "client",
    type: Boolean,
    default: true,
    config: true,
  });

  // module disabler settings
  game.settings.register("0streamutils", "disabledModules", {
    name: "streamUtils.settings.disabledModules.name",
    hint: "streamUtils.settings.disabledModules.hint",
    scope: "world",
    type: String,
    default: "",
    config: true,
    onChange: () => localStorage.setItem("streamutilsDisabledModules", game.settings.get("0streamutils", "disabledModules")),
  });
  localStorage.setItem("streamutilsDisabledModules", game.settings.get("0streamutils", "disabledModules"));

  // hp module settings
  game.settings.register("0streamutils", "enableHpView", {
    name: "streamUtils.settings.enableHpView.name",
    scope: "client",
    type: Boolean,
    default: true,
    config: true,
  });
  game.settings.register("0streamutils", "hpPath", {
    name: "streamUtils.settings.hpPath.name",
    hint: "streamUtils.settings.hpPath.hint",
    scope: "world",
    type: String,
    default: "system.attributes.hp.value",
    config: true,
    restricted: true,
  });
  game.settings.register("0streamutils", "maxHpPath", {
    name: "streamUtils.settings.maxHpPath.name",
    hint: "streamUtils.settings.maxHpPath.hint",
    scope: "world",
    type: String,
    default: "system.attributes.hp.max",
    config: true,
    restricted: true,
  });

  // encounter module settings
  game.settings.register("0streamutils", "enableTracker", {
    name: "streamUtils.settings.enableTracker.name",
    scope: "client",
    type: Boolean,
    default: true,
    config: true,
  });

  // journal show module settings
  game.settings.register("0streamutils", "enableJournalShow", {
    name: "streamUtils.settings.enableJournalShow.name",
    scope: "client",
    type: Boolean,
    default: true,
    config: true,
  });

  game.settings.register("0streamutils", "enableJournalShowMonksJournal", {
    name: "streamUtils.settings.enableJournalShowMonksJournal.name",
    scope: "client",
    type: Boolean,
    default: true,
    config: true,
  });

  game.settings.register("0streamutils", "journalShowWidth", {
    name: "streamUtils.settings.journalShowWidth.name",
    scope: "client",
    type: Number,
    default: 500,
    config: true,
  });

  game.settings.register("0streamutils", "journalShowHeight", {
    name: "streamUtils.settings.journalShowHeight.name",
    scope: "client",
    type: Number,
    default: 500,
    config: true,
  });

  game.settings.register("0streamutils", "journalBackground", {
    name: "streamUtils.settings.journalBackground.name",
    scope: "client",
    type: String,
    default: "",
    config: true,
  });

  Hooks.on("renderSettingsConfig", (config, html) => {
    html.find(`.tab[data-tab="modules"] .form-group .form-fields input[name="0streamutils.journalBackground"]`).attr("placeholder", "../ui/parchment.jpg");
  });

  // last roll module settings
  game.settings.register("0streamutils", "enableLastRoll", {
    name: "streamUtils.settings.enableLastRoll.name",
    scope: "client",
    type: Boolean,
    default: true,
    config: true,
  });

  game.settings.register("0streamutils", "showFullSumLastRoll", {
    name: "streamUtils.settings.showFullSumLastRoll.name",
    hint: "streamUtils.settings.showFullSumLastRoll.hint",
    scope: "client",
    type: Boolean,
    default: true,
    config: true,
  });

  // DSN module settings
  game.settings.register("0streamutils", "enableDSN", {
    name: "streamUtils.settings.enableDSN.name",
    scope: "client",
    type: Boolean,
    default: true,
    config: true,
  });

  game.settings.register("0streamutils", "DSNWidth", {
    name: "streamUtils.settings.DSNWidth.name",
    scope: "client",
    type: Number,
    default: 300,
    config: true,
  });

  game.settings.register("0streamutils", "DSNHeight", {
    name: "streamUtils.settings.DSNHeight.name",
    scope: "client",
    type: Number,
    default: 300,
    config: true,
  });

  // custom module settings
  game.settings.registerMenu("0streamutils", "customEditor", {
    name: "streamUtils.settings.customEditor.name",
    label: "streamUtils.settings.customEditor.label",
    hint: "streamUtils.settings.customEditor.hint",
    icon: "far fa-file-code",
    type: CustomEditor,
    restricted: true,
  });
  game.settings.register("0streamutils", "enableCustom", {
    name: "streamUtils.settings.enableCustom.name",
    hint: "streamUtils.settings.enableCustom.hint",
    scope: "client",
    type: Boolean,
    default: true,
    config: true,
  });
  game.settings.register("0streamutils", "cssEditor", {
    scope: "world",
    config: false,
    type: String,
    default: "",
  });
  game.settings.register("0streamutils", "jsonEditor", {
    scope: "world",
    config: false,
    type: String,
    default: "[\n    \n]",
  });
  if (game.settings.get("0streamutils", "jsonEditor").length === 0) game.settings.set("0streamutils", "jsonEditor", "[\n    \n]");
});

Hooks.once("colorSettingsInitialized", (ColorSetting) => {
  new ColorSetting("0streamutils", "greenScreenColor", {
    name: "streamUtils.settings.greenScreenColor.name",
    restricted: false,
    defaultColor: "#00ff00",
    scope: "client",
  });
});

Hooks.once("ready", () => {
  // emit scene info for when scene changes
  game.socket.on("module.0streamutils", (data) => {
    if (data.getCombatData) {
      game.socket.emit("module.0streamutils", { currentScene: canvas.scene, sendCombatData: true });
    }
  });
});

class TemplateReplacer extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "streamutils-template-merger",
      title: game.i18n.localize("streamUtils.windows.TemplateReplacer.title"),
      template: "modules/0streamutils/templates/customTemplate.html",
      classes: ["sheet"],
      closeOnSubmit: true,
      resizable: true,
    });
  }

  getData(options) {
    const data = super.getData(options);

    data.setting = game.settings.get("0streamutils", "hbsChanger");
    data.changeable = changeableTemplates.map((e) => e.replace(".", "_"));

    return data;
  }

  _updateObject(_e, data) {
    game.settings.set("0streamutils", "hbsChanger", data);
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".cancelButton").on("click", () => this.close());
  }
}

/**
 * @description application that lists all actors and lets user check and uncheck actors
 *
 * @class CharacterSelector
 * @extends {FormApplication}
 */
class CharacterSelector extends FormApplication {
  constructor(options = {}) {
    super(options);

    this.actors = this.setupActorList();
    this.getList = this.getList.bind(this);
    this.setList = this.setList.bind(this);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "streamutils-chooser",
      title: game.i18n.localize("streamUtils.windows.CharacterSelector.title"),
      template: "modules/0streamutils/templates/charchooser.html",
      classes: ["sheet"],
      closeOnSubmit: true,
      resizable: true,
    });
  }

  getData(options) {
    const data = super.getData(options);

    data.actors = this.actors;

    return data;
  }

  /**
   * @param  {JQuery} html
   */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".cancelButton").on("click", () => this.close());
    html.find(".search-filter").on("keypress", (event) => {
      if (event.key === "Enter") event.preventDefault();
    });
    html.find(".search-filter").on("input", function (event) {
      if (this.value.length === 0) {
        this.classList.add("empty");
      } else {
        this.classList.remove("empty");
      }
      this.nextElementSibling.innerHTML = this.nextElementSibling.innerHTML.replace(
        /\/\* search-start \*\/".*?"\/\* search-end \*\//,
        `/* search-start */"${this.value}"/* search-end */`
      );
    });
  }

  setupActorList() {
    /** @type {[{name: String, id: String, checked: Boolean}]} */
    let actors = [];
    /** @type {String[]} */
    const checkedList = this.getList();

    game.actors.forEach(
      /** @param  {Actor} actor */
      (actor) => {
        actors.push({
          name: actor.name,
          id: actor.id,
          checked: checkedList.includes(actor.id),
        });
      }
    );

    return actors;
  }

  _updateObject(_e, data) {
    let checkedList = [];
    for (let prop in data) {
      if (data[prop]) {
        checkedList.push(prop);
      }
    }
    this.setList(checkedList);
  }

  // gets setting and sets current value to it
  /** @return {String[]} */
  getList() {
    return game.settings.get("0streamutils", "checkedList");
  }

  // sets setting to current value
  setList(checkedList) {
    game.settings.set("0streamutils", "checkedList", checkedList);
  }
}

// same as above but different settings
class GlobalCharacterSelector extends CharacterSelector {
  getList() {
    return game.settings.get("0streamutils", "globalCheckedList");
  }

  setList(checkedList) {
    game.settings.set("0streamutils", "globalCheckedList", checkedList);
  }
}

class UserSelector extends CharacterSelector {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      title: game.i18n.localize("streamUtils.windows.UserSelector.title"),
    });
  }

  getList() {
    return game.settings.get("0streamutils", "checkedUserList");
  }

  setList(checkedList) {
    game.settings.set("0streamutils", "checkedUserList", checkedList);
  }

  setupActorList() {
    /** @type {[{name: String, id: String, checked: Boolean}]} */
    let actors = [];
    /** @type {String[]} */
    const checkedList = this.getList();

    game.users.forEach(
      /** @param  {User} actor */
      (actor) => {
        actors.push({
          name: actor.name,
          id: actor.id,
          checked: checkedList.includes(actor.id),
        });
      }
    );

    return actors;
  }
}

class GlobalUserSelector extends UserSelector {
  getList() {
    return game.settings.get("0streamutils", "globalCheckedUserList");
  }

  setList(checkedList) {
    game.settings.set("0streamutils", "globalCheckedUserList", checkedList);
  }
}

/**
 * @description settings window that includes 2 ace editors
 *
 * @class CustomEditor
 * @extends {FormApplication}
 */
class CustomEditor extends FormApplication {
  constructor(object = {}, options = {}) {
    super(object, options);

    this.editorArray = {};
    this.unsaved = false;

    this.sendToSettings = this.sendToSettings.bind(this);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "custom-editor",
      title: game.i18n.localize("streamUtils.windows.CustomEditor.title"),
      template: "modules/0streamutils/templates/customEditor.html",
      classes: ["sheet"],
      closeOnSubmit: true,
      resizable: true,
      width: 602,
      height: 600,
    });
  }

  /** @param {JQuery} html */
  activateListeners(html) {
    super.activateListeners(html);

    // inserts ace editors into html
    this.initEditorHtml();

    // save functionality
    html.find("button.save-button").on("click", () => {
      this.sendToSettings();
    });
  }

  /**
   * @description checks if already saved on close
   *
   * @override
   * @private
   */
  _getHeaderButtons() {
    return [
      {
        label: game.i18n.localize("Close"),
        class: "close",
        icon: "fas fa-times",
        onclick: (_ev) => {
          if (this.unsaved) {
            Dialog.confirm({
              title: game.i18n.localize("streamUtils.windows.CustomEditor.saveDialog.title"),
              content: `<p>${game.i18n.localize("streamUtils.windows.CustomEditor.saveDialog.content")}</p>`,
              yes: () => {
                $("#custom-editor button.save-button").trigger("click");
                setTimeout(() => {
                  this.close();
                }, 50);
              },
              no: () => this.close(),
              defaultYes: false,
            });
          } else {
            this.close();
          }
        },
      },
    ];
  }

  initEditorHtml() {
    this.createEditor("cssEditor", "ace/mode/css");
    this.createEditor("jsonEditor", "ace/mode/json");
  }

  sendToSettings() {
    game.settings.set("0streamutils", "cssEditor", this.editorArray["cssEditor"].getValue());
    game.settings.set("0streamutils", "jsonEditor", this.editorArray["jsonEditor"].getValue());
    if (game.settings.get("0streamutils", "jsonEditor").length === 0) game.settings.set("0streamutils", "jsonEditor", "[\n    \n]");
    ui.notifications.notify(game.i18n.localize("streamUtils.windows.CustomEditor.saved"));
    this.unsaved = false;
  }

  createEditor(name, mode) {
    // adds editor to array of editors for later reference
    this.editorArray[name] = ace.edit(name);
    this.editorArray[name].setOptions(
      mergeObject(ace.userSettings, {
        mode: mode,
      })
    );
    // sets text in editor to the text in setting
    this.editorArray[name].setValue(game.settings.get("0streamutils", name), -1);
    // add saving with ctrl s
    this.editorArray[name].commands.addCommand({
      name: "Save",
      bindKey: { win: "Ctrl-S", mac: "Command-S" },
      exec: this.sendToSettings,
    });
    this.editorArray[name].getSession().on("change", () => {
      if (!this.unsaved) this.unsaved = true;
    });
    // resizes editor if container changes size
    new ResizeObserver(() => {
      this.editorArray[name].resize();
      this.editorArray[name].renderer.updateFull();
    }).observe(this.editorArray[name].container);
  }
}
//#endregion

/*******************************************************/
// @section ace multi-module compat
/*******************************************************/

//#region

Hooks.once("init", () => {
  ["ace/mode/json", "ace/mode/css", "ace/ext/language_tools", "ace/ext/error_marker", "ace/theme/twilight", "ace/snippets/json"].forEach((s) =>
    ace.config.loadModule(s)
  );
});

//#endregion

/*******************************************************/
// @section global functions
/*******************************************************/

//#region

/**
 * @description combines with await pauses code for set timeout
 *
 * @param {Number} ms
 */
export async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** @param {import('./docs/settings').Data} dataObject */
export function hasIcon(dataObject) {
  if (dataObject.icon && dataObject.icon.length !== 0) {
    return `<i class="${dataObject.icon}" ${hasIconColor(dataObject)}></i>`;
  } else {
    return "";
  }
}

/** @param {import('./docs/settings').Data} dataObject */
function hasIconColor(dataObject) {
  if (dataObject.iconColor && dataObject.iconColor.length !== 0) {
    return `style="color: ${dataObject.iconColor};"`;
  } else {
    return "";
  }
}

export function libraryLog(...args) {
  let outArgs = [];
  args.forEach((arg) => {
    const isString = typeof arg === "string";
    if (isString) arg = "%c" + arg + "%c";
    outArgs.push(arg);
    if (isString) outArgs.push("color: green;", "color: initial;");
  });
  console.log(...outArgs);
}
//#endregion

/*******************************************************/
// @section observer func
/*******************************************************/

//#region
/**
 * @description observes element and runs function when observed
 *
 * @param {String} selector CSS selector for element to be observed
 * @param {Function} func function to run once element is observed
 */
async function observe(selector, func) {
  libraryLog("Starting MutationObserver");

  const observer = new MutationObserver(() => {
    if ($(selector).length) {
      func();
      observer.disconnect();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  libraryLog("MutationObserver started");
}
//#endregion
