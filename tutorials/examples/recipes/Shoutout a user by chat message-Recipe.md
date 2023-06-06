---
title: Shoutout a user by chat message
settings: {}
type: 101
---

This needs a Twitch Chat Message trigger and it uses the value after the command text

# recipe

```json
{
  "rootEntry": "3972a08d-7e44-4f51-8737-04dd3197d982",
  "entries": {
    "3972a08d-7e44-4f51-8737-04dd3197d982": {
      "id": "3972a08d-7e44-4f51-8737-04dd3197d982",
      "entryType": "group",
      "awaited": false,
      "subCommandBlocks": [
        {
          "labelId": "recipeRoot",
          "entries": [
            "d388295e-b644-431a-ba7b-d1cf5ab82778"
          ]
        }
      ]
    },
    "d388295e-b644-431a-ba7b-d1cf5ab82778": {
      "id": "d388295e-b644-431a-ba7b-d1cf5ab82778",
      "commandBlockType": "twitch:shoutout",
      "payload": {
        "username": "${{ $split(byTwitch.payload.message, \" \")[1] }}"
      },
      "awaited": true,
      "entryType": "command",
      "subCommandBlocks": []
    }
  }
}
```
