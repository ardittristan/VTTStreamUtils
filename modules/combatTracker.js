import { sleep } from "../streamUtils.js";

export default async function combatTracker() {
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
    game.socket.emit("module.0streamutils", { getCombatData: true });
    game.socket.on("module.0streamutils", (data) => {
      if (data.sendCombatData) {
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
    const combats = view ? game.combats.contents.filter((c) => c.data.scene === view._id) : [];

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

  // disable unneeded functions that spit errors
  _onCombatantHover() {}
  _onCombatantMouseDown() {}
  _onCombatantHoverIn() {}
  _onCombatantHoverOut() {}
  _contextMenu() {}
  _onConfigureCombatant() {}
}
