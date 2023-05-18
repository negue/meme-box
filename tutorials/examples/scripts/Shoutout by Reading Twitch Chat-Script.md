---
title: Shoutout by Reading Twitch Chat
settings: {}
type: 5
---

You need to create chat listener using your trigger, for example "!so" and select this imported Script.

# executionScript

```js
// split the commadn text by space
// !command theUser

const triggerMessage = triggerPayload.byTwitch.payload.message.split(' ');

await twitch.shoutout(triggerMessage[1]);
```
