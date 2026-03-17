#!/usr/bin/env node
// Render-safe build: force reinstall vite to fix Bun corruption, then build
import { execSync } from 'child_process';

const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

console.log('[build] Force reinstalling vite to fix Bun/npm conflict...');
run('npm install vite --save-dev --force');

console.log('[build] Running vite build...');
run('node node_modules/vite/bin/vite.js build');
