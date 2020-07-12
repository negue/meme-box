# WebSocket / HTTP Spec / Function Overview / Stuff 

`ACTION=JSON`

## StreamDeck Plugin to (express) Meme-Box
- `TRIGGER_CLIP` trigger with ID
  
  ```ts
  {
     id: GUID,
     targetOBS: GUID // optional
     repeatX: number // optional
     repeatSeconds: number // optional
  }
  ```
  
  - optional on a target obs URL
  - optional "repeat for X times" (open issue)
  - optional repeat until X seconds have passed
  
- play while hold , stop on release

  `START_CLIP` -  `STOP CLIP`

  ```ts
  {
     id: GUID   
  }
  ```

  

- preview of the clip? background

  Rest: `/media/preview`


## Management View
> All changes calling the electron express server to save & trigger

## Express Electron
- Save the config / files
- accept websockets
- accept simple rest calls
- listen to twitch events and trigger clips

## OBS URL

- websocket to the express/electron

- listens to events

  `TRIGGER_CLIP`  - `START_CLIP`  -  `STOP CLIP`

- cache files ?

  load each clip once?

