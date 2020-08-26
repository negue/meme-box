export const AppConfig = {
  production: true,
  environment: 'PROD',
  ngModules: [

  ],
  expressBase: `http://${location.hostname}:${location.port}`,
  wsBase: `ws://${location.hostname}:${location.port}`
};
