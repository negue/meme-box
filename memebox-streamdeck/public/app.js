/* global $CC, Utils, $SD, OBSWebSocket, OBSWebSocket, jsonObj */

/**
 * Here are a couple of wrappers we created to help ypu quickly setup
 * your plugin and subscribe to events sent by Stream Deck to your plugin.
 */

/**
 * The 'connected' event is sent to your plugin, after the plugin's instance
 * is registered with Stream Deck software. It carries the current websocket
 * and other information about the current environmet in a JSON object
 * You can use it to subscribe to events you want to use in your plugin.
 */

$SD.on("connected", jsonObj => connected(jsonObj));
$SD.on("deviceDidConnect", jsonObj => console.log("deviceDidConnect", jsonObj));

async function connected(jsn) {
	/** subscribe to the willAppear and other events */

	console.info('CONNECTED');

  $SD.on(
    "*",
    jsonObj => {
      console.info(jsonObj);
      //action.onKeyUp(jsonObj)
    }
  );

  $SD.on(
    "keyDown",
    jsonObj => {
      console.info('key');
      action.onKeyUp(jsonObj)
    }
  );

	$SD.on(
		"com.memebox.memebox-streamdeck.action.willAppear",
		jsonObj => action.onWillAppear(jsonObj)
	);
	$SD.on(
		"com.memebox.memebox-streamdeck.action.keyUp",
		jsonObj => {
		  console.info('key');
		  action.onKeyUp(jsonObj)
    }
	);
	$SD.on(
		"com.memebox.memebox-streamdeck.action.sendToPlugin",
		jsonObj => action.onSendToPlugin(jsonObj)
	);
	$SD.on(
		"com.memebox.memebox-streamdeck.action.didReceiveSettings",
		jsonObj => action.onDidReceiveSettings(jsonObj)
	);
}

let memeBoxSocket;

// onDidReceiveSettings
// onWillAppear

// create socket
// if disconnect, try again after X seconds
// on key up , if its still on "interval" / get socket

function createOrGetSocket(webSocketTarget) {
  return new Promise((resolve) => {

    if (!memeBoxSocket
      || memeBoxSocket.readyState !== WebSocket.OPEN
      || memeBoxSocket.url !== webSocketTarget) {
      memeBoxSocket = new WebSocket(webSocketTarget);

      memeBoxSocket.onopen = function () {
        console.info('Socket connected!!', {
          webSocketTarget
        });
        resolve(memeBoxSocket);
      };

      return;
    }

    resolve(memeBoxSocket);

  });
}

/** ACTIONS */

const action = {
	settings: {},
	onDidReceiveSettings: function(jsonObj) {
		console.log(
			"%c%s",
			"color: white; background: red; font-size: 15px;",
			"[app.js]onDidReceiveSettings:"
		);
		this.settings[jsonObj.context] = Utils.getProp(jsonObj, "payload.settings", {});
		this.doSomeThing(this.settings, "onDidReceiveSettings", "orange");
	},

	/**
	 * The 'willAppear' event is the first event a key will receive, right before it gets
	 * showed on your Stream Deck and/or in Stream Deck software.
	 * This event is a good place to setup your plugin and look at current settings (if any),
	 * which are embedded in the events payload.
	 */

	onWillAppear: function(jsn) {
		console.log(
			"You can cache your settings in 'onWillAppear'",
			jsn.payload.settings
		);

		/**
		 * "The willAppear event carries your saved settings (if any). You can use these settings
		 * to setup your plugin or save the settings for later use.
		 * If you want to request settings at a later time, you can do so using the
		 * 'getSettings' event, which will tell Stream Deck to send your data
		 * (in the 'didReceiveSettings above)
		 *
		 * $SD.api.getSettings(jsn.context);
		 */
		this.settings[jsn.context] = jsn.payload.settings;

		try {
      console.info('will appear', jsn.payload.settings);

      if (jsn.payload.settings.port) {
       // console.info('Creating a WS');
       // memeBoxSocket = new WebSocket(`ws://localhost:${jsn.payload.settings.port}`)
      }
    }
    catch  {

    }
	},

	onKeyUp: async function(jsn) {

	  const {settings} = jsn.payload;


    const triggerObj = {
      id: settings.clipId,
      repeatX: 0,
      repeatSecond: 0,
    }


    var currentConnection = await createOrGetSocket(settings.targetServer);

    const message = `TRIGGER_CLIP=${JSON.stringify(triggerObj)}`;

    // Triggers the clip
    currentConnection.send(message);

		console.log("onKeyUp", jsn, settings, message);
	},

	onSendToPlugin: function(jsn) {
		/**
		 * this is a message sent directly from the Property Inspector
		 * (e.g. some value, which is not saved to settings)
		 * You can send this event from Property Inspector (see there for an example)
		 */

		const sdpi_collection = Utils.getProp(jsn, "payload.sdpi_collection", {});
		if (sdpi_collection.value) {
			this.doSomeThing(
				{ [sdpi_collection.key]: sdpi_collection.value },
				"onSendToPlugin",
				"fuchsia"
			);
		}
	},

	/**
	 * Here's a quick demo-wrapper to show how you could change a key's title based on what you
	 * stored in settings.
	 * If you enter something into Property Inspector's name field (in this demo),
	 * it will get the title of your key.
	 *
	 * @param {JSON} jsn // the JSON object passed from Stream Deck to the plugin, which contains the plugin's context
	 *
	 */

	setTitle: function(jsn) {
		if (
			this.settings[jsonObj.context] &&
			this.settings[jsonObj.context].hasOwnProperty("mynameinput")
		) {
			console.log(
				"watch the key on your StreamDeck - it got a new title...",
				this.settings[jsonObj.context].mynameinput
			);
			$SD.api.setTitle(jsn.context, this.settings[jsonObj.context].mynameinput);
		}
	},

	/**
	 * Finally here's a methood which gets called from various events above.
	 * This is just an idea how you can act on receiving some interesting message
	 * from Stream Deck.
	 */

	doSomeThing: function(inJsonData, caller, tagColor) {
		console.log(
			"%c%s",
			`color: white; background: ${tagColor || "grey"}; font-size: 15px;`,
			`[app.js]doSomeThing from: ${caller}`
		);
		console.log({ inJsonData });
	}
};
