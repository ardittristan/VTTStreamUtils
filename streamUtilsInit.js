if (window.location.pathname.includes("/stream")) {
  // disable user disabled modules
  disableModules();
  fix07();
}

/*******************************************************/
//@section disable modules
/*******************************************************/

//#region
async function disableModules() {
  // gets filter settings from local storage since game settings load too late
  const filter = localStorage.getItem("streamutilsDisabledModules").split(",");
  // filter always has at least a lenght of 1 with "" in it because of default settings, so checking if first entry in array has content
  if (filter?.[0]?.length === 0 || filter?.[0]?.length === undefined) return;
  // hack to disable scripts that load after this script
  new MutationObserver((mutations) => {
    mutations.forEach(({ addedNodes }) => {
      addedNodes.forEach((node) => {
        if (node.nodeType === 1 && node.tagName === "SCRIPT") {
          const src = node.src || "";
          // filter gets checked here
          if (stringIncludesArray(src, filter)) {
            node.type = "javascript/blocked";

            //Firefox compat
            const beforeScriptExecuteListener = function (event) {
              if (node.getAttribute("type") === "javascript/blocked") event.preventDefault();
              node.removeEventListener("beforescriptexecute", beforeScriptExecuteListener);
            };
            node.addEventListener("beforescriptexecute", beforeScriptExecuteListener);
          }
        }
      });
    });
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

/**
 * @description checks if string includes any string in the array
 *
 * @param {String} string
 * @param {String[]} array
 */
function stringIncludesArray(string, array) {
  let included = false;
  array.forEach((entry) => {
    if (string.includes(entry)) included = true;
  });
  return included;
}
//#endregion

function fix07() {
  Token.prototype._cleanData = function () {
    // Constrain dimensions
    this.data.width = Math.max((this.data.width || 1).toNearest(0.5), 0.5);
    this.data.height = Math.max((this.data.height || 1).toNearest(0.5), 0.5);

    // Constrain canvas coordinates
    if (!canvas?.ready || !this.scene?.active) return;
    const d = canvas.dimensions;
    this.data.x = Math.clamped(Math.round(this.data.x), 0, d.width - this.w);
    this.data.y = Math.clamped(Math.round(this.data.y), 0, d.height - this.h);
  };
}
