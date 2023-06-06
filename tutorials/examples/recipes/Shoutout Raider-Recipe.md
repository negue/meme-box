---
title: Shoutout Raider
settings: {}
type: 101
---

Once this is selected as action for a Raid Trigger, it handles the shoutouts automagically.

# recipe

```json
{
  "rootEntry": "1524497c-347e-4a86-866d-83f7bb546b72",
  "entries": {
    "1524497c-347e-4a86-866d-83f7bb546b72": {
      "id": "1524497c-347e-4a86-866d-83f7bb546b72",
      "entryType": "group",
      "awaited": false,
      "subCommandBlocks": [
        {
          "labelId": "recipeRoot",
          "entries": [
            "5ad7a8c8-4308-4bd4-b53e-edfc4ce45cfa"
          ]
        }
      ]
    },
    "5ad7a8c8-4308-4bd4-b53e-edfc4ce45cfa": {
      "id": "5ad7a8c8-4308-4bd4-b53e-edfc4ce45cfa",
      "commandBlockType": "twitch:shoutout",
      "payload": {
        "username": "${{byTwitch.payload.channel}}"
      },
      "awaited": true,
      "entryType": "command",
      "subCommandBlocks": []
    }
  }
}
```
