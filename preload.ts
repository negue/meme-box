import {contextBridge, ipcRenderer} from 'electron';

console.log('preload.js loaded');

export const electronAPIKey = 'electron';

export const electronAPI = {
  electronIpcSend: (channel: string, ...arg: any): void  => {
    ipcRenderer.send(channel, arg);
  },
  electronIpcSendSync: (channel: string, ...arg: any) => {
    return ipcRenderer.sendSync(channel, arg);
  },
  electronIpcOn: (channel: string, listener: (event: any, ...arg: any) => void): void  => {
    ipcRenderer.on(channel, listener);
  },
  electronIpcOnce: (channel: string, listener: (event: any, ...arg: any) => void): void  => {
    ipcRenderer.once(channel, listener);
  },
  electronIpcRemoveListener:  (channel: string, listener: (event: any, ...arg: any) => void): void  => {
    ipcRenderer.removeListener(channel, listener);
  },
  electronIpcRemoveAllListeners: (channel: string): void  => {
    ipcRenderer.removeAllListeners(channel);
  }
};

contextBridge.exposeInMainWorld(
  electronAPIKey, electronAPI
);
