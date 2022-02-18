import { libraryLog } from "../streamUtils.js";

let color = getRandomColor();

export default async function diceSoNice() {
  if (!game.settings.get("0streamutils", "enableDSN")) return;

  libraryLog("Initializing DsN module");

  /** @type {String} */
  let dsnSource = document.querySelector('script[src*="modules/dice-so-nice"][src*="main.js"][type="module"]')?.src;
  if (dsnSource) {
    if (game.modules.get("dice-so-nice").data.version.match(/^[0-3]/) !== null) {
      let { Dice3D } = await import(dsnSource);
      init();
      main(Dice3D);
    } else if (game.modules.get("dice-so-nice").data.version.match(/^4\.[0-3]/) !== null) {
      let { Dice3D } = await import(dsnSource.replace("main.js", "Dice3D.js"));
      init();
      main(Dice3D);
    } else {
      init();
      await new Promise((resolve) => {
        Hooks.once("diceSoNiceReady", (dice3d) => {
          main(dice3d.constructor);
          resolve();
        });
        Hooks._hooks.ready.filter((hook) => hook.toString().includes("new Dice3D"))[0].call();
      });
    }
    libraryLog("Finished initializing DsN module");
  } else {
    console.error("DsN Not Found");
  }
}

function init() {
  game.user.color = color;
  game.user.data.color = color;
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

  if ((game.version ?? game.data.version).includes("0.7.")) {
    canvas = new Canvas();
  } else if ((game.version ?? game.data.version).split(".")[0] >= 9) {
    const board = document.createElement("div");
    board.id = "board";
    board.style.display = "none";
    document.body.appendChild(board);
    canvas.initialize();
  } else canvas.initialize();

  window.ui.sidebar = {};
  window.ui.sidebar.popouts = {};
}

function main(Dice3D) {
  class StreamDice3D extends Dice3D {
    _resizeCanvas() {
      this.canvas.width(game.settings.get("0streamutils", "DSNWidth") + "px");
      this.canvas.height(game.settings.get("0streamutils", "DSNHeight") + "px");
    }

    _buildCanvas() {
      super._buildCanvas();
      this.canvas.prependTo(".streamUtils");
    }

    _welcomeMessage() {}

    showForRoll(...args) {
      args.forEach((arg) => {
        if (arg?.constructor?.name === "User") {
          let color = getRandomColor();
          arg.color = arg.color || color;
          arg.data.color = arg.data?.color || color;
          arg.getFlag = (id, flag) => arg.data?.flags?.[id]?.[flag] || null;
        } else if (arg?.constructor?.name === "ChatSpeakerData") {
          arg = null;
        }
      });
      return super.showForRoll(...args);
    }
  }

  game.dice3d = new StreamDice3D();

  if (Number(game.modules.get("dice-so-nice").data.version.replace(".", "")) < 412) {
    Hooks._hooks.createChatMessage.unshift((chatMessage) => {
      if (chatMessage.isRoll) game.view = "game";
    });

    Hooks._hooks.createChatMessage.push((chatMessage) => {
      if (chatMessage.isRoll) game.view = "stream";
    });
  }
}

function getRandomColor() {
  var color = "#";
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
