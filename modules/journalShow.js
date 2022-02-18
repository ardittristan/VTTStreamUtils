import { libraryLog } from "../streamUtils.js";

export default async function journalShow() {
  if (!game.settings.get("0streamutils", "enableJournalShow")) return;

  libraryLog("Setting up journal show");

  let w = game.settings.get("0streamutils", "journalShowWidth");
  let h = game.settings.get("0streamutils", "journalShowHeight");

  await getTemplate("modules/0streamutils/templates/compactJournalSheet.html");
  $(".streamUtils").append(
    $(
      `<section id="journalShow" style="width: ${w}px; max-width: ${w}px; min-width: ${w}px; height: ${h}px; max-height: ${h}px; min-height: ${h}px; background: url('${
        game.settings.get("0streamutils", "journalBackground") //
      }') repeat"></section>`
    )
  );

  class CompactJournalSheet extends JournalSheet {
    get isEditable() {
      return false;
    }

    get popOut() {
      return false;
    }

    get template() {
      if (this._sheetMode === "image") return ImagePopout.defaultOptions.template;
      return "modules/0streamutils/templates/compactJournalSheet.html";
    }

    _replaceHTML(element, html) {
      $("#journalShow").html(html);
      this._element = html;
    }

    _injectHTML(html) {
      this._replaceHTML(undefined, html);
    }

    get id() {
      return `streamutils-journal-${this.object.id}`;
    }
  }

  Object.defineProperty(JournalEntry.prototype, "sheet", {
    get() {
      if (!this._sheet) {
        this._sheet = new CompactJournalSheet(this);
      }
      return this._sheet;
    },
  });

  Journal._activateSocketListeners(game.socket);

  libraryLog("Finished setting up journal show");
}
