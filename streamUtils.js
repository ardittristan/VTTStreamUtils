if (window.location.pathname.includes("/stream")) {
  observe("#chat-log", main);
}

function main() {
  $("body").append($('<div class="streamUtils"></div>'))
  healthInfo();
  applyCss();
  customInfo();
}

/*******************************************************/
//@section apply css
/*******************************************************/

async function applyCss() {
  $("head").append($(`<style>${game.settings.get("streamutils", "cssEditor")}</style>`));
}

/*******************************************************/
//@section custom info
/*******************************************************/

//#region
async function customInfo() {
  if (!game.settings.get("streamutils", "enableCustom")) return;
  /** @type {import('./docs/settings').SettingsObject[]} */
  let settings = JSON.parse(game.settings.get("streamutils", "jsonEditor"));
  if (settings.length === 0) return;

  settings.forEach((setting) => {
    if (setting.actorList === false) {
      // if it has custom entries
      $(".streamUtils").append($(`<section class="customApp" id="${setting.id}"><table id="${setting.id}App"></table></section>`));
      setting.data.forEach((entry) => {
        let entries = "";

        entry.rowData.forEach((dataObject) => {
          entries =
            entries +
            `
            <td>
              <div class="${dataObject.name} number" id="${setting.id}App${entry.rowName}${dataObject.name}">
                ${hasIcon(dataObject)} ${getProperty(window, dataObject.path)}
              </div>
            </td>
          `;
        });

        $(`#${setting.id}App`).append(
          $(`
            <tr class="playerRow">
              ${entries}
              <td>
                ${entry.rowName}
              </td>
            </tr>
          `)
        );
      });

      setInterval(() => {
        setting.data.forEach((entry) => {
          entry.rowData.forEach((dataObject) => {
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
      game.actors.forEach((actor) => {
        if (
          game.settings.get("streamutils", "checkedList")[0].includes(actor.id) ||
          (game.settings.get("streamutils", "checkedList")[0].length === 0 && game.settings.get("streamutils", "globalCheckedList")[0].includes(actor.id))
        ) {
          let entries = "";

          setting.data.forEach((dataObject) => {
            entries =
              entries +
              `
              <td>
                <div class="${dataObject.name} number" id="${setting.id}App${actor.id}${dataObject.name}">
                  ${hasIcon(dataObject)} ${getProperty(actor, dataObject.path)}
                </div>
              </td>
            `;
          });

          $(`#${setting.id}App`).append(
            $(`
              <tr class="playerRow">
                ${entries}
                <td>
                  ${actor.name}
                </td>
              </tr>
            `)
          );
        }
      });

      setInterval(() => {
        game.actors.forEach((actor) => {
          if (
            game.settings.get("streamutils", "checkedList")[0].includes(actor.id) ||
            (game.settings.get("streamutils", "checkedList")[0].length === 0 && game.settings.get("streamutils", "globalCheckedList")[0].includes(actor.id))
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
//@section health info
/*******************************************************/

//#region
async function healthInfo() {
  if (!game.settings.get("streamutils", "enableHpView")) return;
  $(".streamUtils").append($('<section id="hp"><table id="hpApp"></table></section>'));
  game.actors.forEach((actor) => {
    if (
      game.settings.get("streamutils", "checkedList")[0].includes(actor.id) ||
      (game.settings.get("streamutils", "checkedList")[0].length === 0 && game.settings.get("streamutils", "globalCheckedList")[0].includes(actor.id))
    ) {
      $("#hpApp").append(
        $(`
          <tr class="playerRow">
            <td>
              <div class="hp" id="hpApp${actor.id}">
                ${getHPString(getProperty(actor, game.settings.get("streamutils", "hpPath")), getProperty(actor, game.settings.get("streamutils", "maxHpPath")))}
              </div>
            </td>
            <td>
              ${actor.name}
            </td>
          </tr>
        `)
      );
    }
  });

  setInterval(() => {
    game.actors.forEach((actor) => {
      if (
        game.settings.get("streamutils", "checkedList")[0].includes(actor.id) ||
        (game.settings.get("streamutils", "checkedList")[0].length === 0 && game.settings.get("streamutils", "globalCheckedList")[0].includes(actor.id))
      ) {
        let element = document.getElementById(`hpApp${actor.id}`);
        if (element) {
          element.innerHTML = getHPString(
            getProperty(actor, game.settings.get("streamutils", "hpPath")),
            getProperty(actor, game.settings.get("streamutils", "maxHpPath"))
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

Hooks.once("init", () => {
  game.settings.register("streamutils", "checkedList", {
    scope: "client",
    type: Array,
    default: [],
  });
  game.settings.registerMenu("streamutils", "actorSelector", {
    name: "streamUtils.settings.actorSelector.name",
    label: "streamUtils.settings.actorSelector.label",
    type: CharacterSelector,
    restricted: false,
  });
  game.settings.register("streamutils", "globalCheckedList", {
    scope: "world",
    type: Array,
    default: [],
  });
  game.settings.registerMenu("streamutils", "globalActorSelector", {
    name: "streamUtils.settings.globalActorSelector.name",
    label: "streamUtils.settings.globalActorSelector.label",
    hint: "streamUtils.settings.globalActorSelector.hint",
    type: GlobalCharacterSelector,
    restricted: true,
  });

  // module settings
  game.settings.register("streamutils", "enableHpView", {
    name: "streamUtils.settings.enableHpView.name",
    scope: "client",
    type: Boolean,
    default: true,
    config: true,
  });
  game.settings.register("streamutils", "hpPath", {
    name: "streamUtils.settings.hpPath.name",
    hint: "streamUtils.settings.hpPath.hint",
    scope: "world",
    type: String,
    default: "data.data.attributes.hp.value",
    config: true,
    restricted: true,
  });
  game.settings.register("streamutils", "maxHpPath", {
    name: "streamUtils.settings.maxHpPath.name",
    hint: "streamUtils.settings.maxHpPath.hint",
    scope: "world",
    type: String,
    default: "data.data.attributes.hp.max",
    config: true,
    restricted: true,
  });

  // custom module settings
  game.settings.registerMenu("streamutils", "customEditor", {
    name: "streamUtils.settings.customEditor.name",
    label: "streamUtils.settings.customEditor.label",
    hint: "streamUtils.settings.customEditor.hint",
    icon: "far fa-file-code",
    type: CustomEditor,
    restricted: true,
  });
  game.settings.register("streamutils", "enableCustom", {
    name: "streamUtils.settings.enableCustom.name",
    hint: "streamUtils.settings.enableCustom.hint",
    scope: "client",
    type: Boolean,
    default: true,
    config: true,
  });
  game.settings.register("streamutils", "cssEditor", {
    scope: "world",
    config: false,
    type: String,
    default: "",
  });
  game.settings.register("streamutils", "jsonEditor", {
    scope: "world",
    config: false,
    type: String,
    default: "[\n    \n]",
  });
  if (game.settings.get("streamutils", "jsonEditor").length === 0) game.settings.set("streamutils", "jsonEditor", "[\n    \n]");
});

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
      template: "modules/streamutils/templates/charchooser.html",
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

  /** @return {String[]} */
  getList() {
    return game.settings.get("streamutils", "checkedList")?.[0];
  }

  setList(checkedList) {
    game.settings.set("streamutils", "checkedList", checkedList);
  }
}

class GlobalCharacterSelector extends CharacterSelector {
  getList() {
    return game.settings.get("streamutils", "globalCheckedList")?.[0];
  }

  setList(checkedList) {
    game.settings.set("streamutils", "globalCheckedList", checkedList);
  }
}

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
      template: "modules/streamutils/templates/customEditor.html",
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

    this.initEditorHtml();

    html.find("button.save-button").on("click", () => {
      this.sendToSettings();
    });
  }

  getData(options) {
    const data = super.getData(options);

    return data;
  }

  /**
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
    game.settings.set("streamutils", "cssEditor", this.editorArray["cssEditor"].getValue());
    game.settings.set("streamutils", "jsonEditor", this.editorArray["jsonEditor"].getValue());
    if (game.settings.get("streamutils", "jsonEditor").length === 0) game.settings.set("streamutils", "jsonEditor", "[\n    \n]");
    ui.notifications.notify(game.i18n.localize("streamUtils.windows.CustomEditor.saved"));
    this.unsaved = false;
  }

  createEditor(name, mode) {
    this.editorArray[name] = ace.edit(name);
    this.editorArray[name].setOptions({
      mode: mode,
      theme: "ace/theme/twilight",
      showPrintMargin: false,
      enableLiveAutocompletion: true,
    });
    this.editorArray[name].setValue(game.settings.get("streamutils", name), -1);
    this.editorArray[name].commands.addCommand({
      name: "Save",
      bindKey: { win: "Ctrl-S", mac: "Command-S" },
      exec: this.sendToSettings,
    });
    this.editorArray[name].getSession().on("change", () => {
      if (!this.unsaved) this.unsaved = true;
    });
    new ResizeObserver(() => {
      this.editorArray[name].resize();
      this.editorArray[name].renderer.updateFull();
    }).observe(this.editorArray[name].container);
  }
}

/*******************************************************/
// @section ace multimodule compat
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
// @section observer func
/*******************************************************/

//#region
/**
 * @description observes element and runs function when observed
 *
 * @param {String} selector CSS selector for element to be observed
 * @param {Function} func function to run once element is observed
 */
function observe(selector, func) {
  if (document?.readyState !== "complete") {
    setTimeout(() => {
      observe(selector, func);
    }, 100);
    return;
  }

  const observer = new MutationObserver(() => {
    if ($(selector).length) {
      func();
      observer.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
//#endregion
