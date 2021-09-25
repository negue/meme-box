import {IsUndefinedPipe} from './is-undefined.pipe';

describe('IsUndefinedPipe', () => {
  it('create an instance', () => {
    const pipe = new IsUndefinedPipe();
    expect(pipe).toBeTruthy();
  });
});
