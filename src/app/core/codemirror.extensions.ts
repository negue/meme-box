import { basicSetup } from "@codemirror/basic-setup";
import { Extension } from "@codemirror/state";
import { oneDarkTheme } from "@codemirror/theme-one-dark";
import { cssLanguage, css, cssCompletion } from "@codemirror/lang-css";
import { javascript, javascriptLanguage } from "@codemirror/lang-javascript";
import { html, htmlCompletion } from "@codemirror/lang-html";

const defaultCodemirrorExtensions = [
  basicSetup,
  oneDarkTheme
];

export const cssCodemirror: Extension[] = [
  ...defaultCodemirrorExtensions,
  css(),
  cssCompletion
];

export const jsCodemirror: Extension[] = [
  ...defaultCodemirrorExtensions,
  javascript(),
  javascriptLanguage,
];

export const htmlCodemirror: Extension[] = [
  ...defaultCodemirrorExtensions,
  html(),
  htmlCompletion,
];
