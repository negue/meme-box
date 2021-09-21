import {ShowOnlyLastCharactersPipe} from './show-only-last-characters.pipe';

describe('ShowOnlyLastCharactersPipe', () => {
  it('create an instance', () => {
    const pipe = new ShowOnlyLastCharactersPipe();
    expect(pipe).toBeTruthy();
  });

  it('does not truncate empty string', () => {
    const pipe = new ShowOnlyLastCharactersPipe();
    expect(pipe.transform(null, 0)).toBe('');
    expect.stringContaining('')
  });


  it('does not truncate under the wished length', () => {
    const pipe = new ShowOnlyLastCharactersPipe();
    expect(pipe.transform('efgh', 6)).toMatch('efgh');
  });

  it('does not truncate under the wished length', () => {
    const pipe = new ShowOnlyLastCharactersPipe();
    expect(pipe.transform('abcdefgh', 6)).toMatch('...fgh');
  });
});
