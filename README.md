<p align="center"><img src="./assets/memebox-optimized.svg" width="128" height="128"></p>

<p align="center">

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
</p>

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

## Commandline Options

|Config|Default|Explanation|
|--|--|--|
|`--port=`|`4444`|The Server Port|
|`--config=`||`Your user appdata folder/meme-box`|


## Building the binaries

### Headless

```
# Builds angular app, server and "prepares it" 
npm run build:prepare

npm run build:all // or build:windows 
```

### Electron

```
npm run electron:build
```

### Folders
Client is in `src/app` 

Server is in `main.ts` and `server/*`

Streamdeck-Plugin is in `memebox-streamdeck`

## Based on this Template:
https://github.com/maximegris/angular-electron

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://www.twitch.tv/littleheroesspark"><img src="https://avatars0.githubusercontent.com/u/1301564?v=4" width="100px;" alt=""/><br /><sub><b>Aaron Rackley</b></sub></a><br /><a href="https://github.com/negue/meme-box/commits?author=ageddesi" title="Code">💻</a></td>
    <td align="center"><a href="http://twitch.tv/whitep4nth3r"><img src="https://avatars0.githubusercontent.com/u/52798353?v=4" width="100px;" alt=""/><br /><sub><b>Salma @whitep4nth3r</b></sub></a><br /><a href="https://github.com/negue/meme-box/commits?author=whitep4nth3r" title="Code">💻</a> <a href="#ideas-whitep4nth3r" title="Ideas, Planning, & Feedback">🤔</a> <a href="#design-whitep4nth3r" title="Design">🎨</a></td>
    <td align="center"><a href="https://twitch.tv/gacbl"><img src="https://avatars0.githubusercontent.com/u/2153382?v=4" width="100px;" alt=""/><br /><sub><b>Igor Ilic</b></sub></a><br /><a href="https://github.com/negue/meme-box/issues?q=author%3Agigili" title="Bug reports">🐛</a> <a href="#ideas-gigili" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/CrypticEngima"><img src="https://avatars0.githubusercontent.com/u/30286773?v=4" width="100px;" alt=""/><br /><sub><b>CrypticEngima</b></sub></a><br /><a href="#design-CrypticEngima" title="Design">🎨</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
