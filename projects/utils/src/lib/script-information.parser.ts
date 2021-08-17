const actionDeclarationRegex = /(?:var|const|let) ([\w-]+)\s=\s\w*.(?:getMedia|getAction)\(\'([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})/gm;

export interface ActionEntry {
  variableName: string;
  uuid: string;
}

export function returnDeclaredActionEntries (
  source: string
): ActionEntry[] {
  const results: ActionEntry[] = [];

  for (const [, variableName, uuid] of source.matchAll(actionDeclarationRegex)) {
    results.push({
      variableName,
      uuid
    })
  }

  return results;
}

