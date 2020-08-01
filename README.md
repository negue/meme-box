# MemeBox

A WIP project for a management app for picture / audio / video-clips 
to be used inside OBS.

## Working Features

- :white_check_mark: Add / Edit / Delete Clips
- :white_check_mark: Trigger clips by mobile-view or media-page on specific screens
- :white_check_mark: Trigger clips by streamdeck-plugin
- :white_check_mark: Simple WebSocket/Rest API to save/serve the data
- :white_check_mark: specific position per clip/screen
- :white_check_mark: clip can be hidden by `Play Time` or once a clip has ended
- :white_check_mark: mobile-view can be opened by qr-code


## Tutorial
- Download executable from: https://github.com/negue/meme-box/releases
- Optional: [Download Streamdeck Plugin](https://github.com/negue/meme-box/raw/master/memebox-streamdeck/Release/com.memebox.memebox-streamdeck.streamDeckPlugin)
- Create (at least) one Screen
- Create your first "clip", fill out the name, type and `path to the file`
  - online URLS can be used
  - or files inside `<current path of executable>/assets/YOUR_FILE_NAME.ending` can be accessed by
    `http://localhost:4445/file/YOUR_FILE_NAME.ending`
- on the `Screens` Page - click on `assign clips`
- choose your clip there
- copy the visible URLs of your Screen-Entry and use it in OBS or any browser
  > Hint: when using it on a browser, to play audio / video types, 
  > you need to click atleast once in the View or enable it in the browser
    or enable in your browser to play media files without user events :)
                                                                             
  > not needed for OBS itself :tada:
- go to `media` page, press `show preview` this will trigger the selected URL targets
- or: use the mobile view
- if everything worked out, the clip should be visible on the target Screen

## TODO

- Static parts (clip and different stuff) on each Screen
- Configure Twitch Events to get triggered on Screens
- Additional Types to trigger, like Iframe or something else
- See Issues tagged with [enhancement](https://github.com/negue/meme-box/labels/enhancement) 


## Getting Started with development

- clone this repo
- `npm install`
- `npm run start:all` starts the server & web app & opens the URL

### Folders
Client is in `src/app`
Server is in `main.ts` and `server/*`
Streamdeck-Plugin is in `memebox-streamdeck`

## Based on this Template:
https://github.com/maximegris/angular-electron
