# Types

Meme-Box has the following types of clips that could be triggered:

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

This Type needs to have fixed value of `Visible screen time`.


### HTML

With this type you can create your own "Widgets", with custom HTML, CSS and JS.

This Type needs to have fixed value of `Visible screen time`.


### Meta


Meta Types are used to combine others, like Image and Audio, or triggered a random Clip of the tagged Items.

Example of:
- [Combine Audio and Image](./meta_combine_clips.md)
- [Trigger one random Clip](./meta_trigger_random.md)
- [Trigger all items with a delay](./meta_trigger_all_delay)
