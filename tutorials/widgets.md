# Widgets (Advanced)

Widgets can be used to create dynamic overlays.

Widgets Examples can be found [here](https://github.com/negue/meme-box/tree/develop/tutorials/examples/widgets)

## Pre-Defined Variables/Events

`window.widget.state` - [See the `Store`-Documentation](./store.md)

`window.widget.triggered(callback);` when the Widget is currently shown/triggered in a screen

`window.widget.isReady() -> Promise` to know if the needed widget (and its api is ready)

If the option `Receive Twitch Events` is activated, you get access to the following APIs:

- `window.addEventListener("message", (twitchEventData) => {})`
- `window.widget.twitch.on(TwitchEventTypes, callbackOfEvent)`

```ts
enum TwitchEventTypes {
  message = 'message',
  follow = 'follow',
  bits = 'bits',
  raid = 'raid',
  host = 'host',
  channelPoints = 'channelPoints',
  ban = 'ban',
  subscription = "subscription",
  gift = "gift"
}
```


## Variables

The variables that you can config in a widget, can be used in a template parts.

|Widget Part|Variable Syntax|
|------------|--|
|HTML| `{{VARIABLE_NAME}}` |
|CSS| `var(--VARIABLE_NAME)`  |
|JS| `VARIABLE_NAME` your variables will be registered as global ones  |

### More Functionality

If you want to react on an OBS event or some specific twitch event with more media to show (or `insert idea here`), 
then it would be easier to do this logic in [Scripts](./scripts.md)

```js
// Get your action by ActionID and ScreenId (use the button "Add action at cursor")
const myWidget = memebox.getMedia(
  'cab50f01-2cd5-4797-9c7b-40dc3217272d',
  '696f0c9a-bf99-42c2-becf-45e0efa87fbe'
);

// memebox.getAction for everything, that doesn't need `triggerWhile`

await myWidget.trigger({
  // all properties optional
  
  action: {      // see action Overrides in Scripts Docs
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
```


## External Files

You can add external files more simply with this UI instead of adding them byhand to the HTML-Part
