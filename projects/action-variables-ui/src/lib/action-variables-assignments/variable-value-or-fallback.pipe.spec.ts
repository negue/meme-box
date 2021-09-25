import {VariableValueOrFallbackPipe} from './variable-value-or-fallback.pipe';

describe('VariableValueOrFallbackPipe', () => {
  it('create an instance', () => {
    const pipe = new VariableValueOrFallbackPipe();
    expect(pipe).toBeTruthy();
  });
});
