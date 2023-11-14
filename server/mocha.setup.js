require('chai/register-expect');  // Using Expect style

require('ts-node').register({
  compiler: 'ts-patch/compiler',
  project: './tsconfig.server-tests.json',
});
