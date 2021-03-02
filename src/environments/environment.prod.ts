export const AppConfig = {
  production: true,
  environment: 'PROD',
  expressBase: `http://${location.hostname}:${location.port}`,
  wsBase: `ws://${location.hostname}:${location.port}`
};


console.info('APP CONFIG PROD', AppConfig);
