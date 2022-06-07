---
title: Random Drop Emote
settings: {}
type: 5
---



# bootstrapScript

```js
// get broadcaster ID
const broadcasterId = await twitch.getBroadcasterIdAsync();

// get current emotes
const allEmotes = await twitch.getHelixDataAsync(`chat/emotes?broadcaster_id=${broadcasterId}`);


return {allEmotes};
```

# executionScript

```js
const randomEmote = utils.randomElement(bootstrap.allEmotes.data).name;

// trigger em
twitch.say(`!drop ${randomEmote}`)
```