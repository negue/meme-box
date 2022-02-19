import {basicSetup, EditorView} from "@codemirror/basic-setup";
import {Extension} from "@codemirror/state";
import {oneDark} from "@codemirror/theme-one-dark";
import {css, cssCompletion} from "@codemirror/lang-css";
import {javascript, javascriptLanguage} from "@codemirror/lang-javascript";
import {html, htmlCompletion} from "@codemirror/lang-html";

const defaultCodemirrorExtensions = [
  basicSetup,
  oneDark,
  EditorView.lineWrapping
];

export const cssCodemirror: Extension[] = [
  ...defaultCodemirrorExtensions,
  css(),
  cssCompletion
];

export const jsCodemirror: Extension[] = [
  ...defaultCodemirrorExtensions,
  javascript(),
  javascriptLanguage
];

export const htmlCodemirror: Extension[] = [
  ...defaultCodemirrorExtensions,
  html(),
  htmlCompletion
];
