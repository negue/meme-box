import {setCompodocJson} from "@storybook/addon-docs/angular";
import {themes} from '@storybook/theming';

import '../src/styles.scss';

import docJson from "../documentation.json";
import {addDecorator, moduleMetadata} from "@storybook/angular";
import {DarkmodeModule} from "../src/app/darkmode.module";
import {IconsModule} from "../src/app/icons.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HttpClientModule} from "@angular/common/http";

setCompodocJson(docJson);

addDecorator(moduleMetadata({
  imports: [
    DarkmodeModule,
    IconsModule,
    BrowserAnimationsModule,
    HttpClientModule  ]
}));

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  docs: {
    inlineStories: true,
    theme: themes.dark,
  },
  darkMode: {
    // Override the default dark theme
    dark: { ...themes.dark, appBg: '#121212' },
    // Override the default light theme
    // light: { ...themes.normal, appBg: 'red' },

    // Set the initial theme
    current: 'dark'
  }
}


