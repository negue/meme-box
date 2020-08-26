import * as http from "http";
import * as WebSocket from "ws";
import {ACTIONS, TriggerClip} from "../projects/contracts/src/lib/actions";
import {PersistenceInstance} from "./persistence";

// no type ?!
interface WebSocketType {
  send(message: string);
  readyState: number;
}

const server = http.createServer();

const wss = new WebSocket.Server({ server });

const obsPages: {[key: string]: WebSocketType} = {};
let wsToSend: WebSocketType[] = [];

export function sendDataToScreen(targetId: string|null, message: string) {
  console.info('SENDING DATA TO', targetId, message);
  if (obsPages[targetId] && obsPages[targetId].readyState === WebSocket.OPEN) {
    obsPages[targetId].send(message);
    console.info('SENT DATA TO', targetId);
  }
}

// todo refactor?
// currently only the server tell which WS to do stuff
export function sendDataToAllSockets (message: string) {
  wsToSend.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message)
    }
  });
}

export function triggerMediaClipById(payloadObs: TriggerClip) {
  var allScreens = PersistenceInstance.listScreens();

  for (const screen of allScreens) {
    if (screen.clips[payloadObs.id]) {
      const newMessageObj = {
        ...payloadObs,
        targetScreen: screen.id
      };

      sendDataToScreen(screen.id, `${ACTIONS.TRIGGER_CLIP}=${JSON.stringify(newMessageObj)}`);
    }
  }
}

wss.on("connection", (ws: WebSocket) => {
  //connection is up, let's add a simple simple event
  ws.on("message", (message: string) => {
    //log the received message and send it back to the client
    console.log("received: %s", message);
    // ws.send(`Hello, you sent -> ${message}`);

    // ACTION={payload}
    const [action, payload] = message.split('=');

    console.info({action, payload});

    switch (action) {
      case ACTIONS.I_AM_OBS: {
        obsPages[payload] = ws;
        wsToSend.push(ws);
        break;
      }
      case ACTIONS.TRIGGER_CLIP: {
        const payloadObs: TriggerClip = JSON.parse(payload);

        console.info('TRIGGER', payloadObs);

        if (!payloadObs.targetScreen) {
          console.info('NO TARGET');

          triggerMediaClipById(payloadObs);
        } else {
          sendDataToScreen(payloadObs.targetScreen, message);
        }

        break;
      }
      case ACTIONS.RELOAD_SCREEN: {
        sendDataToScreen(payload, message);
        break;
      }
    }

  });

  //send immediatly a feedback to the incoming connection
  ws.send("Hi there, I am a WebSocket server");
});

export function createWebSocketServer(port) {
  //start our server
  server.listen(port, () => {
    console.log(`Server started on port: ${port}`);
  });

  return {server, wss};
}
