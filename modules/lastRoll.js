import { libraryLog } from "../streamUtils.js";

export default async function lastRoll() {
  if (!game.settings.get("0streamutils", "enableLastRoll")) return;

  libraryLog("Initializing LastRoll module");

  await getTemplate("modules/0streamutils/templates/lastRollOverlay.html");
  $(".streamUtils").append($('<section id="lastRoll"><table id="lastRollApp"></table></section>'));
  game.users.forEach(async (user) => {
    if (
      // check if user list is defined
      game.settings.get("0streamutils", "checkedUserList").includes(user.id) ||
      (game.settings.get("0streamutils", "checkedUserList").length === 0 && game.settings.get("0streamutils", "globalCheckedUserList").includes(user.id))
    ) {
      let template = await renderTemplate("modules/0streamutils/templates/lastRollOverlay.html", {
        user: user,
        roll: tryGetLastRoll(user),
      });

      $("#lastRollApp").append(template);
    }
  });

  setInterval(() => {
    game.users.forEach(async (user) => {
      if (
        game.settings.get("0streamutils", "checkedUserList").includes(user.id) ||
        (game.settings.get("0streamutils", "checkedUserList").length === 0 && game.settings.get("0streamutils", "globalCheckedUserList").includes(user.id))
      ) {
        let element = document.getElementById(`lastRollApp${user.id}`);
        if (element) {
          element.innerHTML = `<i class="fas fa-dice-d20"></i> ${tryGetLastRoll(user)}`;
        }
      }
    });
  }, 5000);

  libraryLog("Finished initializing LastRoll module");
}

if (window.location.pathname.includes("/stream"))
  Hooks.on(
    "renderChatMessage",
    /**
     * @param  {ChatMessage} chatMessage
     */
    function (chatMessage) {
      if (game.settings.get("0streamutils", "enableLastRoll") && chatMessage.isRoll) {
        chatMessage.user.lastRoll = game.settings.get("0streamutils", "showFullSumLastRoll") ? chatMessage.rolls?.[0]?.total : chatMessage.rolls?.[0]?.result;
      }
    }
  );

/** @param  {User} user */
function tryGetLastRoll(user) {
  if (user?.lastRoll) return user.lastRoll;
  console.log(user);
  return "";
}
