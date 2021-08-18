import { libraryLog } from "../streamUtils.js";

export default async function applyCss() {
  libraryLog("Applying css");
  $("head").append($(`<style id="greenScreenColor">body.stream { background: ${game.settings.get("0streamutils", "greenScreenColor")} !important; }</style>`));
  $("head").append($(`<style>${game.settings.get("0streamutils", "cssEditor")}</style>`));
  libraryLog("Finished applying css");
}
