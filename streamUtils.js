if (window.location.pathname.includes("/stream")) {
  // disable user disabled modules
  disableModules();
  // check for chat log to appear and then run main code
  observe("#chat-log", main);
}

function main() {
  $("body").append($('<div class="streamUtils"></div>'));
  registerHelpers();
  healthInfo();
  applyCss();
  customInfo();
  combatTracker();
  disableAudio();
}

/*******************************************************/
//@section register handlebars helpers
/*******************************************************/

//#region
async function registerHelpers() {
  Handlebars.registerHelper("getProperty", function (data, property) {
    return getProperty(data, property);
  });
  Handlebars.registerHelper("equals", function(a, b) {
    return a === b;
  })
  // for custom overlay
  Handlebars.registerHelper("hasIcon", function (dataObject) {
    return hasIcon(dataObject);
  });
}
//#endregion

/*******************************************************/
//@section disable audio
/*******************************************************/

//#region
async function disableAudio() {
  // disables audio since it doesn't work on /stream anyway
  AudioHelper.getAudioContext = function () {
    if (this._audioContext) return this._audioContext;
    return null;
  };
  AudioHelper.play = function () {
    return;
  };
}
//#endregion

/*******************************************************/
//@section disable modules
/*******************************************************/

//#region
async function disableModules() {
  // gets filter settings from local storage since game settings load too late
  const filter = localStorage.getItem("streamutilsDisabledModules").split(",");
  // filter always has at least a lenght of 1 with "" in it because of default settings, so checking if first entry in array has content
  if (filter?.[0]?.length === 0 || filter?.[0]?.length === undefined) return;
  // hack to disable scripts that load after this script
  new MutationObserver((mutations) => {
    mutations.forEach(({ addedNodes }) => {
      addedNodes.forEach((node) => {
        if (node.nodeType === 1 && node.tagName === "SCRIPT") {
          const src = node.src || "";
          // filter gets checked here
          if (stringIncludesArray(src, filter)) {
            node.type = "javascript/blocked";

            //Firefox compat
            const beforeScriptExecuteListener = function (event) {
              if (node.getAttribute("type") === "javascript/blocked") event.preventDefault();
              node.removeEventListener("beforescriptexecute", beforeScriptExecuteListener);
            };
            node.addEventListener("beforescriptexecute", beforeScriptExecuteListener);
          }
        }
      });
    });
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

/**
 * @description checks if string includes any string in the array
 *
 * @param {String} string
 * @param {String[]} array
 */
function stringIncludesArray(string, array) {
  let included = false;
  array.forEach((entry) => {
    if (string.includes(entry)) included = true;
  });
  return included;
}
//#endregion

/*******************************************************/
//@section apply css
/*******************************************************/

//#region
async function applyCss() {
  $("head").append($(`<style>${game.settings.get("0streamutils", "cssEditor")}</style>`));
}
//#endregion

/*******************************************************/
//@section custom info
/*******************************************************/

//#region
async function customInfo() {
  if (!game.settings.get("0streamutils", "enableCustom")) return;
  // preload template
  await getTemplate("modules/0streamutils/templates/customOverlay.html")
  /** @type {import('./docs/settings').SettingsObject[]} */
  let settings = JSON.parse(game.settings.get("0streamutils", "jsonEditor"));
  if (settings.length === 0) return;

  // for each entry in the JSON settings object
  settings.forEach((setting) => {
    if (setting.actorList === false) {
      // if it has custom entries
      $(".streamUtils").append($(`<section class="customApp" id="${setting.id}"><table id="${setting.id}App"></table></section>`));
      setting.data.forEach(async (entry) => {
        let template = await renderTemplate("modules/0streamutils/templates/customOverlay.html", {
          iterator: entry.rowData,
          appId: setting.id,
          rowId: entry.rowName,
          name: entry.rowName,
          iconObj: window,
        });

        $(`#${setting.id}App`).append(template);
      });

      // update data every 5 sec after initializing
      setInterval(() => {
        setting.data.forEach((entry) => {
          entry.rowData.forEach((dataObject) => {
            // searches and replaces element with actor info
            let element = document.getElementById(`${setting.id}App${entry.rowName}${dataObject.name}`);
            if (element) {
              element.innerHTML = `${hasIcon(dataObject)} ${getProperty(window, dataObject.path)}`;
            }
          });
        });
      }, 5000);
    } else {
      // if it uses the actor list as entries
      $(".streamUtils").append($(`<section class="customApp" id="${setting.id}"><table id="${setting.id}App"></table></section>`));
      game.actors.forEach(async (actor) => {
        if (
          // check if actor list is defined
          game.settings.get("0streamutils", "checkedList")[0].includes(actor.id) ||
          (game.settings.get("0streamutils", "checkedList")[0].length === 0 && game.settings.get("0streamutils", "globalCheckedList")[0].includes(actor.id))
        ) {
          let template = await renderTemplate("modules/0streamutils/templates/customOverlay.html", {
            iterator: setting.data,
            appId: setting.id,
            rowId: actor.id,
            name: actor.name,
            iconObj: actor,
          });

          $(`#${setting.id}App`).append(template);
        }
      });

      setInterval(() => {
        game.actors.forEach((actor) => {
          if (
            game.settings.get("0streamutils", "checkedList")[0].includes(actor.id) ||
            (game.settings.get("0streamutils", "checkedList")[0].length === 0 && game.settings.get("0streamutils", "globalCheckedList")[0].includes(actor.id))
          ) {
            setting.data.forEach((dataObject) => {
              let element = document.getElementById(`${setting.id}App${actor.id}${dataObject.name}`);
              if (element) {
                element.innerHTML = `${hasIcon(dataObject)} ${getProperty(actor, dataObject.path)}`;
              }
            });
          }
        });
      }, 5000);
    }
  });
}

/** @param {import('./docs/settings').Data} dataObject */
function hasIcon(dataObject) {
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
//#endregion

/*******************************************************/
//@section combat tracker
/*******************************************************/

//#region
async function combatTracker() {
  if (!game.settings.get("0streamutils", "enableTracker")) return;

  ui.combat = new CombatOverlay();
  ui.combat.render(true);
}

class CombatOverlay extends CombatTracker {
  constructor(options) {
    super(options);
    /** @type {Scene} */
    this.currentScene = null;

    // emit request for getting current scene info
    game.socket.emit("module.0streamutils", { getData: true });
    game.socket.on("module.0streamutils", (data) => {
      if (data.sendData) {
        // when info received
        this.currentScene = data.currentScene;
        this.render();
      }
    });
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "combat",
      template: "modules/0streamutils/templates/combatTracker.html",
      title: "Combat Tracker",
      scrollY: [".directory-list"],
    });
  }

  async getData(options) {
    let data = await super.getData(options);

    // replace data that doesn't exist on /stream with the required data
    const view = this.currentScene || null;
    const combats = view ? game.combats.entities.filter((c) => c.data.scene === view._id) : [];

    data.combats = combats;
    data.combatCount = combats.length;

    return data;
  }

  render(force, options = {}) {
    super.render(force, options);
    if (force) {
      this.firstRender();
    }
  }

  // append to it's container div on the first render
  async firstRender() {
    while (!this._element) {
      await sleep(50);
    }
    this._element.appendTo(".streamUtils");
    this.render();
  }

  // disable since it was spitting errors and you don't hover in stream overlay
  _onCombatantHover() {}
}
//#endregion

/*******************************************************/
//@section health info
/*******************************************************/

//#region
async function healthInfo() {
  if (!game.settings.get("0streamutils", "enableHpView")) return;
  await getTemplate("modules/0streamutils/templates/hpOverlay.html");
  $(".streamUtils").append($('<section id="hp"><table id="hpApp"></table></section>'));
  game.actors.forEach(async (actor) => {
    if (
      // check if actor list is defined
      game.settings.get("0streamutils", "checkedList")[0].includes(actor.id) ||
      (game.settings.get("0streamutils", "checkedList")[0].length === 0 && game.settings.get("0streamutils", "globalCheckedList")[0].includes(actor.id))
    ) {
      let template = await renderTemplate("modules/0streamutils/templates/hpOverlay.html", {
        actor: actor,
        hp: getProperty(actor, game.settings.get("0streamutils", "hpPath")),
        maxHp: getProperty(actor, game.settings.get("0streamutils", "maxHpPath"))
      });

      $("#hpApp").append(template);
    }
  });

  setInterval(() => {
    game.actors.forEach((actor) => {
      if (
        game.settings.get("0streamutils", "checkedList")[0].includes(actor.id) ||
        (game.settings.get("0streamutils", "checkedList")[0].length === 0 && game.settings.get("0streamutils", "globalCheckedList")[0].includes(actor.id))
      ) {
        let element = document.getElementById(`hpApp${actor.id}`);
        if (element) {
          element.innerHTML = getHPString(
            getProperty(actor, game.settings.get("0streamutils", "hpPath")),
            getProperty(actor, game.settings.get("0streamutils", "maxHpPath"))
          );
        }
      }
    });
  }, 5000);
}

function getHPString(health, maxHealth) {
  if (health === 0) {
    return `<i class="fas fa-skull"></i> ${health}/${maxHealth}`;
  } else {
    return `<i class="fas fa-heart"></i> ${health}/${maxHealth}`;
  }
}
//#endregion

/*******************************************************/
// @section ingame part
/*******************************************************/

//#region
Hooks.once("init", () => {
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
    default: "data.data.attributes.hp.value",
    config: true,
    restricted: true,
  });
  game.settings.register("0streamutils", "maxHpPath", {
    name: "streamUtils.settings.maxHpPath.name",
    hint: "streamUtils.settings.maxHpPath.hint",
    scope: "world",
    type: String,
    default: "data.data.attributes.hp.max",
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

Hooks.once("ready", () => {
  // emit scene info for when scene changes
  game.socket.on("module.0streamutils", (data) => {
    if (data.getData) {
      game.socket.emit("module.0streamutils", { currentScene: canvas.scene, sendData: true });
    }
  });
});

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
    return game.settings.get("0streamutils", "checkedList")?.[0];
  }

  // sets setting to current value
  setList(checkedList) {
    game.settings.set("0streamutils", "checkedList", checkedList);
  }
}

// same as above but different settings
class GlobalCharacterSelector extends CharacterSelector {
  getList() {
    return game.settings.get("0streamutils", "globalCheckedList")?.[0];
  }

  setList(checkedList) {
    game.settings.set("0streamutils", "globalCheckedList", checkedList);
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
      title: game.i18n.localize("streamUtils.windows.customEditor.title"),
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

  getData(options) {
    const data = super.getData(options);

    return data;
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
        onclick: (ev) => {
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
    this.editorArray[name].setOptions({
      mode: mode,
      theme: "ace/theme/twilight",
      showPrintMargin: false,
      enableLiveAutocompletion: true,
    });
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
/** @type {String} */
const scriptLocation = getRunningScript()().replace("streamUtils.js", "");

Hooks.once("init", () => {
  setAceModules([
    ["ace/mode/json", "lib/ace/mode-json.js"],
    ["ace/mode/css", "lib/ace/mode-css.js"],
    ["ace/ext/language_tools", "lib/ace/ext-language_tools.js"],
    ["ace/mode/json_worker", "lib/ace/worker-json.js"],
    ["ace/mode/css_worker", "lib/ace/worker-css.js"],
    ["ace/ext/error_marker", "lib/ace/ext-error_marker.js"],
    ["ace/theme/twilight", "lib/ace/theme-twilight.js"],
    ["ace/snippets/json", "lib/ace/snippets/json.js"],
  ]);
});

/** @returns {String} script location */
function getRunningScript() {
  return () => {
    return new Error().stack.match(/([^ \n])*([a-z]*:\/\/\/?)*?[a-z0-9\/\\]*\.js/gi)[0];
  };
}

/** @param  {String[]} stringArray */
function setAceModules(stringArray) {
  stringArray.forEach((data) => {
    ace.config.setModuleUrl(data[0], scriptLocation.concat(data[1]));
    ace.config.loadModule(data[0]);
  });
}
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
async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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
}
//#endregion
