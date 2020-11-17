import {ReadableMsPipe} from './readable-ms.pipe';

describe('ReadableMsPipe', () => {
  it('create an instance', () => {
    const pipe = new ReadableMsPipe();
    expect(pipe).toBeTruthy();
  });
});
