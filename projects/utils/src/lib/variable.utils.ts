
// TODO how to translate with variables?
export function isDynamicIframeVariableValid(name: string, notAllowedNames: string[]): {ok: boolean, message: string} {
  if (notAllowedNames.includes(name)) {
    return { ok: false, message: `Not allowed to be one of the following names: ${notAllowedNames.join(', ')}`}
  }

  if (name === '') {
    return { ok: false, message:  'A variable needs a name.'};
  }

  if (name.includes(' ')) {
    return { ok: false, message:  `Variable Names can't have spaces in it: "${name}"`};
  }


  return {ok: true, message: ''};
}
