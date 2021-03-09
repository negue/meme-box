
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

### Electron

```
npm run electron:build
```

### Folders
Client is in `src/app`

Server is in `main.ts` and `server/*`

Streamdeck-Plugin is in `memebox-streamdeck`

### Development Roadmap

- [ ] cleanup shared constants
- [ ] strict tsconfig / eslint rules
- [ ] Use [`ts.ed`](https://tsed.io/) to improve the backend code by dependency injection and code 
- [ ] Probably more to come once more features are added :)
