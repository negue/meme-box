const cssTransformRegex  = /\s?([a-zA-Z3]{1,12})\s?\(([0-9a-z\-.,\s]+)\)\s?/gm;

export function parseTransformValues (transformString: string): {
  names: string[];
  values: string[];
} {
  const names = [];
  const values = [];

  for (const foundArray of transformString.matchAll(cssTransformRegex)) {
    names.push(foundArray[1]);
    values.push(foundArray[2]);
  }

  return {
    names,
    values
  };
}
