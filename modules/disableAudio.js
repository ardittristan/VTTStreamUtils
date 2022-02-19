import { libraryLog } from "../streamUtils.js";

export default function disableAudio() {
  libraryLog("Disabling AudioHelper");
  // disables audio since it doesn't work on /stream anyway
  AudioHelper.getAudioContext = function () {
    return null;
  };
  AudioHelper.play = function () {};
  AudioHelper.prototype._onFirstGesture = function () {};
  libraryLog("Finished disabling AudioHelper");
}
