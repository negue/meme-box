# Screen / Clip Advanced Settings

These are specific options on this specific media assigned the screen, such as size, positions, animations and so on

## Visibility

- **Play**: This option is used to show it and after its `Visible screen time` / `Play time on screen` is done, it will be hidden
- **Static**: Its always visible
- **Toggle**: Each trigger will either show or hide it, the `Screen Times` are ignored here

## Size

Width & Height can be either `Percent %`-Values or Pixels, or other CSS sizes

## Animations

Animations can be applied on show and hide effect.

The Visibility will be applied like that:

`Animation IN` => `Once done, it'll be "played"` => `Once done or timeout` => `Animation OUT`

## Positions

- **Fullscreen**: If there are no `Width/Height` applied, it will be just "fullscreen"
- **Centered**: 
  - If there are no `Width/Height` applied, it will be just "fullscreen"
  - But with `Width/Height` it will be centered
- **Fixed**: Here you can use your own values for `left`/`right`/`top`/`bottom`
- **Random**: On each trigger, It creates new `left`/`top` values but also tries to calculate sizes so that its "always" visible
