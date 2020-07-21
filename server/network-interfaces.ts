import * as os from "os";
import {NetworkInfo} from "../projects/contracts/src/lib/types";

export function listNetworkInterfaces(): NetworkInfo[] {
  const ifaces = os.networkInterfaces();

  const result = [];

  Object.keys(ifaces).forEach(function (ifname) {
    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }

      result.push({
        ifname,
        address: iface.address
      });
    });
  });

  return result;
}
