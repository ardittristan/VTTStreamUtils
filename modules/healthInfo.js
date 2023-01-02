import { libraryLog } from "../streamUtils.js";

export default async function healthInfo() {
  if (!game.settings.get("0streamutils", "enableHpView")) return;

  libraryLog("Initializing HealthInfo module");

  await getTemplate("modules/0streamutils/templates/hpOverlay.html");
  $(".streamUtils").append($('<section id="hp"><table id="hpApp"></table></section>'));
  game.actors.forEach(async (actor) => {
    if (
      // check if actor list is defined
      game.settings.get("0streamutils", "checkedList").includes(actor.id) ||
      (game.settings.get("0streamutils", "checkedList").length === 0 && game.settings.get("0streamutils", "globalCheckedList").includes(actor.id))
    ) {
      let template = await renderTemplate("modules/0streamutils/templates/hpOverlay.html", {
        actor: actor,
        hp: getProperty(actor, game.settings.get("0streamutils", "hpPath")),
        maxHp: getProperty(actor, game.settings.get("0streamutils", "maxHpPath")),
      });

      $("#hpApp").append(template);
    }
  });

  setInterval(() => {
    game.actors.forEach((actor) => {
      if (
        game.settings.get("0streamutils", "checkedList").includes(actor.id) ||
        (game.settings.get("0streamutils", "checkedList").length === 0 && game.settings.get("0streamutils", "globalCheckedList").includes(actor.id))
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

  libraryLog("Finished initializing HealthInfo module");
}

function getHPString(health, maxHealth) {
  if (health === 0) {
    return `<i class="fas fa-skull"></i> ${health}/${maxHealth}`;
  } else {
    return `<i class="fas fa-heart"></i> ${health}/${maxHealth}`;
  }
}
