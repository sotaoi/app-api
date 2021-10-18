#!/bin/env node

import { execSync } from 'child_process';

const main = async () => {
  execSync('npm run start:api:prod', { stdio: 'inherit' });
  execSync('git checkout -- ./', { stdio: 'inherit' });
  execSync('git pull', { stdio: 'inherit' });
  execSync('npm run bootstrap:prod', { stdio: 'inherit' });
  execSync('npm run restart:api:prod', { stdio: 'inherit' });
};

main();
