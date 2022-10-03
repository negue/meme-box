# Building MemeBox from source

The following is a step-by-step guide of how to build MemeBox completely from source. But first, a few tools are required to get started.

## Prerequisites

MemeBox is built almost exclusively with JavaScript/TypeScript. Therefore, Node.js and the Node Package Manager (`npm`) are needed. In addition, a version manager for Node.js is recommended. It allows you to install and use different versions of Node.js at the same time.

Most of this software is likely easiest managed by some kind of software or package manager, like **Chocolatey**/**Scoop** on Windows, **Homebrew** on macOS and **apt**/**dnf**/**pacman**/... on Linux. If you prefer to install these manually, you're free to do so. Each project has either a dedicated website or GitHub project page, with installation instructions.

- `git`: The version control system used to track changes of the project.
- `node`: The Node.js runtime, used for building and running JavaScript based software.
- `nvm`: A version manager for Node.js. There are others like `fnm` or `volta` as well, all with a very similar setup and usage style.

## Clone the repository

First, clone the repo into a local folder and use `npm` to install all required dependencies. Depending on what part of the application you want to build (standalone CLI tool, or Electron application), you might need to switch to a specific Node.js version first.

```sh
git clone https://github.com/negue/meme-box.git # or git@github.com:negue/meme-box
cd meme-box
```

**NOTE:** If you don't want to install Git, or just want to build this as a one-off task, you can instead navigate the GitHub page and download the source as a `*.zip` or `*.tar.gz` archive and extract it locally.

## Headless CLI binary

If you want to build the _headless_ CLI variant use the following commands (for Windows in this example):

```sh
npm install --legacy-peer-deps
npm run build:prepare
npm run build:windows # or build:macos / build:linux
```

On macOS, use `npm build:macos`, on Linux, use `npm build:linux` instead, as the last build step.

Afterwards, the standalone binary can be found in the `release/out/` folder.

## Full application (Electron based)

If you want to build the complete Electron application, which includes the user interface bundled as a regular application, execute the following commands:

```sh
npm install --legacy-peer-deps
npm run electron:build
```

The built application can be found in the `release-electron/` folder, specific to your current operating system.
