import * as express from 'express';
import {PersistenceInstance} from "../persistence";
import {Config, TwitchConfig} from "../../projects/contracts/src/public-api";
import {
  CONFIG_CUSTOM_PORT_PATH,
  CONFIG_OPEN_PATH,
  CONFIG_TWITCH_BOT_INTEGRATION_PATH,
  CONFIG_TWITCH_BOT_PATH,
  CONFIG_TWITCH_CHANNEL_PATH,
  CONFIG_TWITCH_LOG_PATH
} from "../constants";
import {allowedFileUrl} from "../validations";
import {existsSync} from "fs";
import {sep} from 'path';
import open from "open";
import {NEW_CONFIG_PATH} from "../path.utils";

// TODO allow config generic put endpoint

export const CONFIG_ROUTES = express.Router();

CONFIG_ROUTES
  .get('', (req,res) => {
    res.send(PersistenceInstance.getConfig());
  })

.put(CONFIG_TWITCH_CHANNEL_PATH, (req, res) => {
  const twitchConfigBody: TwitchConfig = req.body;

  // update config
  res.send(PersistenceInstance.updateTwitchChannel(twitchConfigBody));
})

// TODO Refactor this config boilerplate !!!

.put(CONFIG_TWITCH_LOG_PATH, (req, res) => {
  const twitchConfigBody: TwitchConfig = req.body;

  // update config
  res.send(PersistenceInstance.updateTwitchLog(twitchConfigBody.enableLog));
})

.put(CONFIG_TWITCH_BOT_INTEGRATION_PATH, (req, res) => {
  // update config
  const {bot} = req.body;
  res.send(PersistenceInstance.updateTwitchBotIntegration(bot));
})

.put(CONFIG_TWITCH_BOT_PATH, (req, res) => {
  // update config
  const {twitch} = req.body;
  res.send(PersistenceInstance.updateTwitchBot(twitch));
})
  .put('', (req, res) => {
    const partialConfig: Partial<Config> = req.body

    const mediaFolder: string = partialConfig.mediaFolder;

    if (mediaFolder) {
      if (!allowedFileUrl(mediaFolder)) {
        res.send({ok: false})
        return;
      }

      if (!mediaFolder.includes(sep)) {
        res.send({ok: false});
        return;
      }

      if (!existsSync(mediaFolder)) {
        res.send({ok: false})
        return;
      }
    }


    // update config
    PersistenceInstance.updatePartialConfig(partialConfig)

    res.send({ok: true});
  })

  // todo validations
  .put(CONFIG_CUSTOM_PORT_PATH, (req, res) => {
    // update port config
    const {newPort} = req.body;
    PersistenceInstance.updateCustomPort(+newPort)

    res.send({
      ok: true
    });
  })

  .get(CONFIG_OPEN_PATH, async (req, res) => {
  await open(NEW_CONFIG_PATH);

  res.send({open: true});
});

