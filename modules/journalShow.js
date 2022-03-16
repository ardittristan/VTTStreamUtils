import { libraryLog } from "../streamUtils.js";

export default async function journalShow() {
  if (!game.settings.get("0streamutils", "enableJournalShow")) return;

  libraryLog("Setting up journal show");

  ui.journal = new JournalStreamDirectory();
  ui.controls = ui.controls || {};
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

  Object.defineProperty(ImagePopout.prototype, "popOut", {
    get() {
      false;
    },
  });

  ImagePopout.prototype._replaceHTML = function (element, html) {
    $("#journalShow").html(html);
    this._element = html;
  };

  ImagePopout.prototype._injectHTML = function (html) {
    this._replaceHTML(undefined, html);
  };

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
  const JournalEntrySheet = (await import(monksJournalSource.replace("monks-enhanced-journal.js", "sheets/JournalEntrySheet.js"))).JournalEntrySheet;
  const JournalEntrySheetTextOnly = (await import(monksJournalSource.replace("monks-enhanced-journal.js", "sheets/JournalEntrySheet.js"))).JournalEntrySheetTextOnly;

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

    sheet.addClass("monks-journal-sheet sheet");

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

  Object.defineProperty(EnhancedJournalSheet.prototype, "isEditable", {
    get() {
      return false;
    },
  });

  MonksEnhancedJournal.registerSheetClasses = function () {
    let types = MonksEnhancedJournal.getDocumentTypes();
    let labels = MonksEnhancedJournal.getTypeLabels();

    for (let [k, v] of Object.entries(labels)) {
      if (CONFIG.JournalEntry.sheetClasses[k] == undefined) CONFIG.JournalEntry.sheetClasses[k] = {};
      CONFIG.JournalEntry.sheetClasses[k][v] = {
        cls: types[k] || JournalEntrySheet,
        default: true,
        id: v,
        label: game.i18n.localize(v),
      };
    }

    CONFIG.JournalEntry.sheetClasses["base"]["monks-enhanced-journal.JournalEntrySheetTextOnly"] = {
      cls: JournalEntrySheetTextOnly,
      default: false,
      id: "monks-enhanced-journal.JournalEntrySheetTextOnly",
      label: game.i18n.localize("MonksEnhancedJournal.journalentrytextonly"),
    };

    game.system.documentTypes.JournalEntry = game.system.documentTypes.JournalEntry.concat(Object.keys(types)).sort();
    CONFIG.JournalEntry.typeLabels = mergeObject(CONFIG.JournalEntry.typeLabels || {}, labels);
  };

  MonksEnhancedJournal.showEntry = async function (data) {
    if (data.users == undefined || data.users.includes(game.user.id)) {
      Journal._showEntry(data.uuid, null, true);
    }
  };

  const origGetData = EnhancedJournalSheet.prototype.getData;
  EnhancedJournalSheet.prototype.getData = function () {
    let data = origGetData.call(this);
    data.owner = false;
    return data;
  };

  MonksEnhancedJournal.ready();
}

class JournalStreamDirectory extends CONFIG.ui.journal {
  get popOut() {
    return true;
  }
}
