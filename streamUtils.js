if (window.location.pathname === "/stream") {
  observe("#chat-log", main);
}

function main() {
  healthInfo();
}

/*******************************************************/
//@section health info
/*******************************************************/

//#region
async function healthInfo() {
  $("body").append($('<section id="hp"><table id="hpApp"></table></section>'));
  game.actors.forEach((actor) => {
    if (
      game.settings.get("streamutils", "checkedList")[0].includes(actor.id) ||
      (game.settings.get("streamutils", "checkedList")[0].length === 0 && game.settings.get("streamutils", "globalCheckedList")[0].includes(actor.id))
    ) {
      $("#hpApp").append(
        $(`
<tr class="playerRow">
  <td>
    <span class="hp" id="hpApp${actor.id}">
      ${getHPString(getNestedData(actor, game.settings.get("streamutils", "hpPath")))}
    </span>
  </td>
  <td>
    ${actor.data.name}
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
          let health = getNestedData(actor, game.settings.get("streamutils", "hpPath"));
          if (health === 0) {
            element.innerHTML = '<i class="fas fa-skull"></i> ' + health;
          } else {
            element.innerHTML = '<i class="fas fa-heart"></i> ' + health;
          }
        }
      }
    });
  }, 5000);
}

function getHPString(health) {
  if (health === 0) {
    return '<i class="fas fa-skull"></i> ' + health;
  } else {
    return '<i class="fas fa-heart"></i> ' + health;
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
    name: "Shown Actors",
    label: "Open Actor List",
    type: CharacterSelector,
    restricted: false,
  });
  game.settings.register("streamutils", "globalCheckedList", {
    scope: "world",
    type: Array,
    default: [],
  });
  game.settings.registerMenu("streamutils", "globalActorSelector", {
    name: "Shown Actors - Global",
    label: "Open Actor List - Global",
    hint: "Global fallback actor list if client list is empty",
    type: GlobalCharacterSelector,
    restricted: true,
  });

  // module settings
  game.settings.register("streamutils", "enableHpView", {
    name: "Enable HP View",
    scope: "client",
    type: Boolean,
    default: true,
    config: true,
  });
  game.settings.register("streamutils", "hpPath", {
    name: "HP Variable Path",
    hint: "The path to the hp variable without including Actor (if it's 'Actor.data.hp.value' for example it'll be 'data.hp.value')",
    scope: "world",
    type: String,
    default: "data.data.attributes.hp.value",
    config: true,
    restricted: true,
  });
});

class CharacterSelector extends FormApplication {
  constructor(options = {}) {
    super(options);

    this.actors = this.setupActorList();
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "streamutils-chooser",
      title: "Choose actors to show",
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
    const checkedList = game.settings.get("streamutils", "checkedList")?.[0];

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
    game.settings.set("streamutils", "checkedList", checkedList);
  }
}

class GlobalCharacterSelector extends CharacterSelector {
  setupActorList() {
    /** @type {[{name: String, id: String, checked: Boolean}]} */
    let actors = [];
    /** @type {String[]} */
    const checkedList = game.settings.get("streamutils", "globalCheckedList")?.[0];

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
    game.settings.set("streamutils", "globalCheckedList", checkedList);
  }
}

/*******************************************************/
// @section global functions
/*******************************************************/

/**
 * @description gets object data from supplied string path
 *
 * @param {Object} obj
 * @param {String} path
 */
function getNestedData(obj, path = "") {
  const pathData = path.split(".");
  if (pathData.length === 0) return null;

  let res = obj;
  pathData.forEach((prop) => {
    if (res === undefined) return null;
    res = res?.[prop];
  });
  return res;
}

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
