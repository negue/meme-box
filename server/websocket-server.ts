import * as http from "http";
import * as WebSocket from "ws";

// no type ?!
interface WebSocketType {
  send(message: string);
  readyState: number;
}

const server = http.createServer();

const wss = new WebSocket.Server({ server });

const obsPages: {[key: string]: WebSocket} = {};
let wsToSend: WebSocketType[] = [];



wss.on("connection", (ws: WebSocket) => {
  //connection is up, let's add a simple simple event
  ws.on("message", (message: string) => {
    //log the received message and send it back to the client
    console.log("received: %s", message);
    // ws.send(`Hello, you sent -> ${message}`);

    const [action, payload] = message.split('=');

    switch (action) {
      case "I_AM_OBS": {
        obsPages[payload] = ws;
        wsToSend.push(ws);
        break;
      }
      case "TRIGGER_CLIP": {
        wsToSend.forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(message)
          }
        } );

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
    console.log(`WebSocket started on port ${port}`);
  });

  return {server, wss};
}
