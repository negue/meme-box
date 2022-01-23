import { parseTransformValues } from "./css-utils";

describe('css-utils', () => {
  it('returns the needed values of transform string', () => {
    const src = `
      rotate(-80deg) matrix3d(1.26304,-0.0645902,0,0.00119025,0.125694,1.25375,0,0.000405416,0,0,1,0,131.234,69.9731,0,1)
    `;

    const foundValues = parseTransformValues(src);

    expect(foundValues.names).toStrictEqual(["rotate", "matrix3d"]);
    expect(foundValues.values).toStrictEqual([
      "-80deg", "1.26304,-0.0645902,0,0.00119025,0.125694,1.25375,0,0.000405416,0,0,1,0,131.234,69.9731,0,1"
    ]);
  });
});
