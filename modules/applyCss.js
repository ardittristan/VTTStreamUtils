export default async function applyCss() {
  $("head").append($(`<style>${game.settings.get("0streamutils", "cssEditor")}</style>`));
}
