# MemeBox

A complete management app for image / audio / video / iframe clips to be used inside OBS.

## Working Features

* [x] Add / Edit / Delete Clips
* [x] Custom CSS per Clip / Screen
* [x] Custom Position per Clip / Screen
* [x] Custom Visibility States: Play, Toggle and Static
* [x] Trigger clips by streamdeck-plugin
* [x] Trigger clips twitch messages
* [x] Simple WebSocket/Rest API to save/serve the data
* [x] clip can be hidden by `Play Time` or once a clip has ended
* [x] mobile-view can be opened by qr-code, and trigger clips from it
* [x] `Meta-Clip` to trigger random other clips

-----

## Tutorial

- Download executable from: https://github.com/negue/meme-box/releases
- Optional: [Download Streamdeck Plugin](https://github.com/negue/meme-box/raw/master/memebox-streamdeck/Release/com.memebox.memebox-streamdeck.streamDeckPlugin)
- Create (at least) one Screen
- Create your first "clip", fill out the name, type and `path to the file`
  - online URLS can be used
  - or files inside `<current path of executable>/assets/YOUR_FILE_NAME.ending` can be accessed by
    `http://localhost:4445/file/YOUR_FILE_NAME.ending`
    > or just select it inside the dialog
- On the `Screens` Page - click on `assign clips`
- Choose your clip there
- Copy the visible URLs of your Screen-Entry and use it in OBS or any browser
  > Hint: when using it on a browser, to play audio / video types, 
  > you need to click at least once in the View or enable it in the browser
    or enable in your browser to play media files without user events :)                                                    
  > not needed for OBS itself :tada:
- Go to `media` page, press `show preview` this will trigger the selected URL targets
- Or: use the mobile view
- If everything worked out, the clip should be visible on the target Screen

___

## Getting Started with development

1. Clone this repo
2. Run the following commands in the root to start both the server and web app.
http://localhost:4200 opens automatically.

```sh
npm install
npm run start:all

# if you want to work on the server, its easier to start client / server separately
# that way you only have to restart the server alone
npm run start:app
npm run start:server
```


### Folders
Client is in `src/app`
Server is in `main.ts` and `server/*`
Streamdeck-Plugin is in `memebox-streamdeck`

## Based on this Template:
https://github.com/maximegris/angular-electron
