import { libraryLog } from "../streamUtils.js";

export default async function webrtc() {
  if (!game.settings.get("0streamutils", "enableWebrtc")) return;

  libraryLog("Initializing WebRTC");

  ui.webrtc = new CameraViews();
  game.initializeRTC();
  ui.webrtc.render(true);

  $(".streamUtils").append($('<section id="webrtc"></section>'));
  $("#webrtc").append($("#camera-views"));

  libraryLog("Finished initializing WebRTC");
}
