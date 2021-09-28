# Scripts (Advanced)

Scripts can be used to create advanced type of triggers / chains of your media.

A script can have pre-defined variables (to be changed outside of the script).

If you need calculated variables that don't need to be changed on each call, you do / add them inside the `Bootstrap Script`. You need to return them like that: 

```js
return {myVar, andOtherVar, andSoOn};
```

The `Execution Script` which is called each time per trigger, does the actual "stuff".

> Note: Scripts are handled inside the Backend, so there is no availability of Browser-Functions like `alert` and other stuff. But mostly everything else in JS can be used.

## Pre-Defined Variables

|Script Types|Variable Name|Description|
|------------|--|--|
|*both*| `variables` | It holds all values of  your added `Custom Variables` |
|*both*| `store` | [See the `Store`-Documentation](./store.md) |
|*both*| `sleep` | Check `Sleep API` below |
|*both*| `logger` | Check `Logger API` below |
|*both*| `obs` | Check `OBS API` below |
|*both*| `memebox` | Check `MemeBox API` below |
|*both*| `utils` | Check `Utils API` below |
|`Execution Script`| `bootstrap` | It holds all values of your `Bootstrap Script` |
|`Execution Script`| `triggerPayload` | It has the current information of the action trigger |
|**only Permanent Scripts**| `wss` | Create your custom websocket server - Check `WSS API` below |

### Sleep API

If you need to wait for X seconds or ms you can use this:

```js
await sleep.secondAsync(X)
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
> OBS WebsocketJS https://github.com/obs-websocket-community-projects/obs-websocket-js/tree/v4
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
    position: 1,  // Absolute
    top: '10%',
    left: '15%'
  })

  await sleep.secondsAsync(2);

  await myActionVar.updateScreenOptions({
    position: 1,  // Absolute 
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
  action: {
    variables: {
      text_to_show: "This is the second message"
    }
  }
});

// simple trigger without anything
await myActionVar.trigger();
```


### Utils API

```js
utils.randomElement(array)  // returns a random element
```
