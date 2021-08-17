import {returnDeclaredActionEntries} from "./script-information.parser";

describe('returnDeclaredActionEntries', () => {
  it('returns a const action', () => {
    const src = `
      const action1 = memebox.getMedia('2e2c84c8-1b5d-4911-b831-fb933d9249e3')
    `;

    const foundActions = returnDeclaredActionEntries(src);

    expect(foundActions.length).toBe(1);
    expect(foundActions[0].variableName).toBe('action1');
  });

  it('returns a let+var action', () => {
    const src = `
      let action2 = memebox.getMedia('2e2c84c8-1b5d-4911-b831-fb933d9249e3')
      var action3 = memebox.getMedia('2e2c84c8-1b5d-4911-b831-fb933d9249e3')
    `;

    const foundActions = returnDeclaredActionEntries(src);

    expect(foundActions.length).toBe(2);
    expect(foundActions[0].variableName).toBe('action2');
    expect(foundActions[1].variableName).toBe('action3');
  });
});
