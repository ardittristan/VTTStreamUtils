export default async function diceSoNice() {
  if (!game.settings.get("0streamutils", "enableDSN")) return;

  /** @type {String} */
  let dsnSource = document.querySelector('script[src*="modules/dice-so-nice"][src*="main.js"][type="module"]')?.src;
  if (dsnSource) {
    let { Dice3D } = await import(dsnSource);
    main(Dice3D);
  }
}

function main(Dice3D) {
  game.user.color = getRandomColor();
  canvas.initialize();

  Dice3D.ALL_CUSTOMIZATION = function (user = game.user) {
    user.color = getRandomColor();
    user.getFlag = function () {
      return undefined;
    };
    return Dice3D.APPEARANCE(user);
  };

  class StreamDice3D extends Dice3D {
    _resizeCanvas() {
      this.canvas.width(game.settings.get("0streamutils", "DSNWidth") + "px");
      this.canvas.height(game.settings.get("0streamutils", "DSNHeight") + "px");
    }

    _buildCanvas() {
      super._buildCanvas();
      this.canvas.prependTo(".streamUtils");
    }
  }

  game.dice3d = new StreamDice3D();

  Hooks.on("createChatMessage", (chatMessage) => {
    //precheck for better perf
    let hasInlineRoll = game.settings.get("dice-so-nice", "animateInlineRoll") && chatMessage.data.content.indexOf("inline-roll") !== -1;
    if (
      (!chatMessage.isRoll && !hasInlineRoll) ||
      !chatMessage.isContentVisible ||
      !game.dice3d ||
      game.dice3d.messageHookDisabled ||
      (chatMessage.getFlag("core", "RollTable") && !game.settings.get("dice-so-nice", "animateRollTable"))
    ) {
      return;
    }
    let roll = chatMessage.roll;
    if (hasInlineRoll) {
      let JqInlineRolls = $($.parseHTML(chatMessage.data.content)).filter(".inline-roll.inline-result");
      if (JqInlineRolls.length == 0 && !chatMessage.isRoll)
        //it was a false positive
        return;
      let inlineRollList = [];
      JqInlineRolls.each((index, el) => {
        inlineRollList.push(Roll.fromJSON(unescape(el.dataset.roll)));
      });
      if (inlineRollList.length) {
        if (chatMessage.isRoll) inlineRollList.push(chatMessage.roll);
        let mergingPool = new DicePool({ rolls: inlineRollList }).evaluate();
        roll = Roll.create(mergingPool.formula).evaluate();
        roll.terms = [mergingPool];
        roll.results = [mergingPool.total];
        roll._total = mergingPool.total;
        roll._rolled = true;
      } else if (!chatMessage.isRoll) return;
    }

    let actor = game.actors.get(chatMessage.data.speaker.actor);
    const isNpc = actor ? actor.data.type === "npc" : false;
    if (isNpc && game.settings.get("dice-so-nice", "hideNpcRolls")) {
      return;
    }

    //Remove the chatmessage sound if it is the core dice sound.
    if (Dice3D.CONFIG.sounds && chatMessage.data.sound == "sounds/dice.wav") {
      mergeObject(chatMessage.data, { "-=sound": null });
    }
    chatMessage._dice3danimating = true;
    game.dice3d.showForRoll(roll, { ...chatMessage.user, ...{ color: getRandomColor() } }, false, null, false, chatMessage.id).then((displayed) => {
      delete chatMessage._dice3danimating;
      $(`#chat-log .message[data-message-id="${chatMessage.id}"]`).show();
      Hooks.callAll("diceSoNiceRollComplete", chatMessage.id);
      ui.chat.scrollBottom();
    });
  });
}

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
