import {LazyArrayPipe} from './lazy-array.pipe';

describe('LazyArrayPipe', () => {
  it('create an instance', () => {
    const pipe = new LazyArrayPipe();
    expect(pipe).toBeTruthy();
  });
});
