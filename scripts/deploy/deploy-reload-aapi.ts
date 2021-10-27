#!/bin/env node

import { execSync, exec } from 'child_process';

const main = async () => {
  exec('git rev-parse --abbrev-ref HEAD', (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }

    const deployment = typeof stdout === 'string' ? stdout.trim() : null;

    if (!deployment || deployment === 'master' || deployment === 'tmp/deploy') {
      console.error('Failed, could not determine deployment branch, or branch is invalid...');
      return;
    }

    try {
      execSync('git branch -D tmp/deploy');
    } catch (err) {
      // do nothing
    }
    execSync('git checkout -b tmp/deploy', { stdio: 'inherit' });
    execSync('git checkout -- ./', { stdio: 'inherit' });
    try {
      execSync(`git branch -D ${deployment}`);
    } catch (err) {
      // do nothing
    }
    execSync('git fetch', { stdio: 'inherit' });
    execSync(`git checkout ${deployment}`, { stdio: 'inherit' });
    execSync('npm run bootstrap:prod', { stdio: 'inherit' });
    execSync('npm run restart:api:prod');
  });
};

main();
