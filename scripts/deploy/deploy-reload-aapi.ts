#!/bin/env node

import { execSync } from 'child_process';

const main = async () => {
  execSync('npm run start:api:prod', { stdio: 'inherit' });
  execSync('git checkout -- ./', { stdio: 'inherit' });
  execSync('git pull', { stdio: 'inherit' });
  execSync('npm run bootstrap:prod');
  execSync('npm install -D ./');
  execSync('npm run restart:api:prod', { stdio: 'inherit' });
};

main();
