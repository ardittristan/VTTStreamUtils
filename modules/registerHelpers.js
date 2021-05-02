import { hasIcon } from "../streamUtils.js";

export default async function registerHelpers() {
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
}
