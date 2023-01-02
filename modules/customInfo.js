import { hasIcon, libraryLog } from "../streamUtils.js";

export default async function customInfo() {
  if (!game.settings.get("0streamutils", "enableCustom")) return;

  libraryLog("Initializing custom info module");

  // preload template
  await getTemplate("modules/0streamutils/templates/customOverlay.html");
  /** @type {import('../docs/settings').SettingsObject[]} */
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
          game.settings.get("0streamutils", "checkedList").includes(actor.id) ||
          (game.settings.get("0streamutils", "checkedList").length === 0 && game.settings.get("0streamutils", "globalCheckedList").includes(actor.id))
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
            game.settings.get("0streamutils", "checkedList").includes(actor.id) ||
            (game.settings.get("0streamutils", "checkedList").length === 0 && game.settings.get("0streamutils", "globalCheckedList").includes(actor.id))
          ) {
            setting.data.forEach((dataObject) => {
              let element = document.getElementById(`${setting.id}App${actor.id}${dataObject.name}`);
              if (element) {
                element.innerHTML = `${hasIcon(dataObject)} ${getProperty(actor, dataObject.path) || dataObject.fallback}`;
              }
            });
          }
        });
      }, 5000);
    }
  });

  libraryLog("Finished initializing custom info module");
}
