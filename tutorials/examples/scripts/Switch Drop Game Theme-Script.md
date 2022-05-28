---
title: Switch Drop Game Theme
settings: {}
type: 5
---



# variables

```json
[
  {
    "hint": "Each theme is a new line (no need to for the .html part)",
    "name": "themeList",
    "fallback": "winter\neaster",
    "type": "textarea"
  },
  {
    "hint": "All important argument you need to apply to the dropgame",
    "name": "queryArguments",
    "fallback": "channel=&overlay=true&clouds=true&hideTilDrop=true&volume=25&cooldown=90000&commandOn=true&oauth=&droplets=true",
    "type": "text"
  },
  {
    "hint": "Name inside OBS where the Dropgame is currently added",
    "name": "obsBrowserSource",
    "fallback": "",
    "type": "text"
  },
  {
    "hint": "The Name of the Twitch-Trigger to get find the right theme",
    "name": "chatCommandText",
    "fallback": "",
    "type": "text"
  }
]
```

# bootstrapScript

```js
const themesAsArray = variables.themeList.split('\n');

logger.log({
  themesAsArray
});

function randomDropTheme () {
  return utils.randomElement(themesAsArray);
}

const urlBase = 'https://www.pixelplush.dev/parachute/';

function isValidTheme (themeToSwitch) {
  return themesAsArray.includes(themeToSwitch) || themeToSwitch === 'random';
}

async function switchToTheme(themeToSwitch) {
  if (themeToSwitch === 'random') {
    themeToSwitch = randomDropTheme();
  }
  
  const urlToSwitchTo = `${urlBase}${themeToSwitch}.html?${variables.queryArguments}`;

  // update the obs url of a browsersource todo

  logger.log('Switching to URL', urlToSwitchTo);

  await obs.replaceBrowserSourceUrl(variables.obsBrowserSource,  urlToSwitchTo);
}


return { randomDropTheme, switchToTheme, isValidTheme };

```

# executionScript

```js
logger.log('Received trigger', triggerPayload, triggerPayload.overrides);

let themeToSwitch = 'random';

const twitchCommandText = (triggerPayload.byTwitch?.message ?? '');

if (twitchCommandText) {
  const textAfterTheCommand = twitchCommandText.replace(variables.chatCommandText.trim(), '').trim();

  if (textAfterTheCommand) {
    themeToSwitch = textAfterTheCommand;
  }
}

logger.log('Chose Theme to Switch', themeToSwitch);

if (!bootstrap.isValidTheme(themeToSwitch)) {
  return;
}

bootstrap.switchToTheme(themeToSwitch);

```