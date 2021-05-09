## to be released

### Features

* [x] Custom Port Setting inside Meme-Box (commandline option `--port` would still override it)
* [x] Started with the Translation Process - Open PRs if you want to help!
* [ ] Improved Widgets (previously named `HTML`)
  * [x] API for Twitch or Events that its shown and so on
  * [x] Templates
  * [x] Widget-Variables
  * [x] Import / Export Widgets
  * [ ] Persistence of the Widget State across Screens
* [x] Electron: You can now hide the windows to the Tray-Icon. :tada:
* [ ] "Media Type": `Scripts` with this more advanced features could be realized

### Fixes

* [x] Allow multiple reactions of twitch commands (example cheer and command by string)
* [x] The Media Overview sometimes showed more items while listing/filtering items
* [x] Changed the default port from `4444` to `6363`

### Changes

* [x] The Media Overview was redesigned by `@owehmer` (you can still switch to the old one)
* [x] "HTML" is now renamed to "Widgets"

## 2021.2.1

* [x] Each Media has a now cornered background to see boundaries
* [x] Advanced: Ability to change the css transform value
* [x] Arrange View: Resizes now also work easier when doing these functions from left/top
* [x] Arrange View: Ability to lock specific arrange / resize functions
* [x] Ability to switch to the "media config"-dialog from the "screen media config"-dialog 


## 2021.2.0

* [x] Drag&Drop Media in the `Assign / arrange media`-View
* [x] Select the media folder in Electron with a dialog
* [x] Open multiple target screens with one URL
* [x] QR-Code to scan a target screen url to open it easier on tablets
* [x] Support full animation list from https://animate.style/

## 2021.1.2

- FIX: Wrong Mediapaths with a different path separator than the system-one, 
  will be checked and prevented to be saved. #192
- FIX: Oversized Images / Preview are now scaled down. #193
- FIX: Fixed Media positions work again. #195
- FIX: If the first twitch connection cannot connect, then it'll be tried two times more
  
- CHANGE: Currently the Previews of iFrames has been changed to be only visible
  in the edit dialog #197

## 2021.1.1

- Fix: Toggled Clips didn't hide on trigger again

## 2021.1.0

- First Release
