#!/usr/bin/env node
// Render-safe build script — avoids Bun/npm conflict breaking vite's symlink
import { execSync } from 'child_process';
import { existsSync } from 'fs';

// Wipe node_modules if vite's internals are missing (Bun conflict)
if (!existsSync('node_modules/vite/dist/node/cli.js')) {
  console.log('[build] vite internals missing — reinstalling with npm...');
  execSync('npm install', { stdio: 'inherit' });
}

console.log('[build] Running vite build...');
execSync('node node_modules/vite/bin/vite.js build', { stdio: 'inherit' });
