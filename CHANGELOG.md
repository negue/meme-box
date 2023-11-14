## 2023.1.0

### Shoutout Users by Command Blocks
(insert screenshot here)
You can now shoutout a specific person by adding a Shoutout Command .. or

### Parse Trigger Payload as Command Block argument variables (maybe need to rephrase it)
With the help of a [very powerful json query library: JSONata](https://jsonata.org) it is now possible to parse trigger payloads (twitch message, raid, etc) and use those as variables for Arguments of Command Blocks.
(insert screenshot here)

## 2023.1.0

### Features

- New Recipe Command Block: Shoutout a twitch user
  Example: as Command Block

- Triggers now have inline Recipes (link to recipe example)
  Example: screenshot and stuff

- Recipe: Command Block -> Config Arguments can now use variables (from the Triggers)
  Example: parse the chat commands 2nd argument to shoutout

- New Recipe Command Block: Call an URL and reuse it in other commands (thanks to variables :tada:)

### Internal

Refactored the Twitch / Timer Triggers to be more generic for easier way to add more types of triggers.

## 2022.1.1

### New Command Block "Random Command Group"
This creates a Command Block, which can have multiple sub groups inside, and only one of them will be triggered in random.
![image](https://user-images.githubusercontent.com/842273/198378625-3c51362a-3aa7-45d8-8c1d-5ae6594c2976.png)

### More Twitch Command Blocks:
![image](https://user-images.githubusercontent.com/842273/199818943-d900b320-a21e-4ded-a6a7-4f535c752e54.png)

- Announce in Chat
![image](https://user-images.githubusercontent.com/842273/199819527-339c67a8-0dec-42e6-acba-7bc4e3b823b7.png)

- Clear Chat
- Create Marker
- Start Commercial
- Change Chat Settings (Slow Mode, Follower Only and so on)
  
![image](https://user-images.githubusercontent.com/842273/199821977-8a695bd4-43b9-4813-925e-cc8687ed1935.png)

### Misc
* Improve various logs
* Improvements/validate recipe config arguments
* Fixed Filter Search #534

**Full Changelog**: https://github.com/negue/meme-box/compare/2022.1...2022.1.1

## 🎉  2022.1

19 Months later, I present you the new Version

### Breaking Changes

* [x] The Headless Mode will not open the browser on start anymore, use `--open=true` for that
* [x] Changed the default port from `4444` to `6363`

### What's Changed / Features

*TLDR;* A-LOT-HAZ-CHANGED

* [x] The Action Overview was redesigned by @owehmer (you can still switch to the old one)
* [x] The Arrange View was redesigned by @owehmer
* [x] Improved `Widgets` (previously named `HTML`)
  * [x] API for Twitch or Events that its shown and so on
  * [x] Templates
  * [x] Widget-Variables
  * [x] Import / Export Widgets
  * [x] Persistence of the Widget State across Screens
* [x] `Media` is now renamed to `Actions` (unless those are visible on a Screen)
* [x] `Meta` is now replaced by `Recipe`
* [x] Overhaul of the Action Creation Dialog(s)
* [x] Custom Port Setting inside Meme-Box (commandline option `--port` would still override it)
* [x] Timers / Twitch Events can now select the Target Screen
* [x] Twitch Events can override Widget/Scripts Variables
* [x] More Twitch-Events able to be used as trigger 
* [x] Actions can be (preview) triggered with custom variable values
* [x] Media Actions can now have a volume gain (if its too quiet)
* [x] Streamdeck Plugin: Ability to change the global connection settings (different PC than localhost/port)
* [x] Action Settings: Added a hint why a screen time is needed or can stay empty
* [x] Twitch Auth: Improve custom scopes handling (if any were already configured, these will be always applied)
* [x] Manage View: Tell the Streamer with warnings / dialogs that the Token will expire in X Days
* [x] `Scripts` for more advanced features
![image](https://user-images.githubusercontent.com/842273/194373312-2edadc77-b6fb-4206-a9bc-d98ebeee6982.png)
  * [x] Wait once a triggered action (inside the script) is done to trigger other stuff
  * [x] Use custom variables like in the Widget-Variables for easier configs
* [x] `Permanent Scripts` to react on twitch or obs events which custom logic
* [x] `Recipe`, UI based "Scripting" / `Command Blocks` to create more dynamic .. "anything" 
![image](https://user-images.githubusercontent.com/842273/194373741-86705771-988d-4692-b829-95b7bab56d42.png)
  * [x] Custom logic or chain of actions that can be awaited
  * [x] Also supports Twitch/Obs Command Blocks
  * [x] Internally built upon the Script functionality
* [x] Electron: You can now hide the windows to the Tray-Icon. :tada:

### Quality of Life

* [x] When you authenticate it'll be automatically saved
* [x] Actions now have a description to see for example what a script does
* [x] Actions can be searched by keywords (including script sources)
* [x] Triggers can be searched now
* [x] Twitch Message Event can now have aliases
![image](https://user-images.githubusercontent.com/842273/194373027-5ffa0a1e-990d-40a1-b474-d380a63c5659.png)
* [x] Status Dashboard
![image](https://user-images.githubusercontent.com/842273/194372462-eadd6f7d-6767-4c34-a4d3-7ea5ed4faf92.png)
  * [x] of connections / states
  * [x] latest twitch events to retrigger
* [x] Show Errors in the Dashboard 
  * [x] incl. a way to create a GitHub Issue from that
* [x] Notes Panel that is visbile across all pages
![image](https://user-images.githubusercontent.com/842273/194374793-ceb28157-d660-4f19-90cf-ecddb873f9d6.png)

### Fixes

* [x] Changing any Settings - refreshed all media (including widgets) to be reloaded / recreated - #284
* [x] Allow multiple reactions of twitch commands (example cheer and command by string)
* [x] The Media Overview sometimes showed more items while listing/filtering items
* [x] Arrange View: Prevent switching between tabs when editing media - #266
* [x] Arrange View: Selected media still visible after assign media was clicked - #276
* [x] Arrange View: Changing a media from position full screen to fixed - didn't added a size border- #253
* [x] Arrange View: Moving Items out of screen-area - #250
* [x] Action Creation: The Image Preview wasn't resizing on change - #238
* [x] Action Creation: Visible screen time - minus values were possible - #239

### Misc

* [x] Most pages / dialogs now have a bug report / feedback Button
![image](https://user-images.githubusercontent.com/842273/194374597-106369b5-3d0b-4b7a-a9d6-a6aa7674cafd.png)

If you find any issues use the bug report / feedback buttons OR respond to this Discussion.

## New Contributors
* @owehmer made their first contribution in https://github.com/negue/meme-box/pull/244
* @divshacker made their first contribution in https://github.com/negue/meme-box/pull/339
* @brandonroberts made their first contribution in https://github.com/negue/meme-box/pull/348
* @chiragmahawar7 made their first contribution in https://github.com/negue/meme-box/pull/350
* @khalatevarun made their first contribution in https://github.com/negue/meme-box/pull/520
* @dnaka91 made their first contribution in https://github.com/negue/meme-box/pull/509

**Full Changelog**: https://github.com/negue/meme-box/compare/2021.2.1...2022.1


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
