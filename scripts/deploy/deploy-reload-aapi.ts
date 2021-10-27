#!/bin/env node

import { execSync } from 'child_process';

const main = async () => {
  execSync('git branch -D tmp/deploy', { stdio: 'inherit' });
  execSync('git checkout -b tmp/deploy', { stdio: 'inherit' });
  execSync('git fetch && git pull', { stdio: 'inherit' });
  execSync('git checkout -- ./', { stdio: 'inherit' });
  execSync('git checkout 0.9.1', { stdio: 'inherit' });
  execSync('npm run bootstrap:prod', { stdio: 'inherit' });
};

main();
