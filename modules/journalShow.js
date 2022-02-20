import { libraryLog } from "../streamUtils.js";

export default async function journalShow() {
  if (!game.settings.get("0streamutils", "enableJournalShow")) return;

  libraryLog("Setting up journal show");

  ui.journal = new JournalStreamDirectory();
  game.permissions = {};

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

  await journalShowMonksJournal();

  libraryLog("Finished setting up journal show");
}

async function journalShowMonksJournal() {
  if (!game.settings.get("0streamutils", "enableJournalShowMonksJournal") || !game.MonksEnhancedJournal) return;

  /** @type {string} */
  const monksJournalSource = document.querySelector('script[src*="modules/monks-enhanced-journal"][src*="monks-enhanced-journal.js"][type="module"]')?.src;

  const MonksEnhancedJournal = game.MonksEnhancedJournal;
  const EnhancedJournal = (await import(monksJournalSource.replace("monks-enhanced-journal.js", "apps/enhanced-journal.js"))).EnhancedJournal;
  const EnhancedJournalSheet = (await import(monksJournalSource.replace("monks-enhanced-journal.js", "sheets/EnhancedJournalSheet.js"))).EnhancedJournalSheet;

  EnhancedJournal.prototype._render = async function _render(force, options = {}) {
    let result = await Application.prototype._render.call(this, force, options);

    if (this.element) {
      this.renderDirectory().then((html) => {
        MonksEnhancedJournal.updateDirectory(html);
      });

      await this.renderSubSheet();
    }

    /** @type {JQuery} */
    let wrapper = this.element;
    /** @type {JQuery} */
    let sheet = this.subsheet.element;

    $("#journalShow").html(sheet);
    wrapper.remove();

    return result;
  };

  JournalSheet.prototype._getHeaderButtons = null;

  EnhancedJournalSheet.prototype._getHeaderButtons = null;

  Object.defineProperty(EnhancedJournal.prototype, "_dragDrop", {
    get() {
      return [];
    },
    set() {},
  });

  Object.defineProperty(EnhancedJournal.prototype, "popOut", {
    get() {
      return false;
    },
  });

  Object.defineProperty(EnhancedJournalSheet.prototype, "options", {
    get() {
      this._options.dragDrop = [];
      return this._options;
    },
    set(options) {
      this._options = options;
    },
  });

  Object.defineProperty(JournalSheet.prototype, "isEditable", {
    get() {
      return false;
    },
  });

  Object.defineProperty(EnhancedJournal.prototype, "isEditable", {
    get() {
      return false;
    },
  });

  MonksEnhancedJournal.ready();
}

class JournalStreamDirectory extends CONFIG.ui.journal {
  get popOut() {
    return true;
  }
}
