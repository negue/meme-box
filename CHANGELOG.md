## to be released

### Breaking Changes

* [x] The Headless Mode will not open the browser on start anymore, use `--open=true` for that
* [x] Changed the default port from `4444` to `6363`

### Features

* [x] Custom Port Setting inside Meme-Box (commandline option `--port` would still override it)
* [x] Started with the Translation Process - Open PRs if you want to help!
* [x] Improved Widgets (previously named `HTML`)
  * [x] API for Twitch or Events that its shown and so on
  * [x] Templates
  * [x] Widget-Variables
  * [x] Import / Export Widgets
  * [x] Persistence of the Widget State across Screens
* [x] Electron: You can now hide the windows to the Tray-Icon. :tada:
* [x] "Media Type": `Scripts` for more advanced features
  * [ ] Wait once a triggered clip (inside the script) is done to trigger other stuff
  * [ ] Use custom variables like in the Widget-Variables for easier configs

### Fixes

* [x] Allow multiple reactions of twitch commands (example cheer and command by string)
* [x] The Media Overview sometimes showed more items while listing/filtering items
* [x] Arrange View: Prevent switching between tabs when editing media - #266
* [x] Arrange View: Selected media still visible after assign media was clicked - #276
* [x] Media Creation: The Image Preview wasn't resizing on change - #238

### Changes

* [x] The Media Overview was redesigned by `@owehmer` (you can still switch to the old one)
* [x] The Arrange View was redesigned by `@owehmer`
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
