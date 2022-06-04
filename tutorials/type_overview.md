# Types

Meme-Box has the following types of medias that could be triggered:

## Simple

These Items can be easily selected from `Media-Folder`-List, if you have the Folder selected. 
If you want to use online files, just paste the online URL to it.

The file types that can be used varies of the `Target-Screen` (Browser or OBS).

### Image

Known & Tested: 
- `JPG` / `JPEG`
- `PNG`
- `WebP`

This Type needs to have fixed value of `Visible screen time`.

### Audio

Known & Tested:
- `MP3`
- `WebM`

If no `Play time on screen` is set, the full clip will the played and after that hidden / stopped.

### Video

Known & Tested:
- `MP4`
- `WebM`

If no `Play time on screen` is set, the full clip will the played and after that hidden / stopped.

## Advanced

### Iframe

This will show the Iframe of `URL` in your target-screen.

> Note: This Type needs to have fixed value of `Visible screen time`.


### [Widgets](./widgets.md)

With this type you can create your own Widgets, with custom HTML, CSS and JS.

Also including a Widget-API to access Twitch-Events or a Persistence-State.

You can also  declare variables for easier way to change the "Widget-Settings".

Or import / export these Widgets.

> Note: This Type needs to have fixed value of `Visible screen time`.


### [Recipe](./recipe.md)

### [Scripts](./scripts.md)

### Permanent Scripts

These are mostly the same as normal Scripts, but they cant be triggered by other sources.

And they have to access to all events - so that you can create custom logic like "Bots"
