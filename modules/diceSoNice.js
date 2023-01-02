import { libraryLog } from "../streamUtils.js";

let color = getRandomColor();

export default async function diceSoNice() {
  if (!game.settings.get("0streamutils", "enableDSN")) return;

  libraryLog("Initializing DsN module");

  /** @type {String} */
  let dsnSource = document.querySelector('script[src*="modules/dice-so-nice"][src*="main.js"][type="module"]')?.src;
  if (dsnSource) {
    init();
    await new Promise((resolve) => {
      Hooks.once("diceSoNiceInit", (dice3d) => {
        main(dice3d.constructor);
        resolve();
      });
      Hooks.events.ready.filter((hook) => hook.fn.toString().includes("new Dice3D"))[0].fn.call();
    });
    libraryLog("Finished initializing DsN module");
  } else {
    console.error("DsN Not Found");
  }
}

function init() {
  game.user.color = color;
  // game.user.data.color = color;
  game.user.getFlag = function (scope, key) {
    if (scope === "dice-so-nice" && key === "settings")
      return {
        rollingArea: {
          left: 0,
          top: 0,
          width: game.settings.get("0streamutils", "DSNWidth"),
          height: game.settings.get("0streamutils", "DSNHeight"),
        },
      };
    return null;
  };

  const board = document.createElement("div");
  board.id = "board";
  board.style.display = "none";
  document.body.appendChild(board);
  canvas.initialize();

  window.ui.sidebar = {};
  window.ui.sidebar.popouts = {};
}

function main(Dice3D) {
  Dice3D.prototype._buildCanvasOrig = Dice3D.prototype._buildCanvas;
  Dice3D.prototype.showForRollOrig = Dice3D.prototype.showForRoll;

  Dice3D.prototype._buildCanvas = function () {
    this._buildCanvasOrig();
    this.canvas.width(game.settings.get("0streamutils", "DSNWidth") + "px");
    this.canvas.height(game.settings.get("0streamutils", "DSNHeight") + "px");
    this.canvas.prependTo(".streamUtils");
    console.log(this.canvas);
  };

  Dice3D.prototype._welcomeMessage = function () {};

  Dice3D.prototype.showForRoll = function (...args) {
    args.forEach((arg) => {
      if (arg?.constructor?.name === "User") {
        let color = getRandomColor();
        arg.color = arg.color || color;
        arg.getFlag = (id, flag) => arg.flags?.[id]?.[flag] || null;
      } else if (arg?.constructor?.name === "ChatSpeakerData") {
        arg = null;
      }
    });
    return this.showForRollOrig(...args);
  };
}

function getRandomColor() {
  let color = "#";
  color += getRandomHex();
  color += getRandomHex(80);
  color += getRandomHex();
  return color;
}

function getRandomHex(max = 255) {
  if (max < 0) max = 0;
  return Math.floor(Math.min(Math.random() * 16, max))
    .toString(16)
    .padStart(2, "0");
}
