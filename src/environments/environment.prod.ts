export const IS_HTTPS = location.protocol === 'https:';

export const AppConfig = {
  production: true,
  environment: 'PROD',
  expressBase: `${location.protocol}//${location.hostname}:${location.port}`,
  wsBase: `${IS_HTTPS ? 'wss' : 'ws'}://${location.hostname}:${location.port}`,
  port: location.port
};


console.info('APP CONFIG PROD', AppConfig);
