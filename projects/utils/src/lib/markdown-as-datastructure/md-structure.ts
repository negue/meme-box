import jsYaml from 'js-yaml';
import {marked} from 'marked';

export interface MarkdownStructureSection {
  name: string;
  description: string;
  content: unknown;
  highlightType: string;
}

export interface MarkdownStructure {
  metadata: Record<string, unknown>;
  description: string;
  sections: MarkdownStructureSection[]
}


export function toMarkdown (markdownDataStructure: MarkdownStructure){
  const markdownFileStrings = [];

  const yamlMetadata = jsYaml.dump(markdownDataStructure.metadata);
  markdownFileStrings.push(`---\n${yamlMetadata}---`);

  markdownFileStrings.push(markdownDataStructure.description);

  for (const section of markdownDataStructure.sections) {
    markdownFileStrings.push(`# ${section.name}`);

    if (section.description) {
      markdownFileStrings.push(section.description);
    }

    const contentToWrite = section.highlightType === 'json'
      ? JSON.stringify(section.content, null, '  ')
      : section.content;

    const templateBracket = '\`\`\`';

    markdownFileStrings.push(`${templateBracket}${section.highlightType}\n${contentToWrite}\n${templateBracket}`);
  }

  return markdownFileStrings.map(ln => ln.trim()).join('\n\n');
}

export function startNewMarkdownStructure(): MarkdownStructure {
  return {
    metadata: {
      title: '',
      settings: {}
    },
    description: '',
    sections: []
  };
}


export function mdSection (name: string, highlightType: string, content: unknown): MarkdownStructureSection {
  return {
    description: '',
    name,
    highlightType,
    content
  };
}

export function mdSectionAsTypedObject<T>(structure: MarkdownStructure, name: string): T|null {
  const foundSection = structure.sections.find(s => s.name === name);
  if (foundSection) {
   return JSON.parse(foundSection.content as string);
  }
return null;
}


export function mdSectionAsString(structure: MarkdownStructure, name: string): string {
  const foundSection = structure.sections.find(s => s.name === name);
  if (foundSection) {
    return foundSection.content as string;
  }
  return '';
}


export function fromMarkdown (markdownRaw: string) {

  const markdownTokens = marked.lexer(markdownRaw);

  const markdownDataStructure = startNewMarkdownStructure();

  const allMetadataRaw = [];
  const allDescriptionRaw = [];

  let metadataInProcess = false;
  let firstHeaderFound = false;

  let currentSection: MarkdownStructureSection = mdSection('','', null);

  for(const token of markdownTokens) {
    if (token.type === 'hr') {
      if (!metadataInProcess) {
        metadataInProcess = true;

        continue;
      }

      if (metadataInProcess) {
        metadataInProcess = false;
        continue;
      }
    }

    if (metadataInProcess) {
      allMetadataRaw.push(token.raw);
      continue;
    }

    if (token.type === 'heading') {
      // if there was already a header
      // we're adding the currentSection to the list
      if (firstHeaderFound) {
        markdownDataStructure.sections.push(currentSection);

        currentSection = mdSection('','', null);
      }

      firstHeaderFound = true;
      currentSection.name = token.text;
      continue;
    }

    if (!firstHeaderFound) {
      allDescriptionRaw.push(token.raw);
      continue;
    }

    if (token.type !== 'code') {
      currentSection.description += token.raw;
      currentSection.description.trim();
    } else {
      currentSection.content = token.text;
      currentSection.highlightType = token.lang ?? '';
    }
  }

  // adding the last section
  markdownDataStructure.sections.push(currentSection);

  const metaDataRawYaml = allMetadataRaw.join('\n');
  markdownDataStructure.metadata = jsYaml.load(metaDataRawYaml) as Record<string, unknown>;

  markdownDataStructure.description = allDescriptionRaw.join('').trim();

  return markdownDataStructure;
}

