# Download Meme-Box

Download executable from: https://github.com/negue/meme-box/releases

# Running Meme-Box

Start the downloaded Executable File

**Meme-Box & OBS WebSocket Server Port**

Meme-Box currently uses Port 4444 as the default port. OBS WebSocket also uses this as the default port. If you have the OBS WebSocket Server enabled you will need to change either the Meme-Box or OBS WebSocket port so that they don't conflict. 

If both are running on the same port at the same time, Meme-Box may lose its settings when OBS is running and OBS will show an alert that there is a new WebSocket connection.

To change Meme-Box's default port, add the following to the end of the command line command to start Meme-Box. 

> Note: In the future, I will add the ability to do this in the Meme-Box settings. If you use the Meme-Box Streamdeck plugin, remember to change the port number there to match for each Meme-Box button.

To change the OBS WebSocket port, open OBS Studio, click on Tools, and select WebSocket Server Settings. Change the server port to any other port. Press Okay. After doing this, check on other apps and plugins that rely on the WebSocket to work. You will have to enter the new port and usually renter the WebSocket password. Don't forget to check all of your Streamdeck (or similar) custom plugins after making this change.

## Commandline Options

|Config|Default|Explanation|
|--|--|--|
|`--port=`|`4444`|The *current* Server Port|
|`--config=`| see `Default Config Path` |`Your path to folder/meme-box config`|

## For headless binaries (not Windows):
- you need to add the executable flags to it `chmod +x memebox-file-name`

### Default Config Path

 OS X - `/Users/user/Library/Preferences/meme-box`
  
  Windows - `C:\Users\user\AppData\Roaming\meme-box`
  
  Linux - `/home/user/.local/share/meme-box`

## Media-Folder
- the selected media-folder (inside memebox) needs to be readable for this process

## If you want to use the StreamDeck-Plugin
1. [Download Streamdeck Plugin](../memebox-streamdeck/Release/com.memebox.memebox-streamdeck.streamDeckPlugin)
2. Double click to install it

