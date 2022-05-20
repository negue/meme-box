# Scripts (Advanced)

Scripts can be used to create advanced type of triggers / chains of your media.

A script can have pre-defined variables (to be changed outside of the script).

If you need calculated variables that don't need to be changed on each call, you do / add them inside the `Bootstrap Script`. You need to return them like that: 

```js
return {myVar, andOtherVar, andSoOn};
```

The `Execution Script` which is called each time per trigger, does the actual "stuff".

> Note: Scripts are handled inside the Backend, so there is no availability of Browser-Functions like `alert` and other stuff. But mostly everything else in JS can be used.

Script Examples can be found [here](https://github.com/negue/meme-box/tree/develop/tutorials/examples/scripts)

## Pre-Defined Variables

|Script Types|Variable Name|Description|
|------------|--|--|
|*both*| `variables` | It holds all values of  your added `Custom Variables` |
|*both*| `store` | [See the `Store`-Documentation](./store.md) |
|*both*| `sleep` | Check [`Sleep API`](#sleep-api) below |
|*both*| `logger` | Check [`Logger API`](#logger-api) below |
|*both*| `obs` | Check [`OBS API`](#obs-api) below |
|*both*| `memebox` | Check [`MemeBox API`](#memebox-api) below |
|*both*| `utils` | Check [`Utils API`](#utils-api) below |
|*both*| `twitch` | Check [`Twitch API`](#twitch-api) below |
|*both*| `eventbus` | Check [`EventBus API`](#eventbus-api) below |
|*both*| `process` | Check [`Process API`](#process-api) below |
|*both*| `rxjs` | `rxjs.*` and `rxjs.operators` https://rxjs.dev/guide/operators |
|`Execution Script`| `bootstrap` | It holds all values of your `Bootstrap Script` |
|`Execution Script`| `triggerPayload` | Check [`Trigger payload`](#trigger-payload) below. It has the current information of the action trigger. |
|**only Permanent Scripts**| `wss` | Create your custom websocket server - Check [`WSS API`](#wss-api) below |

### Sleep API

If you need to wait for X seconds or ms you can use this:

```js
await sleep.secondsAsync(X)
await sleep.msAsync(Y);
await sleep.for(X, sleep.TYPE.MS);

// also you can use
sleep.TYPE.SECONDS
sleep.TYPE.MINUTES

```

### Logger API

```js
logger.log('Something', 1234)
logger.error('er')
```

### Obs API

```js
obs.connectIfNot(); // tries to connect if it currently isn't
obs.isConnected();

obs.getFilter('SourceName', 'FilterName')
  .updateEnabled(true / false)

obs.replaceBrowserSourceUrl('browserSourceName', 'newUrl')
obs.refreshBrowserSource('browserSourceName')

// in permanent scripts
obs.onEvent$('eventName') // to subscribe to changes
```

> `obs.raw` the commands/docs of OBS WebSocket (js) and Plugin 4.9 
> 
> OBS WebsocketJS https://github.com/obs-websocket-community-projects/obs-websocket-js/tree/v4
> 
> OBS Protocol: https://github.com/Palakis/obs-websocket/blob/4.x-current/docs/generated/protocol.md


### WSS API

> Note: This only works inside Permanent Scripts

```js
// creates a new websocket server running at port: 1337
const myWSS = wss.createWSS({
  port: 1337
});

logger.log('address: ', myWSS.address())

myWSS.on('connection', function connection(ws) {
  
  // the normal websocket client reference
  ws.on('message', function incoming(message) {
    logger.log('received: %s', message);

    ws.send('result: '+ message);
  });

  ws.send('something');
});


// can also use to connect to a websocket
const wsClient = ws.connect('address');  

wsClient.on / wsClient.send
```

### MemeBox API

```js
// Get your action by ActionID and ScreenId (use the button "Add action at cursor")
const myActionVar = memebox.getMedia(
  'cab50f01-2cd5-4797-9c7b-40dc3217272d',
  '696f0c9a-bf99-42c2-becf-45e0efa87fbe'
);

// memebox.getAction for everything, that doesn't need `triggerWhile`

// only for media: trigger it and have it visible all the time, 
// while this (callback) code is running 
// the await part is a promise and it will wait until this media is hidden again
await myActionVar.triggerWhile(async (helpers) => {
  await sleep.secondsAsync(1);

  // move your media to these positions, this is done in a transition (animation)
  await myActionVar.updateScreenOptions({
    position: enums.PositionEnum.Absolute,
    top: '10%',
    left: '15%'
  })

  await sleep.secondsAsync(2);

  await myActionVar.updateScreenOptions({
    position: enums.PositionEnum.Absolute,
    top: '40%',
    left: '35%'
  });
  
  await sleep.secondsAsync(2);

  // if none of these helpers are called, the last change of "updateScreenOptions" will be still applied
  helpers.resetAfterDone(250);
  // helpers.reset()    
  // ^ this resets the media while its still "visible", 
  // so it might break the previous animation flow
}, 
  // the options to trigger this media,
  // for example here with a custom variable value
  {
  action: {
    variables: {
      text_to_show: "This is the first message"
    }
  }
});

// these can be used for actions and media
// just a simple memebox action trigger (with variables example)
await myActionVar.trigger({
  // all properties optional
  
  action: {      // see action Overrides
    variables: {
      text_to_show: "This is the second message"
    }
  },

  screenMedia: {
    position: enums.PositionEnum.Centered,
    width: '300px',
    height: '200px'
  }
});

// simple trigger without anything
await myActionVar.trigger();

```

### `action` Overrides

```ts
interface ActionOverridableProperties {
  variables?: Dictionary<unknown>;     // the variables inside scripts / widgets
}
```

### `updateScreenOptions` or `screenMedia` overrides

```ts
interface ScreenMediaOverridableProperties {
  visibility: VisibilityEnum;
  loop?: boolean;

  // later some other settings like position and stuff
  width?: string; // 60%, 720px
  height?: string;

  // todo extract position to its own object
  position?: PositionEnum;
  left?: string;
  right?: string;
  bottom?: string;
  top?: string;
  transform?: string;
  imgFit?: string;

  /**
   * If you are in a script and currently animation all stuff in "triggerWhile" then you can
   * use this to prevent transition between those settings "updates"
   */
  animating?: boolean;

  animationIn?: string | null;
  animationOut?: string | null;

  animationInDuration?: number,
  animationOutDuration?: number,

  zIndex?: number;

  customCss?: string;
}


// in scripts usable by enums.PositionEnum
enum PositionEnum {
  FullScreen,
  Absolute,
  Centered,
  Random
}

enum VisibilityEnum {
  Play = 0,
  Static,
  Toggle
}
```

### Utils API

```js
utils.randomElement(array)  // returns a random element
```


### Twitch API

```js
twitch.getBroadcasterIdAsync() 

twitch.getHelixDataAsync('chat/emotes?broadcaster_id=123456')  // see Helix API Docs https://dev.twitch.tv/docs/api/reference#get-channel-emotes

twitch.say(messageToWriteInChat);
```


### EventBus API

This eventbus is to be used between scripts and widgets (not implemented yet). 
So that more advanced stuff can be done.

```js
const eventsToSubscribe = ['MYSCRIPT_EVENTX'];

eventBus

const {debounceTime, tap} = rxjs.operators;

// on$ returns an rxjs Observable, which you can use your operators on
// https://rxjs.dev/guide/operators 
eventBus.on$(eventsToSubscribe)
  .pipe(   // pipe is optional only if you want to use rxjs operators
  debounceTime(),
  tap()
)
  .subscribe((e) => {
  // e.type is your event as string
  // e.payload the data that was sent to it
})

eventBus.send('MYSCRIPT_EVENTX', {
  myObject: {   // everything inside this object is the `e.payload`
    data: true
  }  
})
```


### Process API

If you need to start a bunch of apps for example or only one on an action then you can use this

```js
process.spawn(`C:\\WINDOWS\\system32\\notepad.exe`);
```

### Trigger payload

The `triggerPayload` variable holds all the data about what/who triggered the script.
An example of the data returned when the script is triggered by a chat message command:

```json
{
  "id": "db4cc5f3-2e7e-400c-a2db-bcf20398a434",
  "uniqueId": "5f4f1a08-2320-4414-af78-fb694e4105fe",
  "targetScreen": "",
  "origin": 3,
  "originId": "a4d2776d-e27a-4cb8-b86b-273a070c09f1",
  "byTwitch": {
    "timestamp": "2022-05-20T22:54:17.885Z",
    "payload": {
      "channel": "#gacbl",
      "self": false,
      "message": "!cnt",
      "userstate": {
        "badge-info": { "subscriber": "19" },
        "badges": { "broadcaster": "1", "subscriber": "3012", "glhf-pledge": "1" },
        "client-nonce": "42820cad6af02ef7fb567eb1644d4f9a",
        "color": "#1E90FF",
        "display-name": "GacBL",
        "emotes": null,
        "first-msg": false,
        "flags": null,
        "id": "cd998b3b-0495-485b-9226-e66c49225cdf",
        "mod": false,
        "room-id": "120572949",
        "subscriber": true,
        "tmi-sent-ts": "1653087364485",
        "turbo": false,
        "user-id": "120572949",
        "user-type": null,
        "emotes-raw": null,
        "badge-info-raw": "subscriber/19",
        "badges-raw": "broadcaster/1,subscriber/3012,glhf-pledge/1",
        "username": "gacbl",
        "message-type": "chat"
      }
    },
    "type": "message"
  },
  "overrides": { 
    "action": { 
      "variables": { 
        "label": "Sample counter:"
      }
    }
  }
}
```

For mor information about what is stored in the `triggerPayload` variable you can always use the [`logger` API](#logger-api) to see all the data it holds.
