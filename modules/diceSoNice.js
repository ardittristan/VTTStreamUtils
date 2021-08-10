export default async function diceSoNice() {
  if (!game.settings.get("0streamutils", "enableDSN")) return;

  /** @type {String} */
  let dsnSource = document.querySelector('script[src*="modules/dice-so-nice"][src*="main.js"][type="module"]')?.src;
  if (dsnSource) {
    if (game.modules.get("dice-so-nice").data.version.match(/^[0-3]/) !== null) {
      let { Dice3D } = await import(dsnSource);
      main(Dice3D);
    } else {
      let { Dice3D } = await import(dsnSource.replace("main.js", "Dice3D.js"));
      main(Dice3D);
    }
  }
}

function main(Dice3D) {
  let color = getRandomColor();
  game.user.color = color;
  game.user.data.color = color;
  game.user.getFlag = function () {
    return null;
  };

  if (game.data.version.includes("0.7.")) {
    canvas = new Canvas();
  } else canvas.initialize();

  window.ui.sidebar = {};
  window.ui.sidebar.popouts = {};

  class StreamDice3D extends Dice3D {
    _resizeCanvas() {
      this.canvas.width(game.settings.get("0streamutils", "DSNWidth") + "px");
      this.canvas.height(game.settings.get("0streamutils", "DSNHeight") + "px");
    }

    _buildCanvas() {
      super._buildCanvas();
      this.canvas.prependTo(".streamUtils");
    }

    showForRoll(...args) {
      args.forEach((arg) => {
        console.log(arg?.constructor?.name);
        if (arg?.constructor?.name === "User") {
          let color = getRandomColor();
          arg.color = color;
          arg.data.color = color;
          arg.getFlag = function () {
            return null;
          };
        } else if (arg?.constructor?.name === "ChatSpeakerData") {
          arg = null;
        }
      });
      return super.showForRoll(...args);
    }
  }

  game.dice3d = new StreamDice3D();

  Hooks._hooks.createChatMessage.unshift((chatMessage) => {
    if (chatMessage.isRoll) game.view = "game";
  });

  Hooks._hooks.createChatMessage.push((chatMessage) => {
    if (chatMessage.isRoll) game.view = "stream";
  });
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
