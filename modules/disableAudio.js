export default async function disableAudio() {
  // disables audio since it doesn't work on /stream anyway
  AudioHelper.getAudioContext = function () {
    if (this._audioContext) return this._audioContext;
    return null;
  };
  AudioHelper.play = function () {
    return;
  };
}
