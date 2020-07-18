# MemeBox

A WIP project for a management app for picture / audio / video-clips 
to be used inside OBS.

## Working Features

- :white_check_mark: Add / Edit / Delete Clips
- :white_check_mark: Trigger clips those on specific obs urls
- :white_check_mark: Simple WebSocket/Rest API to save/serve the data

## Tutorial
- Create (at least) one OBS-URls
- Create your first "clip", fill out the name, type and `path to the file`
- on the `OBS URLs` Page - click on `assign clips`
- choose your clip there
- to be sure (because still WIP) - refresh the page
- copy the visible URLs of your OBS-Entry and use it in OBS or any browser
  > Hint: when using it on a browser, to play audio / video types, you need to 
    click atleast once in the View, not needed for OBS itself
- go to `media` page, press `show preview` this will trigger the selected URL targets

## TODO

- Static parts (clip and different stuff) on each URL
- Configure the position of each clip per OBS-Urls
- Configure Twitch Events to get triggered on Obs URLS
- Additional Types to trigger, like Iframe or something else
- Streamdeck Plugin
- Mobile View to trigger from phone / tablet
- See Issues tagged with [enhancement](https://github.com/negue/meme-box/labels/enhancement) 


# Introduction

- Add example media clips
- create any obs url (no selection to choose which OBS can be targeted)
- copy the generated URL out of the view
- **IMPORTANT** if you test in a normal browser, 
  due to the restrictions of the browser audio/video cant 
  be played until the user clicked inside the page
  nothing to worry about in OBS itself :tada:
- trigger a clip from the media overview (for now)


## Getting Started with development

- clone this repo
- `npm install`
- `npm run ng:serve:web` to start serve the App
- `npm run electron:serve` it'll start the server & electron shell

### Folders
Client is in `src/app`

Server is in `main.ts` and `server/*`

## Based on this Template:
https://github.com/maximegris/angular-electron
