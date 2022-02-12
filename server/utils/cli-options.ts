const PORT_OPTION_ARGUMENT = '--port';
const CONFIG_OPTION_ARGUMENT = '--config';
const MEDIA_OPTION_ARGUMENT = '--media';
const OPEN_PAGE_IN_BROWSER_ARGUMENT = '--open';
const CI_TEST_MODE_ARGUMENT = '--cli-test-mode';

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

const PORT = extractValue<number>(PORT_OPTION_ARGUMENT, val => +val);
const CONFIG_PATH = extractValue<string>(CONFIG_OPTION_ARGUMENT);
const MEDIA_PATH = extractValue<string>(MEDIA_OPTION_ARGUMENT);
const OPEN_BROWSER = extractValue<boolean>(OPEN_PAGE_IN_BROWSER_ARGUMENT, val => val == 'true');
const CI_TEST_MODE = extractValue<boolean>(CI_TEST_MODE_ARGUMENT, val => val == 'true');

export const CLI_OPTIONS = {
  PORT,
  CONFIG_PATH,
  MEDIA_PATH,
  OPEN_BROWSER,
  CI_TEST_MODE,
};
