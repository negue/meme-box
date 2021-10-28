import {exec, spawn} from 'child_process';

// since its only one layer, a simple Object.freeze is enough (to prevent overrides)
export const ProcessApi = Object.freeze({
  exec (pathToExecute) {
    return exec (pathToExecute);
  },
  spawn (pathToSpawn, spawnArguments: string[] = []) {
    return spawn(pathToSpawn, spawnArguments);
  }
});
