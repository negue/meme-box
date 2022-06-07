---
title: Test Widget to Import
settings:
  subscribeToTwitchEvent: true
type: 4
---

# variables

```json
[
  {
    "hint": "",
    "name": "headerColor",
    "fallback": "red",
    "type": "text"
  },
  {
    "hint": "",
    "name": "backgroundColor",
    "fallback": "gray",
    "type": "text"
  }
]
```

# css

```css
body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  background: var(--backgroundColor);
  color: white;
} 

.subDiv {
  background: var(--headerColor);
}
```

# html

```html
<div class="subDiv">
 Header Color {{headerColor}}
</div>

Background COlor {{backgroundColor}}

<div id="twitchEvent"></div>

```

# js

```js
console.info(headerColor);

const twitchEventDiv = document.getElementById("twitchEvent");

let counter = 0;
window.addEventListener("message", (event) => {
console.info('IFRAME: ', event);
counter++;
  const content = `${counter} ${event.origin} - ${event.data}`;
  
  twitchEventDiv.innerText = content;
}, false);
```
