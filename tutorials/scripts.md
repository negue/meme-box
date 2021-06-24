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
|`Execution Script`| `bootstrap` | It holds all values of your `Bootstrap Script` |
|`Execution Script`| `triggerPayload` | It has the current information of the action trigger |

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

## Pre-Defined Functions

Functions are able to be called on *both* Script-Types

|Function Name|Description|
|--|--|
| `console.info` | To log stuff |
| `waitMillisecondsAsync(ms)` | waits for `ms` |
| `triggerMediaAsync(mediaId, screenId?)` | It will trigger this media and wait until its done |


### `TriggerPayload`

```json 
  {
     id: MediaId,
     targetScreen: ScreenId // optional
  }
```
