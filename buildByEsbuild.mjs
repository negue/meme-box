import * as esbuild from 'esbuild'
import esbuildPluginTsc from 'esbuild-plugin-tsc';

const tsConfigPath = 'server/tsconfig.server.json';

esbuild.build({
  entryPoints: ['server/server.ts'],
  bundle: true,
  outdir: 'build/server-esbuild',
  platform: 'node',
  packages: 'external',
  target: 'esnext',

  external: ['vm2', 'consolidate'],
  format: 'cjs',
  treeShaking: true,
  legalComments: 'external',
  tsconfig: tsConfigPath,
  plugins: [
     esbuildPluginTsc({
       tsconfigPath: tsConfigPath,

     }),
  ]
})
