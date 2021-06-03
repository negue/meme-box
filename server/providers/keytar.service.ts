import { Service } from "@tsed/di";

const os = require('os');
const path = require('path');

const keytar: typeof import('keytar') = require('nexe-natives')(path.join(__dirname, '..', '..', 'node_modules', 'keytar'), {
  // localPath: os.tmpdir(),
  removeOnExit: false,
});

@Service()
export class KeytarService {
  public async test() {
    const pw = await keytar.getPassword('test', 'user');

    console.info({ pw });
  }
}
