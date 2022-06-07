require('chai/register-expect');  // Using Expect style

require('ts-node').register({
  compiler: 'ttypescript',
  project: './tsconfig.server-tests.json',
});
