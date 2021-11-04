![GitHub All Releases](https://img.shields.io/github/downloads/ardittristan/VTTStreamUtils/total)
[![Donate](https://img.shields.io/badge/Donate-PayPal-Green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=TF3LJHWV9U7HN)

# VTT StreamUtils

This module adds extra and custom overlays to the /stream page of Foundry VTT and also allows you to disable modules on the /stream page.

## Installation

To install, import this [Manifest](https://raw.githubusercontent.com/ardittristan/VTTStreamUtils/master/module.json) into your module browser.

## Usage

### HP Overlay

1. Select the actors you want to show up in the module settings.
2. Set the path to the hp value and max hp value in the module settings.
3. Now it should show the hp for the selected actors on /stream.

![image](docs/image/README/1603115640067.png)

### Combat Tracker Overlay

* This one doesn't require any setup.

![image](docs/image/README/1603213345851.png)

### Last Roll Overlay

* This one doesn't require any setup.

![image](docs/image/README/1636067415748.png)

### Custom Overlay

It is possible to create custom overlays, while this does require some knowledge of JSON, more info about this in these [examples](https://github.com/ardittristan/VTTStreamUtils/blob/master/docs/example.md).

![image](docs/image/README/1603115818669.png)

### Modules causing issues

Sometimes modules don't play well with the /stream view, you can disable them by adding their identifier name to the disable setting. This setting only disables them on the /stream page

<details>

<summary>How to find the module identifier</summary>

To get the id of a module, press `F12` and open the console tab. Then in the console tab, type `game.modules`, a map object should appear:  
![image](docs/image/README/1603390217728.png)  
If you click on the arrow it should expand to a list:  
![image](docs/image/README/1603390254165.png)  
The names in this list are the module identifiers, if you have no idea what module corresponds to a module idea, you can open it and find the name in it's data:  
![image](docs/image/README/1603390352409new.png)

</details>

## Changelog

Check the [Changelog](https://github.com/ardittristan/VTTStreamUtils/blob/master/CHANGELOG.md)

## Feature Requests

If there's an overlay you want that can't simply be done with the custom overlay, feel free to create a feature request!
