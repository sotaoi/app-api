#!/bin/env node

import { execSync } from 'child_process';

const main = async () => {
  const deployment = '0.9.1';
  try {
    execSync('git branch -D tmp/deploy');
  } catch (err) {
    // do nothing
  }
  execSync('git checkout -b tmp/deploy', { stdio: 'inherit' });
  try {
    execSync(`git branch -D ${deployment}`);
  } catch (err) {
    // do nothing
  }
  execSync('git fetch', { stdio: 'inherit' });
  execSync('git checkout -- ./', { stdio: 'inherit' });
  execSync(`git checkout ${deployment}`, { stdio: 'inherit' });
  execSync('npm run bootstrap:prod', { stdio: 'inherit' });
};

main();
