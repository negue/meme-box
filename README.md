# Meme-Box

<p align="center">
  
<img src="./assets/memebox-optimized.svg" width="128" height="128">

</p>

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-6-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

## [Download latest release!](https://github.com/negue/meme-box/releases)

[Nightly Builds](https://github.com/negue/meme-box-nightly/releases)

A complete management app for [`image / audio / video / iframe / widgets`](/tutorials/type_overview.md) "medias" to be used inside OBS.

|**Media Setup Example + Mobile View**|**Setup a Twitch-Trigger**|
|--|--|
|![memebox example setup gif](./assets/memebox_example_mobile_view.gif)|![memebox example twitch trigger gif](./assets/memebox_example_twitch.gif)|

## Working Features

* [x] [Custom CSS per Media / Screen][URL_ADVANCED_SETTINGS]
* [x] [Custom Position per Media / Screen][URL_ADVANCED_SETTINGS]
* [x] [Custom Visibility States: Play, Toggle and Static][URL_ADVANCED_SETTINGS]
* [x] Trigger Media by twitch messages / bits / raids
* [x] Trigger Media by timers
* [x] Trigger Media by mobile view (to use your phone / tablet)
* [x] Trigger Media by [`streamdeck-plugin`](./memebox-streamdeck/Release/com.memebox.memebox-streamdeck.streamDeckPlugin)
* [x] [`Trigger multiple / random Media`][URL_META_CLIPS]
* [x] Create / use dynamic Widgets that can react on Twitch Events

-----

## Getting Started

> Note: These are the current `Getting Started` / Tutorials for this branch.
> 
> To see the updated `Getting Started` / Tutorials from the released version - [click here!](https://github.com/negue/meme-box/tree/release#getting-started)

[`1. Installation`](./tutorials/installation.md)

[`2. Getting Started`](./tutorials/getting_started.md)

`3. Advanced`:

- [`Trigger multiple / randoms`][URL_META_CLIPS]
- [`Screen / Media Settings`][URL_ADVANCED_SETTINGS]

[URL_META_CLIPS]: ./tutorials/meta_clips.md
[URL_ADVANCED_SETTINGS]: ./tutorials/screen_clip_advanced_settings.md

___

[`Getting started with Development`](README_DEV.md)

___

## Roadmap 

### 2021.3.0
* [x] Widgets (previously `HTML`) 
  * [x] API for Twitch or Events that its shown and so on
  * [x] Templates
  * [x] Widget-Variables
  * [x] Import / Export Widgets
  * [x] Persistence of the Widget State across Screens
* [x] Custom Port Settings, default Port now on 6363
* [x] Electron can be hidden into the Tray
* [x] "Media Type": `Scripts` for more advanced features
  * [ ] Wait once a triggered clip (inside the script) is done to trigger other stuff
  * [ ] Use custom variables like in the Widget-Variables for easier configs
* [ ] Overview of local media files not existing anymore
* [ ] Overhaul of the Media Creation Dialog(s) 

### 2021.4.0
* [ ] Labels on or around the Media, each with their own Position / Animation
  * [ ] Changeable by Trigger Variables
  * [ ] Can be placed like in the Arrange View
* [ ] OBS Websockets
  * [ ] "Media Type": `OBS Command`
  * [ ] Screen Arrange View gets the current OBS-Scene as Background to move stuff around

### Future, if you want to help open a PR :)
* [ ] Change media options by triggered variables (e.g. different style, or something)
* [ ] Stats per commands / media / or something last cheerer and so on 
* [ ] more to be added :)

## How to help / contribute?
* Improve Docs / Translations
* Find bugs
* Help fix bugs / improve features
* Star it :)

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://www.twitch.tv/littleheroesspark"><img src="https://avatars0.githubusercontent.com/u/1301564?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Aaron Rackley</b></sub></a><br /><a href="https://github.com/negue/meme-box/commits?author=ageddesi" title="Code">💻</a></td>
    <td align="center"><a href="http://twitch.tv/whitep4nth3r"><img src="https://avatars0.githubusercontent.com/u/52798353?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Salma @whitep4nth3r</b></sub></a><br /><a href="https://github.com/negue/meme-box/commits?author=whitep4nth3r" title="Code">💻</a> <a href="#ideas-whitep4nth3r" title="Ideas, Planning, & Feedback">🤔</a> <a href="#design-whitep4nth3r" title="Design">🎨</a></td>
    <td align="center"><a href="https://twitch.tv/gacbl"><img src="https://avatars0.githubusercontent.com/u/2153382?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Igor Ilic</b></sub></a><br /><a href="https://github.com/negue/meme-box/issues?q=author%3Agigili" title="Bug reports">🐛</a> <a href="#ideas-gigili" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/negue/meme-box/commits?author=gigili" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/CrypticEngima"><img src="https://avatars0.githubusercontent.com/u/30286773?v=4?s=100" width="100px;" alt=""/><br /><sub><b>CrypticEngima</b></sub></a><br /><a href="#design-CrypticEngima" title="Design">🎨</a></td>
    <td align="center"><a href="https://github.com/owehmer"><img src="https://avatars.githubusercontent.com/u/45573843?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Oliver</b></sub></a><br /><a href="https://github.com/negue/meme-box/issues?q=author%3Aowehmer" title="Bug reports">🐛</a> <a href="https://github.com/negue/meme-box/commits?author=owehmer" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/jonathanbucci"><img src="https://avatars.githubusercontent.com/u/29556823?v=4?s=100" width="100px;" alt=""/><br /><sub><b>jonathanbucci</b></sub></a><br /><a href="https://github.com/negue/meme-box/commits?author=jonathanbucci" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
