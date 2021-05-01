import {TriggerClip} from "@memebox/contracts";
import {CURRENT_MEMEBOX_WEBSOCKET} from "./providers/websockets/memebox.websocket";

// Once all services are in the TsED way - these functions can be removed

export async function triggerMediaClipById(payloadObs: TriggerClip) {
  return CURRENT_MEMEBOX_WEBSOCKET.triggerMediaClipById(payloadObs);
}


export async function sendDataToAllSockets(message: string) {
  return CURRENT_MEMEBOX_WEBSOCKET.sendDataToAllSockets(message);
}
