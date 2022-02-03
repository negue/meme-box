## 2022.1 to be released

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
* [x] "Action Type": `Scripts` for more advanced features
  * [x] Wait once a triggered action (inside the script) is done to trigger other stuff
  * [x] Use custom variables like in the Widget-Variables for easier configs
* [x] "Action Type": `Permanent Scripts` to react on twitch or obs events which custom logic
* [x] Timers / Twitch Events can now select the Target Screen
* [x] Twitch Events can override Widget/Scripts Variables
* [x] Add new twitch events to the trigger section
  * [x] All the sub events were added
  * [x] Ban event
* [x] Actions now have a description to see for example what a script does
* [x] Actions can be searched by keywords (including script sources)
* [x] Actions can be (preview) triggered with custom variable values
* [x] Status Dashboard
  * [x] of connections / states
  * [x] latest twitch events to retrigger
* [x] Triggers can be searched now
* [x] Twitch Message Event can now have aliases
* [x] Media Actions can now have a volume gain (if its too quiet)
* [x] Streamdeck Plugin: Ability to change the global connection settings (different PC than localhost/port)

### Fixes

* [x] Changing any Settings - refreshed all media (including widgets) to be reloaded / recreated - #284
* [x] Allow multiple reactions of twitch commands (example cheer and command by string)
* [x] The Media Overview sometimes showed more items while listing/filtering items
* [x] Arrange View: Prevent switching between tabs when editing media - #266
* [x] Arrange View: Selected media still visible after assign media was clicked - #276
* [x] Arrange View: Changing a media from position full screen to fixed - didn't added a size border- #253
* [x] Arrange View: Moving Items out of screen-area - #250
* [x] Media Creation: The Image Preview wasn't resizing on change - #238
* [x] Media Creation: Visible screen time - minus values were possible - #239

### Changes

* [x] The Media Overview was redesigned by `@owehmer` (you can still switch to the old one)
* [x] The Arrange View was redesigned by `@owehmer`
* [x] "HTML" is now renamed to "Widgets"
* [x] "Media" is now renamed to "Actions"
* [ ] Overhaul of the Media Creation Dialog(s)


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
