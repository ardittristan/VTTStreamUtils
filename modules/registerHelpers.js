import { hasIcon, libraryLog } from "../streamUtils.js";

export default async function registerHelpers() {
  libraryLog("Registering Handlebars helpers");

  Handlebars.registerHelper("getProperty", function (data, property) {
    return getProperty(data, property);
  });
  Handlebars.registerHelper("equals", function (a, b) {
    return a === b;
  });
  // for custom overlay
  Handlebars.registerHelper("hasIcon", function (dataObject) {
    return hasIcon(dataObject);
  });

  libraryLog("Finished registering Handlebars helpers");
}
