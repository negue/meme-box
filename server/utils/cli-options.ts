const PORT_OPTION_PREFIX = '--port';
const CONFIG_OPTION_PREFIX = '--config';
const MEDIA_OPTION_PREFIX = '--media';
const OPEN_PAGE_IN_BROWSER_PREFIX = '--open';

function extractValue<T>(
  optionPrefix: string,
  // typed version of T result doesnt work, otherwise open a PR! thank you
  convertFunction: (val: string) => any = val => val
) : T | null {
 const optionExists = process.argv.find(arg => arg.includes(optionPrefix));

 if (optionExists) {
   const valueOfOption = optionExists.replace(`${optionPrefix}=`, '')

   return convertFunction(valueOfOption) as T;
 }

 return null;
}

const PORT = extractValue<number>(PORT_OPTION_PREFIX, val => +val);
const CONFIG_PATH = extractValue<string>(CONFIG_OPTION_PREFIX);
const MEDIA_PATH = extractValue<string>(MEDIA_OPTION_PREFIX);
const OPEN_BROWSER = extractValue<boolean>(OPEN_PAGE_IN_BROWSER_PREFIX, val => val == 'true');

export const CLI_OPTIONS = {
  PORT,
  CONFIG_PATH,
  MEDIA_PATH,
  OPEN_BROWSER,
};
