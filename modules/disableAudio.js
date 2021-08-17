import { libraryLog } from "../streamUtils.js";

export default function disableAudio() {
  libraryLog("Disabling AudioHelper");
  // disables audio since it doesn't work on /stream anyway
  AudioHelper.getAudioContext = function () {
    return null;
  };
  AudioHelper.play = function () {
    return;
  };
  AudioHelper.prototype._onFirstGesture = function () {
    return;
  };
  libraryLog("Finished disabling AudioHelper");
}
