
## Getting Started with development

1. Clone this repo
2. Run the following commands in the root to start both the server and web app.
   http://localhost:4200 opens automatically.

```sh
npm install
npm run start:all

# if you want to work on the server, its easier to start client / server separately
# that way you only have to restart the server alone
npm run start:app
npm run start:server
```

## Building the binaries

### Headless

```
# Builds angular app, server and "prepares it" 
npm run build:prepare

npm run build:all // or build:windows 
```

### Building helpers

`npm run build:server:wo:vm2` build the headless w/o vm2
so that you can get the real stats.json (otherwise this file is overridden by the 3 other files of vm2 that somehow are added to the output)

### Electron

Developing with Electron:

- `npm run start:app`
- `npm run electron:serve` (compiles only ts to js and runs the js)

if you want to test the "build" version you can use `npm run electron:build:serve`
this compiles it from ts to js, combines it all into one file (excluding electron which is handled by electron itself) and serves this one file

Build the Angular App and electron for the current OS

```
npm run electron:build
```

### Folders
Client is in `src/app`

Server is in `electron-shell.ts` and `server/*`

Streamdeck-Plugin is in `memebox-streamdeck`

### Development Roadmap

- [ ] cleanup shared constants
- [ ] strict tsconfig / eslint rules
- [ ] Probably more to come once more features are added :)
- [ ] Fill STACK.md
